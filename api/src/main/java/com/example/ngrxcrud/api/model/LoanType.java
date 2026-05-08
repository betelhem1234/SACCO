package com.example.ngrxcrud.api.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "loan_type")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoanType {
    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.UUID)
    private UUID id;

    private String name;

    private BigDecimal requiredMonths;
    private BigDecimal requiredSavingPercentage;

    @Column(name = "requried_share_percentage")
    private BigDecimal requiredSharePercentage;

    private BigDecimal maleInterestAmount;
    private BigDecimal femaleInterestAmount;
    private BigDecimal requiredMaximumAmount;
    private BigDecimal maximumRepaymentMonths;
    private BigDecimal requiredShareUnitCount;

    private UUID interestCollectiveAccount;
    private UUID lateInterestCollectiveAccount;
    private UUID lateInterestPayableAccount;
    private UUID longTermPrincipalAccount;
    private UUID shortTermPrincipalAccount;

    @Column(name = "penality_collective_account")
    private UUID penaltyCollectiveAccount;

    private UUID transferFeeCollectiveAccount;
    private UUID serviceFeeCollectiveAccount;
    private UUID insuranceFeeCollectiveAccount;

    private String description;
    private Long loanCode;
    private String loanTerm;
    private Long createdAt;
}
