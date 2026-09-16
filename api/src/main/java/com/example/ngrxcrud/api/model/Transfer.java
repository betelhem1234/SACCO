package com.example.ngrxcrud.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "transfers")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Transfer {

    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.UUID)
    private java.util.UUID id;

    @Column(name = "source_member_id", nullable = false)
    private java.util.UUID sourceMemberId;

    @Column(name = "source_saving_type_id", nullable = false)
    private java.util.UUID sourceSavingTypeId;

    @Column(name = "destination_member_id", nullable = false)
    private java.util.UUID destinationMemberId;

    @Column(name = "destination_saving_type_id", nullable = false)
    private java.util.UUID destinationSavingTypeId;

    @Column(name = "amount", nullable = false)
    private Double amount;

    @Column(name = "ftp", nullable = false)
    private String ftp;

    @Column(name = "date", nullable = false)
    private Long date;

    @Column(name = "remark")
    private String remark;

    @Column(name = "created_at", nullable = false)
    private Long createdAt;

    // PENDING, FEE_PAID, APPROVED, POSTED, REJECTED - see TransferStatus state machine
    @Column(name = "status", length = 20)
    @jakarta.persistence.Enumerated(jakarta.persistence.EnumType.STRING)
    private TransferStatus status;

    @Column(name = "approved_by")
    private java.util.UUID approvedBy;

    @Column(name = "approved_at")
    private Long approvedAt;

    // Service fee (computed from the flat + percentage settings when enabled)
    @Column(name = "service_fee")
    private Double serviceFee;

    // Bank account used to pay the service fee (feeSource = BANK)
    @Column(name = "bank_id")
    private java.util.UUID bankId;

    // NONE / SAVING / BANK - where the service fee is paid from
    @Column(name = "fee_source", length = 20)
    @jakarta.persistence.Enumerated(jakarta.persistence.EnumType.STRING)
    private TransferFeeSource feeSource;

    @Column(name = "fee_paid_by")
    private java.util.UUID feePaidBy;

    @Column(name = "fee_paid_at")
    private Long feePaidAt;

    @Column(name = "fee_reference")
    private String feeReference;

    @Column(name = "executed_by")
    private java.util.UUID executedBy;

    @Column(name = "executed_at")
    private Long executedAt;
}
