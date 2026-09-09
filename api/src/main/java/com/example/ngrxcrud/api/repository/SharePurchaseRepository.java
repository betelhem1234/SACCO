package com.example.ngrxcrud.api.repository;

import com.example.ngrxcrud.api.model.SharePurchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SharePurchaseRepository extends JpaRepository<SharePurchase, UUID> {
    Optional<SharePurchase> findByTransferId(UUID transferId);
}
