package com.example.ngrxcrud.api.repository;

import com.example.ngrxcrud.api.model.SavingType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SavingTypeRepository extends JpaRepository<SavingType, UUID> {
}
