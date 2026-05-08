package com.example.ngrxcrud.api.repository;

import com.example.ngrxcrud.api.model.LoanType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface LoanTypeRepository extends JpaRepository<LoanType, UUID> {
}
