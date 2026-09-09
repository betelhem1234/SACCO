package com.example.ngrxcrud.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "share_purchases")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SharePurchase {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "member_id", nullable = false)
    private UUID memberId;

    @Column(nullable = false)
    private Double units;

    @Column(name = "total_amount", nullable = false)
    private Double totalAmount;

    @Column(name = "purchase_date", nullable = false)
    private Long purchaseDate;

    @Column(name = "bank_id")
    private UUID bankId;

    @Column(name = "transaction_reference")
    private String transactionReference;

    @Column(name = "service_fee")
    private Double serviceFee;

    @Column
    private String remark;

    @Column(name = "transfer_id")
    private UUID transferId;

    @Column(name = "created_at", nullable = false)
    private Long createdAt;
}
