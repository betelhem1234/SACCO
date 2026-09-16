package com.example.ngrxcrud.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "expense_requests")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ExpenseRequest {

    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.UUID)
    private UUID id;

    private String category;

    private String title;

    @Column(name = "requested_by")
    private String requestedBy;

    @Column(name = "requested_date")
    private Long requestedDate;

    private Double amount;

    @Column(name = "asset_name")
    private String assetName;

    private Integer quantity;

    private String supplier;

    private String landlord;

    private String frequency;

    @Column(name = "amount_per_period")
    private Double amountPerPeriod;

    @Column(name = "periods_covered")
    private Integer periodsCovered;

    @Column(name = "contract_id")
    private UUID contractId;

    @Column(name = "payment_account_id")
    private UUID paymentAccountId;

    private String status;

    @Column(name = "approved_by")
    private String approvedBy;

    @Column(name = "approved_date")
    private Long approvedDate;

    @Column(name = "paid_date")
    private Long paidDate;

    private String note;

    @Column(name = "created_at")
    private Long createdAt;

    @Column(name = "updated_at")
    private Long updatedAt;
}