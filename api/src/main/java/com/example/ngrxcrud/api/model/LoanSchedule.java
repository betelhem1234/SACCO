package com.example.ngrxcrud.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "loan_schedule")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoanSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "loan_id", nullable = false)
    private UUID loanId;

    @Column(name = "installment_no", nullable = false)
    private Integer installmentNo;

    @Column(name = "due_date", nullable = false)
    private Long dueDate;

    @Column(name = "principal_amount", nullable = false)
    private BigDecimal principalAmount;

    @Column(name = "interest_amount", nullable = false)
    private BigDecimal interestAmount;

    @Column(name = "total_amount", nullable = false)
    private BigDecimal totalAmount;

    @Column(name = "paid_amount")
    private BigDecimal paidAmount = BigDecimal.ZERO;

    // PENDING, PARTIAL, PAID
    @Column(nullable = false, length = 20)
    private String status;

    @Column(name = "created_at", nullable = false)
    private Long createdAt;
}
