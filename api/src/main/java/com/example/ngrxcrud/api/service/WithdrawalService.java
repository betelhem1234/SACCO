package com.example.ngrxcrud.api.service;

import com.example.ngrxcrud.api.model.Saving;
import com.example.ngrxcrud.api.model.SavingStatus;
import com.example.ngrxcrud.api.model.SavingType;
import com.example.ngrxcrud.api.model.Withdrawal;
import com.example.ngrxcrud.api.model.WithdrawalStatus;
import com.example.ngrxcrud.api.repository.SavingRepository;
import com.example.ngrxcrud.api.repository.SavingTypeRepository;
import com.example.ngrxcrud.api.repository.SettingRepository;
import com.example.ngrxcrud.api.repository.WithdrawalRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
public class WithdrawalService {

    public static final String WITHDRAWAL_REQUIRES_APPROVAL_KEY = "withdrawal_requires_approval";
    public static final String WITHDRAWAL_LIMIT_KEY = "withdrawal_limit";
    public static final String WITHDRAWAL_INTERVAL_DAYS_KEY = "withdrawal_interval_days";

    @Autowired
    private WithdrawalRepository withdrawalRepository;
    @Autowired
    private SavingTypeRepository savingTypeRepository;
    @Autowired
    private SavingRepository savingRepository;
    @Autowired
    private SettingRepository settingRepository;
    @Autowired
    private JournalEntryService journalEntryService;

    /**
     * Reads the global "requires approval" setting. When enabled, new withdrawals
     * enter the PENDING state and only post to the ledger once approved.
     */
    public boolean requiresApproval() {
        return settingRepository.findByKey(WITHDRAWAL_REQUIRES_APPROVAL_KEY)
                .map(s -> Boolean.parseBoolean(s.getValue()))
                .orElse(false);
    }

    /**
     * Maximum amount allowed for a single withdrawal (0 = unlimited).
     */
    public double withdrawalLimit() {
        return settingRepository.findByKey(WITHDRAWAL_LIMIT_KEY)
                .map(s -> {
                    try {
                        return Double.parseDouble(s.getValue());
                    } catch (NumberFormatException e) {
                        return 0.0;
                    }
                })
                .orElse(0.0);
    }

    /**
     * Minimum number of days a member must wait between consecutive withdrawals
     * (0 = no interval restriction).
     */
    public int withdrawalIntervalDays() {
        return settingRepository.findByKey(WITHDRAWAL_INTERVAL_DAYS_KEY)
                .map(s -> {
                    try {
                        return (int) Math.round(Double.parseDouble(s.getValue()));
                    } catch (NumberFormatException e) {
                        return 0;
                    }
                })
                .orElse(0);
    }

    /**
     * Validates the per-withdrawal limit and the min-days interval between a
     * member's consecutive withdrawals. Zero/absent settings are ignored.
     */
    private void validateWithdrawal(Withdrawal withdrawal) {
        double limit = withdrawalLimit();
        if (limit > 0 && withdrawal.getAmount() != null && withdrawal.getAmount() > limit) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    String.format("Amount %.2f exceeds the per-withdrawal limit of %.2f",
                            withdrawal.getAmount(), limit));
        }

        int intervalDays = withdrawalIntervalDays();
        if (intervalDays > 0) {
            withdrawalRepository.findFirstByMemberIdOrderByDateDesc(withdrawal.getMemberId())
                    .filter(last -> last.getId() != null
                            && !last.getId().equals(withdrawal.getId())
                            && last.getDate() != null
                            && withdrawal.getDate() != null
                            && last.getStatus() != WithdrawalStatus.REJECTED)
                    .ifPresent(last -> {
                        long elapsedDays = (withdrawal.getDate() - last.getDate()) / 86_400_000L;
                        if (elapsedDays < intervalDays) {
                            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                    String.format(
                                            "Member can only withdraw once every %d day(s). %d day(s) remaining.",
                                            intervalDays, intervalDays - elapsedDays));
                        }
                    });
        }
    }

    /**
     * Creates a withdrawal. If approval is enabled the withdrawal starts PENDING
     * (no ledger posting); otherwise it is POSTED immediately.
     */
    @Transactional
    public Withdrawal createWithdrawal(Withdrawal withdrawal) {
        validateWithdrawal(withdrawal);
        if (withdrawal.getCreatedAt() == null) {
            withdrawal.setCreatedAt(System.currentTimeMillis());
        }
        withdrawal.setStatus(requiresApproval() ? WithdrawalStatus.PENDING : WithdrawalStatus.POSTED);
        Withdrawal saved = withdrawalRepository.save(withdrawal);
        if (WithdrawalStatus.resolve(saved.getStatus()).postsToLedger()) {
            postToLedger(saved);
        }
        return saved;
    }

    /**
     * Approves a PENDING withdrawal and posts it to the ledger.
     * PENDING → POSTED
     */
    @Transactional
    public Withdrawal approveWithdrawal(UUID id, UUID approvedBy) {
        Withdrawal withdrawal = getWithdrawal(id);
        WithdrawalStatus status = WithdrawalStatus.resolve(withdrawal.getStatus());
        if (!status.canApprove()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Only PENDING withdrawals can be approved");
        }
        withdrawal.setStatus(WithdrawalStatus.POSTED);
        withdrawal.setApprovedBy(approvedBy);
        withdrawal.setApprovedAt(System.currentTimeMillis());
        Withdrawal saved = withdrawalRepository.save(withdrawal);
        postToLedger(saved);
        return saved;
    }

    /**
     * Rejects a PENDING withdrawal. No ledger entries are created.
     * PENDING → REJECTED
     */
    @Transactional
    public Withdrawal rejectWithdrawal(UUID id) {
        Withdrawal withdrawal = getWithdrawal(id);
        WithdrawalStatus status = WithdrawalStatus.resolve(withdrawal.getStatus());
        if (!status.canReject()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Only PENDING withdrawals can be rejected");
        }
        withdrawal.setStatus(WithdrawalStatus.REJECTED);
        return withdrawalRepository.save(withdrawal);
    }

    /**
     * Updates a non-POSTED withdrawal, re-posting to the ledger when the result
     * transitions to POSTED. POSTED records are locked.
     */
    @Transactional
    public Withdrawal updateWithdrawal(UUID id, Withdrawal incoming) {
        Withdrawal existing = getWithdrawal(id);
        WithdrawalStatus status = WithdrawalStatus.resolve(existing.getStatus());
        if (!status.canEdit()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Posted withdrawals cannot be edited");
        }
        existing.setMemberId(incoming.getMemberId());
        existing.setSavingTypeId(incoming.getSavingTypeId());
        existing.setAmount(incoming.getAmount());
        existing.setFtp(incoming.getFtp());
        existing.setBankId(incoming.getBankId());
        existing.setRemark(incoming.getRemark());
        existing.setDate(incoming.getDate());

        // If it was PENDING (not yet posted) and the effective status is now POSTED,
        // clear existing ledger entries and post fresh ones. Since PENDING rows never
        // posted to the ledger, only the POSTED case requires posting.
        WithdrawalStatus effective = incoming.getStatus() != null
                ? incoming.getStatus()
                : WithdrawalStatus.resolve(existing.getStatus());
        existing.setStatus(effective);
        Withdrawal saved = withdrawalRepository.save(existing);

        // PENDING/REJECTED records were never posted; only post when leaving to POSTED.
        if (effective.postsToLedger() && !status.postsToLedger()) {
            recordNegativeSaving(saved);
            postToLedger(saved);
        }
        return saved;
    }

    /**
     * Deletes a non-POSTED withdrawal (and any orphaned journal entries / negative saving).
     */
    @Transactional
    public void deleteWithdrawal(UUID id) {
        Withdrawal withdrawal = getWithdrawal(id);
        WithdrawalStatus status = WithdrawalStatus.resolve(withdrawal.getStatus());
        if (!status.canDelete()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Posted withdrawals cannot be deleted");
        }
        savingRepository.findByWithdrawalId(id).ifPresent(savingRepository::delete);
        journalEntryService.deleteEntriesByTargetId(id);
        withdrawalRepository.deleteById(id);
    }

    private Withdrawal getWithdrawal(UUID id) {
        return withdrawalRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Withdrawal not found"));
    }

    private void postToLedger(Withdrawal withdrawal) {
        SavingType type = savingTypeRepository.findById(withdrawal.getSavingTypeId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Saving type not found"));

        // DEBIT saving account (money leaves savings ledger)
        journalEntryService.recordDebitEntry(
                type.getAccountId(),
                withdrawal.getId(),
                withdrawal.getFtp(),
                withdrawal.getDate(),
                "Withdrawal",
                withdrawal.getAmount());

        // CREDIT bank account (cash paid to member)
        journalEntryService.recordCreditEntry(
                withdrawal.getBankId(),
                withdrawal.getId(),
                withdrawal.getFtp(),
                withdrawal.getDate(),
                "Withdrawal",
                withdrawal.getAmount());

        // Record negative saving entry to reduce member's balance
        recordNegativeSaving(withdrawal);
    }

    private void recordNegativeSaving(Withdrawal withdrawal) {
        Saving negativeSaving = new Saving();
        negativeSaving.setMemberId(withdrawal.getMemberId());
        negativeSaving.setSavingAmount(-withdrawal.getAmount());
        negativeSaving.setSavingDate(withdrawal.getDate());
        negativeSaving.setFtp(withdrawal.getFtp());
        negativeSaving.setSavingType(withdrawal.getSavingTypeId());
        negativeSaving.setAccountId(withdrawal.getBankId());
        negativeSaving.setWithdrawalId(withdrawal.getId());
        negativeSaving.setRemark(withdrawal.getRemark() != null ? "Withdrawal: " + withdrawal.getRemark() : "Withdrawal");
        negativeSaving.setCreatedAt(System.currentTimeMillis());
        negativeSaving.setStatus(SavingStatus.POSTED);
        savingRepository.save(negativeSaving);
    }
}
