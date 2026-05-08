package com.example.ngrxcrud.api.repository;

import com.example.ngrxcrud.api.model.Loan;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import java.util.List;

public interface LoanRepository extends JpaRepository<Loan, UUID> {
    List<Loan> findByMemberId(UUID memberId);
}
