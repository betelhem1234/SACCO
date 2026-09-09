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
@Table(name = "withdrawal")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Withdrawal {

    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.UUID)
    private java.util.UUID id;

    @Column(name = "member_id", nullable = false)
    private java.util.UUID memberId;

    @Column(name = "saving_type_id", nullable = false)
    private java.util.UUID savingTypeId;

    @Column(name = "amount", nullable = false)
    private Double amount;

    @Column(name = "ftp", nullable = false)
    private String ftp;

    @Column(name = "bank_id", nullable = false)
    private java.util.UUID bankId;

    @Column(name = "remark")
    private String remark;

    @Column(name = "date", nullable = false)
    private Long date;

    @Column(name = "created_at", nullable = false)
    private Long createdAt;

    // PENDING, POSTED, REJECTED - see WithdrawalStatus state machine
    @Column(name = "status", nullable = false, length = 20)
    @jakarta.persistence.Enumerated(jakarta.persistence.EnumType.STRING)
    private WithdrawalStatus status;

    @Column(name = "approved_by")
    private java.util.UUID approvedBy;

    @Column(name = "approved_at")
    private Long approvedAt;
}
