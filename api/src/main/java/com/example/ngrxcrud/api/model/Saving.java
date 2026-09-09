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
@Table(name = "savings")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Saving {
    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.UUID)
    private java.util.UUID id;

    @Column(name = "member_id", nullable = false)
    private java.util.UUID memberId;

    @Column(name = "saving_amount", nullable = false)
    private Double savingAmount;

    @Column(name = "saving_date", nullable = false)
    private Long savingDate;

    @Column(name = "ftp", nullable = false)
    private String ftp;

    @Column(name = "saving_type", nullable = false)
    private java.util.UUID savingType;

    @Column(name = "account_id", nullable = false)
    private java.util.UUID accountId;

    @Column(name = "remark")
    private String remark;

    @Column(name = "withdrawal_id")
    private java.util.UUID withdrawalId;

    @Column(name = "transfer_id")
    private java.util.UUID transferId;

    @Column(name = "created_at", nullable = false)
    private Long createdAt;

    // PENDING, POSTED, REJECTED - see SavingStatus state machine
    @Column(name = "status", nullable = false, length = 20)
    @jakarta.persistence.Enumerated(jakarta.persistence.EnumType.STRING)
    private SavingStatus status;

    @Column(name = "approved_by")
    private java.util.UUID approvedBy;

    @Column(name = "approved_at")
    private Long approvedAt;
}
