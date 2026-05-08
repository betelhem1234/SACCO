package com.example.ngrxcrud.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "loan_transaction")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoanTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "loan_id", nullable = false)
    private UUID loanId;

    // DISBURSEMENT, REPAYMENT
    @Column(name = "transaction_type", nullable = false, length = 30)
    private String transactionType;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(name = "principal_portion")
    private BigDecimal principalPortion = BigDecimal.ZERO;

    @Column(name = "interest_portion")
    private BigDecimal interestPortion = BigDecimal.ZERO;

    @Column(name = "penalty_portion")
    private BigDecimal penaltyPortion = BigDecimal.ZERO;

    @Column(name = "reference_no")
    private String referenceNo;

    @Column(name = "created_at", nullable = false)
    private Long createdAt;
}
