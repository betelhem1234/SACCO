package com.example.ngrxcrud.api.repository;

import com.example.ngrxcrud.api.model.FixedAsset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FixedAssetRepository extends JpaRepository<FixedAsset, UUID> {

    List<FixedAsset> findByStatus(String status);
}