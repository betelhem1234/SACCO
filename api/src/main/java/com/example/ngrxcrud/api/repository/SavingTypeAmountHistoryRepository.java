package com.example.ngrxcrud.api.repository;

import com.example.ngrxcrud.api.model.SavingTypeAmountHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SavingTypeAmountHistoryRepository extends JpaRepository<SavingTypeAmountHistory, UUID> {

    List<SavingTypeAmountHistory> findBySavingTypeIdOrderByEffectiveFromAsc(UUID savingTypeId);

    /** Last record that was already in effect on or before {@code date}. */
    Optional<SavingTypeAmountHistory> findFirstBySavingTypeIdAndEffectiveFromLessThanEqualOrderByEffectiveFromDesc(
            UUID savingTypeId, long date);

    void deleteBySavingTypeId(UUID savingTypeId);
}