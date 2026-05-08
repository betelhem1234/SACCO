package com.example.ngrxcrud.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "loan_request")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoanRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "member_id", nullable = false)
    private UUID memberId;

    @Column(name = "loan_type_id", nullable = false)
    private UUID loanTypeId;

    @Column(name = "requested_amount", nullable = false)
    private BigDecimal requestedAmount;

    @Column(name = "requested_months", nullable = false)
    private Integer requestedMonths;

    private String purpose;

    // PENDING, APPROVED, REJECTED
    @Column(nullable = false, length = 20)
    private String status;

    @Column(name = "approved_by")
    private UUID approvedBy;

    @Column(name = "approved_at")
    private Long approvedAt;

    @Column(name = "created_at", nullable = false)
    private Long createdAt;
}
