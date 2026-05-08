package com.example.ngrxcrud.api.repository;

import com.example.ngrxcrud.api.model.LoanSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import java.util.List;

public interface LoanScheduleRepository extends JpaRepository<LoanSchedule, UUID> {
    List<LoanSchedule> findByLoanIdOrderByInstallmentNo(UUID loanId);

    List<LoanSchedule> findByLoanIdAndStatusNot(UUID loanId, String status);
}
