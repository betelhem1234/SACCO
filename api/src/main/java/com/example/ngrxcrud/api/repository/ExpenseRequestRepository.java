package com.example.ngrxcrud.api.repository;

import com.example.ngrxcrud.api.model.ExpenseRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ExpenseRequestRepository extends JpaRepository<ExpenseRequest, UUID> {

    List<ExpenseRequest> findByStatus(String status);
}