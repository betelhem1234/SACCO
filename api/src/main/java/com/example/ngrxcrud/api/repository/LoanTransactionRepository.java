package com.example.ngrxcrud.api.repository;

import com.example.ngrxcrud.api.model.LoanTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import java.util.List;

public interface LoanTransactionRepository extends JpaRepository<LoanTransaction, UUID> {
    List<LoanTransaction> findByLoanId(UUID loanId);
}
