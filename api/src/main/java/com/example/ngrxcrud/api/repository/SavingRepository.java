package com.example.ngrxcrud.api.repository;

import com.example.ngrxcrud.api.model.Saving;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SavingRepository extends JpaRepository<Saving, java.util.UUID> {

    boolean existsByAccountId(UUID accountId);

    boolean existsBySavingType(UUID savingTypeId);

    Optional<Saving> findByWithdrawalId(UUID withdrawalId);

    Optional<Saving> findByTransferId(UUID transferId);
}
