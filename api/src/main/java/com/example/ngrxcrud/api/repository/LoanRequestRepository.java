package com.example.ngrxcrud.api.repository;

import com.example.ngrxcrud.api.model.LoanRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import java.util.List;

public interface LoanRequestRepository extends JpaRepository<LoanRequest, UUID> {
    List<LoanRequest> findByMemberId(UUID memberId);
}
