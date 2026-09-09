package com.example.ngrxcrud.api.service;

import com.example.ngrxcrud.api.model.Saving;
import com.example.ngrxcrud.api.model.SavingStatus;
import com.example.ngrxcrud.api.model.SavingType;
import com.example.ngrxcrud.api.repository.SavingRepository;
import com.example.ngrxcrud.api.repository.SavingTypeRepository;
import com.example.ngrxcrud.api.repository.SettingRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class SavingService {

    public static final String SAVING_REQUIRES_APPROVAL_KEY = "saving_requires_approval";
    public static final String MANDATORY_PARTIAL_PAYMENT_KEY = "mandatory_partial_payment";
    public static final String MANDATORY_OVERFLOW_TO_VOLUNTARY_KEY = "mandatory_overflow_to_voluntary";
    public static final String MANDATORY_SAVING_TYPE_KEY = "mandatory_saving_type_id";

    @Autowired
    private SavingRepository savingRepository;
    @Autowired
    private SavingTypeRepository savingTypeRepository;
    @Autowired
    private SettingRepository settingRepository;
    @Autowired
    private JournalEntryService journalEntryService;
    @Autowired
    private SavingTypeService savingTypeService;
    @Autowired
    private MemberSavingPeriodService memberSavingPeriodService;

    /**
     * Reads the global "requires approval" setting. When enabled, new savings
     * enter the PENDING state and only post to the ledger once approved.
     */
    public boolean requiresApproval() {
        return settingRepository.findByKey(SAVING_REQUIRES_APPROVAL_KEY)
                .map(s -> Boolean.parseBoolean(s.getValue()))
                .orElse(false);
    }

    /**
     * Creates a saving. If approval is enabled the saving starts PENDING (no
     * ledger posting); otherwise it is POSTED immediately.
     */
    @Transactional
    public Saving createSaving(Saving saving) {
        double overflow = validateMinimumAmount(saving);
        reconcileTracker(saving, overflow);
        saving.setStatus(requiresApproval() ? SavingStatus.PENDING : SavingStatus.POSTED);
        if (saving.getCreatedAt() == null) {
            saving.setCreatedAt(System.currentTimeMillis());
        }
        Saving saved = savingRepository.save(saving);
        if (SavingStatus.resolve(saved.getStatus()).postsToLedger()) {
            postToLedger(saved);
        }
        sweepOverflowToVoluntary(saved, overflow);
        return saved;
    }

    /**
     * Approves a PENDING saving and posts it to the ledger.
     * PENDING → POSTED
     */
    @Transactional
    public Saving approveSaving(UUID id, UUID approvedBy) {
        Saving saving = getSaving(id);
        SavingStatus status = SavingStatus.resolve(saving.getStatus());
        if (!status.canApprove()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Only PENDING savings can be approved");
        }
        saving.setStatus(SavingStatus.POSTED);
        saving.setApprovedBy(approvedBy);
        saving.setApprovedAt(System.currentTimeMillis());
        Saving saved = savingRepository.save(saving);
        postToLedger(saved);
        return saved;
    }

    /**
     * Rejects a PENDING saving. No ledger entries are created.
     * PENDING → REJECTED
     */
    @Transactional
    public Saving rejectSaving(UUID id) {
        Saving saving = getSaving(id);
        SavingStatus status = SavingStatus.resolve(saving.getStatus());
        if (!status.canReject()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Only PENDING savings can be rejected");
        }
        saving.setStatus(SavingStatus.REJECTED);
        return savingRepository.save(saving);
    }

    /**
     * Updates a non-POSTED saving. POSTED records are locked.
     */
    @Transactional
    public Saving updateSaving(UUID id, Saving incoming) {
        Saving existing = getSaving(id);
        SavingStatus status = SavingStatus.resolve(existing.getStatus());
        if (!status.canEdit()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Posted savings cannot be edited");
        }
        double oldAmount = existing.getSavingAmount();
        long oldDate = existing.getSavingDate();
        double overflow = validateMinimumAmount(incoming);
        reconcileTrackerUpdate(existing, incoming, overflow);
        existing.setMemberId(incoming.getMemberId());
        existing.setSavingAmount(incoming.getSavingAmount());
        existing.setSavingDate(incoming.getSavingDate());
        existing.setFtp(incoming.getFtp());
        existing.setSavingType(incoming.getSavingType());
        existing.setAccountId(incoming.getAccountId());
        existing.setRemark(incoming.getRemark());
        if (incoming.getStatus() != null) {
            existing.setStatus(incoming.getStatus());
        }
        Saving saved = savingRepository.save(existing);
        sweepOverflowToVoluntary(saved, overflow);
        return saved;
    }

    /**
     * Deletes a non-POSTED saving (and any orphaned journal entries).
     */
    @Transactional
    public void deleteSaving(UUID id) {
        Saving saving = getSaving(id);
        memberSavingPeriodService.reconcileDeletedSaving(
                saving.getMemberId(), saving.getSavingType(),
                saving.getSavingAmount(), saving.getSavingDate());
        SavingStatus status = SavingStatus.resolve(saving.getStatus());
        if (!status.canDelete()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Posted savings cannot be deleted");
        }
        journalEntryService.deleteEntriesByTargetId(id);
        savingRepository.deleteById(id);
    }

    /**
     * Returns the per-month tracker rows for the member on the mandatory
     * saving type. Empty list if the member has no mandatory saving history.
     */
    public List<Map<String, Object>> getTracker(UUID memberId) {
        Optional<UUID> mandatoryId = memberSavingPeriodService.getConfiguredMandatoryTypeId();
        if (mandatoryId.isEmpty()) return List.of();
        return memberSavingPeriodService.trackerForMember(memberId, mandatoryId.get());
    }

    // ---------------------------------------------------------------- validation

    /**
     * Validates the minimum amount for a member saving.
     * <ul>
     *   <li>Non-mandatory types: amount must be >= current minimum on the type.</li>
     *   <li>Mandatory types when partial payments are disabled: the amount must
     *       cover the oldest unpaid month in order, with any surplus flagged for
     *       overflow to voluntary.</li>
     *   <li>Mandatory types when partial payments are enabled: amount must be
     *       positive; the period row is updated and status recomputed.</li>
     * </ul>
     * Returns the overflow amount (surplus above fully-covered months) when
     * overflow-to-voluntary is enabled, or 0 otherwise.
     */
    private double validateMinimumAmount(Saving saving) {
        if (saving.getSavingType() == null) {
            return 0;
        }
        SavingType type = savingTypeRepository.findById(saving.getSavingType()).orElse(null);
        if (type == null) {
            return 0;
        }
        if (!type.getIsMandatory()) {
            double min = type.getMinimumAmount() == null ? 0.0 : type.getMinimumAmount();
            if (saving.getSavingAmount() == null || saving.getSavingAmount() < min) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        String.format(
                                "Minimum amount for saving type \"%s\" is ETB %.2f; the entered amount is below the requirement.",
                                type.getName(), min));
            }
            return 0;
        }

        // Mandatory type
        if (!memberSavingPeriodService.isPartialPaymentAllowed()) {
            return validateMandatoryFullMode(saving);
        }

        // Partial-allowed mode: any positive amount accepted
        Double amount = saving.getSavingAmount();
        if (amount == null || amount <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Saving amount must be positive");
        }
        return 0;
    }

    /**
     * Mode A (full-month enforcement): amount must cover oldest unpaid month(s)
     * in order, with optional overflow sweep to voluntary.
     * Returns the overflow amount to sweep, or throws if the amount does not
     * cover even one full month.
     */
    private double validateMandatoryFullMode(Saving saving) {
        UUID memberId = saving.getMemberId();
        UUID typeId = saving.getSavingType();
        double amount = saving.getSavingAmount();
        long date = saving.getSavingDate() != null ? saving.getSavingDate() : System.currentTimeMillis();
        int ym = MemberSavingPeriodService.yearMonthOf(date);

        double required = memberSavingPeriodService.requiredAmountFor(memberId, typeId, ym, date);

        // Get arrears (oldest unpaid/partial months)
        List<Map<String, Object>> arrears = memberSavingPeriodService.arrearsMap(memberId, typeId);
        // Also include the current month if it's unpaid
        boolean currentMonthListed = arrears.stream().anyMatch(m -> (int) m.get("yearMonth") == ym);
        if (!currentMonthListed) {
            Map<String, Object> cur = new LinkedHashMap<>();
            cur.put("yearMonth", ym);
            cur.put("requiredAmount", required);
            cur.put("remaining", required);
            arrears.add(0, cur);
        }

        double remainingNeeded = arrears.stream()
                .mapToDouble(m -> ((Number) m.get("requiredAmount")).doubleValue())
                .sum();

        // Filter only months that still need payment (required - paid > 0)
        List<Map<String, Object>> unpaidMonths = new ArrayList<>();
        double totalUnpaidRequired = 0;
        for (Map<String, Object> m : arrears) {
            double req = ((Number) m.get("requiredAmount")).doubleValue();
            double paid = 0; // arrearsMap only includes non-PAID, each has remaining = required
            // approximate: remaining is what's needed
            totalUnpaidRequired += req;
            unpaidMonths.add(m);
        }

        // The amount must at least cover the earliest unpaid month fully
        double earliestRequired = unpaidMonths.isEmpty()
                ? required
                : ((Number) unpaidMonths.get(0).get("requiredAmount")).doubleValue();

        if (amount < earliestRequired) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    String.format(
                            "Mandatory saving \"%s\" requires ETB %.2f for %s (oldest unpaid month). "
                            + "Enter at least ETB %.2f to cover this month, or pay the full remaining "
                            + "balance to clear all arrears.",
                            savingTypeRepository.findById(typeId).map(SavingType::getName).orElse(""),
                            earliestRequired,
                            MemberSavingPeriodService.formatYearMonth((int) unpaidMonths.get(0).get("yearMonth")),
                            earliestRequired));
        }

        // Allocate to months in order
        double left = amount;
        double overflow = 0;
        for (Map<String, Object> m : unpaidMonths) {
            double req = ((Number) m.get("requiredAmount")).doubleValue();
            if (left >= req) {
                left -= req;
            } else {
                break;
            }
        }
        overflow = left;

        // If overflow and overflow-to-voluntary enabled, flag for sweep
        if (overflow > 0 && memberSavingPeriodService.isOverflowToVoluntaryEnabled()) {
            return overflow;
        } else if (overflow > 0 && !memberSavingPeriodService.isOverflowToVoluntaryEnabled()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    String.format(
                            "Amount exceeds the mandatory requirement. Remaining ETB %.2f will be saved to voluntary after clearing all arrears. "
                            + "Confirm, or adjust the amount to pay only the mandatory balance.",
                            overflow));
        }
        return 0;
    }

    // ---------------------------------------------------------------- tracker reconciliation

    /** Writes/updates the period row for a newly created mandatory saving.
     * The overflow portion (surplus above fully-covered months) is excluded
     * from the mandatory period and swept to voluntary by the caller. */
    private void reconcileTracker(Saving saving, double overflow) {
        if (saving.getSavingType() == null) return;
        SavingType type = savingTypeRepository.findById(saving.getSavingType()).orElse(null);
        if (type == null || !type.getIsMandatory()) return;
        double mandatoryPortion = saving.getSavingAmount() - Math.max(0, overflow);
        memberSavingPeriodService.reconcileNewSaving(
                saving.getMemberId(), saving.getSavingType(),
                mandatoryPortion, saving.getSavingDate());
    }

    /** Adjusts the period row when an existing saving is updated. */
    private void reconcileTrackerUpdate(Saving oldSaving, Saving incoming, double overflow) {
        if (incoming.getSavingType() == null) return;
        SavingType type = savingTypeRepository.findById(incoming.getSavingType()).orElse(null);
        if (type == null || !type.getIsMandatory()) return;
        if (!oldSaving.getSavingType().equals(incoming.getSavingType())
                || !oldSaving.getSavingDate().equals(incoming.getSavingDate())) {
            double mandatoryPortion = incoming.getSavingAmount() - Math.max(0, overflow);
            memberSavingPeriodService.reconcileUpdatedSaving(
                    oldSaving.getMemberId(), incoming.getSavingType(),
                    oldSaving.getSavingAmount(), oldSaving.getSavingDate(),
                    mandatoryPortion, incoming.getSavingDate());
            return;
        }
        double mandatoryPortion = incoming.getSavingAmount() - Math.max(0, overflow);
        memberSavingPeriodService.reconcileNewSaving(
                incoming.getMemberId(), incoming.getSavingType(),
                mandatoryPortion, incoming.getSavingDate());
    }

    /** If overflow > 0 and overflow-to-voluntary is enabled, auto-creates a
     * voluntary saving record so total money is conserved. */
    private void sweepOverflowToVoluntary(Saving saved, double overflow) {
        if (overflow <= 0) return;
        if (!memberSavingPeriodService.isOverflowToVoluntaryEnabled()) return;
        Optional<SavingType> vol = memberSavingPeriodService.findVoluntaryType();
        if (vol.isEmpty()) return;
        SavingType type = savingTypeRepository.findById(saved.getSavingType()).orElse(null);
        if (type == null) return;
        // Auto-record the surplus as a separate voluntary saving record
        Saving volSaving = new Saving();
        volSaving.setMemberId(saved.getMemberId());
        volSaving.setSavingType(vol.get().getId());
        volSaving.setAccountId(saved.getAccountId());
        volSaving.setSavingAmount(overflow);
        volSaving.setSavingDate(saved.getSavingDate());
        volSaving.setFtp(saved.getFtp() + " (overflow)");
        volSaving.setRemark("Overflow from mandatory saving " + saved.getId());
        volSaving.setStatus(SavingStatus.POSTED);
        volSaving.setCreatedAt(System.currentTimeMillis());
        savingRepository.save(volSaving);
        // Post to ledger
        journalEntryService.recordDebitEntry(
                volSaving.getAccountId(), volSaving.getId(), volSaving.getFtp(),
                volSaving.getSavingDate(), "Voluntary saving (overflow)", volSaving.getSavingAmount());
        journalEntryService.recordCreditEntry(
                type.getAccountId(), volSaving.getId(), volSaving.getFtp(),
                volSaving.getSavingDate(), "Voluntary saving (overflow)", volSaving.getSavingAmount());
    }

    // ---------------------------------------------------------------- ledger

    private Saving getSaving(UUID id) {
        return savingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Saving not found"));
    }

    private void postToLedger(Saving saving) {
        SavingType type = savingTypeRepository.findById(saving.getSavingType())
                .orElseThrow(() -> new RuntimeException("Saving type not found"));

        // DEBIT bank account (cash received)
        journalEntryService.recordDebitEntry(
                saving.getAccountId(),
                saving.getId(),
                saving.getFtp(),
                saving.getSavingDate(),
                "Saving deposit",
                saving.getSavingAmount());

        // CREDIT saving ledger account (liability increases)
        journalEntryService.recordCreditEntry(
                type.getAccountId(),
                saving.getId(),
                saving.getFtp(),
                saving.getSavingDate(),
                "Saving deposit",
                saving.getSavingAmount());
    }
}
