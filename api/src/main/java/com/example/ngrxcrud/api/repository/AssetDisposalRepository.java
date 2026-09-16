package com.example.ngrxcrud.api.repository;

import com.example.ngrxcrud.api.model.AssetDisposal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AssetDisposalRepository extends JpaRepository<AssetDisposal, UUID> {

    List<AssetDisposal> findByAssetId(UUID assetId);
}