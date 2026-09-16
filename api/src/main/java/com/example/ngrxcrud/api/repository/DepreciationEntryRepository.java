package com.example.ngrxcrud.api.repository;

import com.example.ngrxcrud.api.model.DepreciationEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DepreciationEntryRepository extends JpaRepository<DepreciationEntry, UUID> {

    List<DepreciationEntry> findByAssetId(UUID assetId);

    Optional<DepreciationEntry> findFirstByAssetIdOrderByPeriodKeyDesc(UUID assetId);
}