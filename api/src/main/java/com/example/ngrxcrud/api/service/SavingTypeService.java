package com.example.ngrxcrud.api.service;

import com.example.ngrxcrud.api.model.SavingType;
import com.example.ngrxcrud.api.model.SavingTypeAmountHistory;
import com.example.ngrxcrud.api.repository.SavingTypeAmountHistoryRepository;
import com.example.ngrxcrud.api.repository.SavingTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

/**
 * Saving type CRUD that keeps the mandatory amount history in sync:
 * <ul>
 *   <li>creating a mandatory saving type writes its first history record,</li>
 *   <li>updating a mandatory saving type appends a new history record whenever
 *       its minimum amount actually changes,</li>
 *   <li>{@link #minimumAmountAt} resolves the minimum in effect for a given
 *       date (history-based for the mandatory type, current value otherwise).</li>
 * </ul>
 */
@Service
public class SavingTypeService {

    @Autowired
    private SavingTypeRepository savingTypeRepository;

    @Autowired
    private SavingTypeAmountHistoryRepository historyRepository;

    @Autowired
    private MemberSavingPeriodService memberSavingPeriodService;

    @Transactional
    public SavingType createSavingType(SavingType savingType) {
        if (savingType.getMinimumAmount() == null) {
            savingType.setMinimumAmount(0.0);
        }
        SavingType saved = savingTypeRepository.save(savingType);
        if (saved.getIsMandatory()) {
            addHistoryRecord(saved.getId(), saved.getMinimumAmount());
        }
        return saved;
    }

    @Transactional
    public SavingType updateSavingType(UUID id, SavingType incoming) {
        SavingType existing = savingTypeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Saving type not found"));

        Double newMin = incoming.getMinimumAmount() != null ? incoming.getMinimumAmount() : 0.0;
        boolean amountChanged = !Objects.equals(existing.getMinimumAmount(), newMin);
        boolean becameMandatory = !existing.getIsMandatory() && incoming.getIsMandatory();

        existing.setName(incoming.getName());
        existing.setAccountId(incoming.getAccountId());
        existing.setDescription(incoming.getDescription());
        existing.setMinimumAmount(newMin);
        existing.setIsMandatory(incoming.getIsMandatory());

        SavingType saved = savingTypeRepository.save(existing);

        if (saved.getIsMandatory() && (amountChanged || becameMandatory)) {
            addHistoryRecord(saved.getId(), newMin);
            memberSavingPeriodService.seedMandatoryTypeId(saved.getId());
        }
        return saved;
    }

    /** When the mandatory minimum changes, recompute required_amount for
     * all current+future month rows for every member (past months stay historical). */
    @Transactional
    public void recomputeFuturePeriods(UUID id, long changeDate) {
        memberSavingPeriodService.recomputeFuturePeriodsForType(id, changeDate);
    }

    @Transactional
    public void deleteSavingType(UUID id) {
        historyRepository.deleteBySavingTypeId(id);
    }

    public List<SavingTypeAmountHistory> getHistory(UUID savingTypeId) {
        return historyRepository.findBySavingTypeIdOrderByEffectiveFromAsc(savingTypeId);
    }

    /**
     * Minimum amount a member must pay for a saving of this type on the given
     * date. For the mandatory type this is the history amount effective on or
     * before the date (falling back to the first record if the date precedes
     * the first change). For all other types the current minimum on the saving
     * type itself is used.
     */
    public double minimumAmountAt(UUID savingTypeId, long date) {
        SavingType type = savingTypeRepository.findById(savingTypeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Saving type not found"));

        if (!type.getIsMandatory()) {
            return type.getMinimumAmount() == null ? 0.0 : type.getMinimumAmount();
        }

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

    private void addHistoryRecord(UUID savingTypeId, Double amount) {
        long now = System.currentTimeMillis();
        SavingTypeAmountHistory history = new SavingTypeAmountHistory();
        history.setSavingTypeId(savingTypeId);
        history.setAmount(amount);
        history.setEffectiveFrom(now);
        history.setCreatedAt(now);
        historyRepository.save(history);
    }
}