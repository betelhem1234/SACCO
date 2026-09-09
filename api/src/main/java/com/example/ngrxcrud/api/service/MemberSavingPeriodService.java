package com.example.ngrxcrud.api.service;

import com.example.ngrxcrud.api.model.*;
import com.example.ngrxcrud.api.repository.MemberSavingPeriodRepository;
import com.example.ngrxcrud.api.repository.SavingRepository;
import com.example.ngrxcrud.api.repository.SavingTypeAmountHistoryRepository;
import com.example.ngrxcrud.api.repository.SavingTypeRepository;
import com.example.ngrxcrud.api.repository.SettingRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.*;

@Service
public class MemberSavingPeriodService {

    public static final String MANDATORY_PARTIAL_PAYMENT_KEY = "mandatory_partial_payment";
    public static final String MANDATORY_OVERFLOW_TO_VOLUNTARY_KEY = "mandatory_overflow_to_voluntary";
    public static final String MANDATORY_SAVING_TYPE_KEY = "mandatory_saving_type_id";

    @Autowired private MemberSavingPeriodRepository periodRepository;
    @Autowired private SavingRepository savingRepository;
    @Autowired private SavingTypeRepository savingTypeRepository;
    @Autowired private SavingTypeAmountHistoryRepository historyRepository;
    @Autowired private SettingRepository settingRepository;
    @Autowired private JournalEntryService journalEntryService;

    private static final String VOLUNTARY_NAME_MARKER = "voluntary";

    // ---------------------------------------------------------------- helpers

    /** Returns true if partial monthly payments are allowed (default true). */
    public boolean isPartialPaymentAllowed() {
        return settingRepository.findByKey(MANDATORY_PARTIAL_PAYMENT_KEY)
                .map(s -> Boolean.parseBoolean(s.getValue()))
                .orElse(true);
    }

    /** Returns true if overflow should auto-sweep to voluntary (default true). */
    public boolean isOverflowToVoluntaryEnabled() {
        return settingRepository.findByKey(MANDATORY_OVERFLOW_TO_VOLUNTARY_KEY)
                .map(s -> Boolean.parseBoolean(s.getValue()))
                .orElse(true);
    }

    /** Returns the UUID of the mandatory saving type, if configured. */
    public Optional<UUID> getConfiguredMandatoryTypeId() {
        return settingRepository.findByKey(MANDATORY_SAVING_TYPE_KEY)
                .map(s -> UUID.fromString(s.getValue()));
    }

    /** Computes the YYYYMM key for an epoch-millis timestamp. */
    public static int yearMonthOf(long epochMillis) {
        LocalDate d = LocalDate.ofInstant(
                new java.util.Date(epochMillis).toInstant(),
                ZoneId.systemDefault()).withDayOfMonth(1);
        return d.getYear() * 100 + d.getMonthValue();
    }

    /** Returns epoch millis of the first millis of the given YYYYMM in system tz. */
    public static long monthStartOf(int yearMonth) {
        int y = yearMonth / 100;
        int m = yearMonth % 100;
        return LocalDate.of(y, m, 1)
                .atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli();
    }

    /** Returns epoch millis of the last millis of the given YYYYMM in system tz. */
    public static long monthEndOf(int yearMonth) {
        int y = yearMonth / 100;
        int m = yearMonth % 100;
        return LocalDate.of(y, m, 1)
                .withDayOfMonth(YearMonth.of(y, m).lengthOfMonth())
                .atTime(23, 59, 59, 999_999_999)
                .atZone(ZoneId.systemDefault()).toInstant().toEpochMilli();
    }

    /** Formats YYYYMM as "MMM yyyy" (e.g. "Sep 2026"). */
    public static String formatYearMonth(int yearMonth) {
        int y = yearMonth / 100;
        int m = yearMonth % 100;
        return new java.text.SimpleDateFormat("MMM yyyy").format(
                java.util.Date.from(LocalDate.of(y, m, 1)
                        .atStartOfDay(ZoneId.systemDefault()).toInstant()));
    }

    // ---------------------------------------------------------------- core

    /**
     * Called after a new mandatory-type saving is validated. Ensures the
     * {@link MemberSavingPeriod} row reflects the cumulative paid amount and
     * recomputes status. Returns the overflow amount to be swept into
     * voluntary (0 if none).
     *
     * @param memberId      the paying member
     * @param savingTypeId  the mandatory saving type
     * @param amount        the amount of this new payment
     * @param epochMillis   the saving date (payment date)
     * @return surplus above the fully-covered mandatory months
     */
    @Transactional
    public double reconcileNewSaving(UUID memberId, UUID savingTypeId,
                                     double amount, long epochMillis) {
        int ym = yearMonthOf(epochMillis);
        double required = requiredAmountFor(memberId, savingTypeId, ym, epochMillis);

        MemberSavingPeriod period = periodRepository
                .findByMemberIdAndSavingTypeIdAndYearMonth(memberId, savingTypeId, ym)
                .orElseGet(() -> {
                    MemberSavingPeriod p = new MemberSavingPeriod();
                    p.setMemberId(memberId);
                    p.setSavingTypeId(savingTypeId);
                    p.setYearMonth(ym);
                    p.setRequiredAmount(required);
                    p.setPaidAmount(0);
                    p.setStatus(SavingPeriodStatus.UNPAID);
                    p.setCreatedAt(System.currentTimeMillis());
                    p.setUpdatedAt(System.currentTimeMillis());
                    return periodRepository.save(p);
                });

        double previousPaid = period.getPaidAmount();
        period.setPaidAmount(previousPaid + amount);
        period.setRequiredAmount(required);
        period.setUpdatedAt(System.currentTimeMillis());
        period.setStatus(SavingPeriodStatus.fromPaid(period.getPaidAmount(), period.getRequiredAmount()));
        periodRepository.save(period);

        return 0; // no surplus logic here - handled in caller with allocation
    }

    /**
     * Called when an existing mandatory-type saving is updated.
     * Moves the amount delta between the old month and the new month.
     * Returns any overflow to be swept to voluntary (from the new month).
     */
    @Transactional
    public double reconcileUpdatedSaving(UUID memberId, UUID savingTypeId,
                                         double oldAmount, long oldEpochMillis,
                                         double newAmount, long newEpochMillis) {
        int oldYm = yearMonthOf(oldEpochMillis);
        int newYm = yearMonthOf(newEpochMillis);

        if (oldYm == newYm) {
            // Same month: just adjust the delta
            MemberSavingPeriod period = periodRepository
                    .findByMemberIdAndSavingTypeIdAndYearMonth(memberId, savingTypeId, oldYm)
                    .orElse(null);
            if (period != null) {
                period.setPaidAmount(period.getPaidAmount() - oldAmount + newAmount);
                period.setUpdatedAt(System.currentTimeMillis());
                period.setStatus(SavingPeriodStatus.fromPaid(period.getPaidAmount(), period.getRequiredAmount()));
                periodRepository.save(period);
            }
            return 0;
        }

        // Remove from old month
        MemberSavingPeriod oldPeriod = periodRepository
                .findByMemberIdAndSavingTypeIdAndYearMonth(memberId, savingTypeId, oldYm)
                .orElse(null);
        if (oldPeriod != null) {
            oldPeriod.setPaidAmount(oldPeriod.getPaidAmount() - oldAmount);
            oldPeriod.setUpdatedAt(System.currentTimeMillis());
            oldPeriod.setStatus(SavingPeriodStatus.fromPaid(oldPeriod.getPaidAmount(), oldPeriod.getRequiredAmount()));
            periodRepository.save(oldPeriod);
        }

        // Add to new month
        double required = requiredAmountFor(memberId, savingTypeId, newYm, newEpochMillis);
        MemberSavingPeriod newPeriod = periodRepository
                .findByMemberIdAndSavingTypeIdAndYearMonth(memberId, savingTypeId, newYm)
                .orElseGet(() -> {
                    MemberSavingPeriod p = new MemberSavingPeriod();
                    p.setMemberId(memberId); p.setSavingTypeId(savingTypeId);
                    p.setYearMonth(newYm); p.setRequiredAmount(required);
                    p.setPaidAmount(0); p.setStatus(SavingPeriodStatus.UNPAID);
                    p.setCreatedAt(System.currentTimeMillis());
                    p.setUpdatedAt(System.currentTimeMillis());
                    return periodRepository.save(p);
                });
        newPeriod.setPaidAmount(newPeriod.getPaidAmount() + newAmount);
        newPeriod.setRequiredAmount(required);
        newPeriod.setUpdatedAt(System.currentTimeMillis());
        newPeriod.setStatus(SavingPeriodStatus.fromPaid(newPeriod.getPaidAmount(), newPeriod.getRequiredAmount()));
        periodRepository.save(newPeriod);

        return 0;
    }

    /**
     * Called when a mandatory-type saving is deleted.
     * Returns any overflow that was previously allocated to voluntary (to
     * reverse if needed). Currently just subtracts from the period.
     */
    @Transactional
    public void reconcileDeletedSaving(UUID memberId, UUID savingTypeId,
                                       double amount, long epochMillis) {
        int ym = yearMonthOf(epochMillis);
        MemberSavingPeriod period = periodRepository
                .findByMemberIdAndSavingTypeIdAndYearMonth(memberId, savingTypeId, ym)
                .orElse(null);
        if (period != null) {
            period.setPaidAmount(period.getPaidAmount() - amount);
            if (period.getPaidAmount() < 0) period.setPaidAmount(0);
            period.setUpdatedAt(System.currentTimeMillis());
            period.setStatus(SavingPeriodStatus.fromPaid(period.getPaidAmount(), period.getRequiredAmount()));
            periodRepository.save(period);
        }
    }

    /**
     * Called when the mandatory minimum amount changes. Recomputes the
     * required_amount and status for current + future month rows.
     * Historical months keep their snapshot (not changed).
     */
    @Transactional
    public void recomputeFuturePeriods(UUID memberId, UUID savingTypeId, long changeDate) {
        int changeYm = yearMonthOf(changeDate);
        List<MemberSavingPeriod> rows = periodRepository
                .findByMemberIdAndSavingTypeId(memberId, savingTypeId);
        for (MemberSavingPeriod p : rows) {
            if (p.getYearMonth() >= changeYm) {
                double newRequired = requiredAmountForAt(memberId, savingTypeId, p.getYearMonth());
                p.setRequiredAmount(newRequired);
                p.setStatus(SavingPeriodStatus.fromPaid(p.getPaidAmount(), newRequired));
                p.setUpdatedAt(System.currentTimeMillis());
                periodRepository.save(p);
            }
        }
    }

    /**
     * Returns the paid/required/tracker rows for a member across all months
     * of the mandatory type, from the first month they were obligated to now.
     */
    public List<Map<String, Object>> trackerForMember(UUID memberId, UUID savingTypeId) {
        List<MemberSavingPeriod> rows = periodRepository
                .findByMemberIdAndSavingTypeIdOrderByYearMonthAsc(memberId, savingTypeId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (MemberSavingPeriod p : rows) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("yearMonth", p.getYearMonth());
            m.put("label", formatYearMonth(p.getYearMonth()));
            m.put("requiredAmount", p.getRequiredAmount());
            m.put("paidAmount", p.getPaidAmount());
            m.put("remaining", Math.max(0, p.getRequiredAmount() - p.getPaidAmount()));
            m.put("status", p.getStatus().name());
            result.add(m);
        }
        return result;
    }

    /**
     * Returns a map of unpaid/partial months (oldest-first) with the remaining
     * amount still required, used for enforcing "cover all arrears in order".
     */
    public List<Map<String, Object>> arrearsMap(UUID memberId, UUID savingTypeId) {
        List<Map<String, Object>> all = trackerForMember(memberId, savingTypeId);
        List<Map<String, Object>> arrears = new ArrayList<>();
        for (Map<String, Object> m : all) {
            String status = (String) m.get("status");
            if (!"PAID".equals(status)) {
                Map<String, Object> a = new LinkedHashMap<>(m);
                a.put("remaining", m.get("requiredAmount"));
                arrears.add(a);
            }
        }
        arrears.sort(Comparator.comparingInt(m -> (int) m.get("yearMonth")));
        return arrears;
    }

    // ---------------------------------------------------------------- helpers

    /** Required amount for the given year-month, snapshotted from history. */
    public double requiredAmountFor(UUID memberId, UUID savingTypeId, int yearMonth, long epochMillis) {
        MemberSavingPeriod existing = periodRepository
                .findByMemberIdAndSavingTypeIdAndYearMonth(memberId, savingTypeId, yearMonth)
                .orElse(null);
        if (existing != null && existing.getRequiredAmount() > 0) {
            return existing.getRequiredAmount();
        }
        return minimumAmountAt(savingTypeId, monthEndOf(yearMonth));
    }

    /** Required amount for a specific year-month from history (without creating row). */
    private double requiredAmountForAt(UUID memberId, UUID savingTypeId, int yearMonth) {
        return minimumAmountAt(savingTypeId, monthEndOf(yearMonth));
    }

    /** Resolves the mandatory minimum in effect for the given date from history. */
    private double minimumAmountAt(UUID savingTypeId, long date) {
        SavingType type = savingTypeRepository.findById(savingTypeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Saving type not found"));
        List<SavingTypeAmountHistory> history = historyRepository.findBySavingTypeIdOrderByEffectiveFromAsc(savingTypeId);
        if (history.isEmpty()) {
            return type.getMinimumAmount() == null ? 0.0 : type.getMinimumAmount();
        }
        for (int i = history.size() - 1; i >= 0; i--) {
            if (history.get(i).getEffectiveFrom() <= date) {
                return history.get(i).getAmount();
            }
        }
        return history.get(0).getAmount();
    }

    /** Seeds the setting key that records which saving type is the mandatory one. */
    @Transactional
    public void seedMandatoryTypeId(UUID mandatoryTypeId) {
        Setting existing = settingRepository.findByKey(MANDATORY_SAVING_TYPE_KEY).orElse(null);
        if (existing == null) {
            existing = new Setting(null, MANDATORY_SAVING_TYPE_KEY, mandatoryTypeId.toString(), null);
            existing.setUpdatedAt(System.currentTimeMillis());
        } else {
            existing.setValue(mandatoryTypeId.toString());
            existing.setUpdatedAt(System.currentTimeMillis());
        }
        settingRepository.save(existing);
    }

    /** Recomputes required_amount/status for current+future month rows
     * for all members of the given mandatory type. */
    @Transactional
    public void recomputeFuturePeriodsForType(UUID savingTypeId, long changeDate) {
        int changeYm = yearMonthOf(changeDate);
        List<MemberSavingPeriod> rows = periodRepository
                .findBySavingTypeIdAndYearMonthGreaterThanEqualOrderByYearMonthAsc(savingTypeId, changeYm);
        for (MemberSavingPeriod p : rows) {
            if (p.getYearMonth() >= changeYm) {
                double newRequired = requiredAmountForAt(p.getMemberId(), savingTypeId, p.getYearMonth());
                p.setRequiredAmount(newRequired);
                p.setStatus(SavingPeriodStatus.fromPaid(p.getPaidAmount(), newRequired));
                p.setUpdatedAt(System.currentTimeMillis());
                periodRepository.save(p);
            }
        }
    }

    /** Finds the configured voluntary saving type by name containing "voluntary". */
    public Optional<SavingType> findVoluntaryType() {
        return savingTypeRepository.findAll().stream()
                .filter(t -> t.getName() != null && t.getName().toLowerCase().contains(VOLUNTARY_NAME_MARKER))
                .findFirst();
    }
}
