package com.example.ngrxcrud.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "member_saving_period")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class MemberSavingPeriod {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "member_id", nullable = false)
    private UUID memberId;

    @Column(name = "saving_type_id", nullable = false)
    private UUID savingTypeId;

    /** YYYYMM, e.g. 202601 = January 2026 */
    @Column(name = "year_month", nullable = false)
    private int yearMonth;

    /** Minimum required for this month (snapshotted from history). */
    @Column(name = "required_amount", nullable = false)
    private double requiredAmount;

    /** Cumulative amount actually paid for this month. */
    @Column(name = "paid_amount", nullable = false)
    private double paidAmount;

    /** PAID / PARTIAL / UNPAID (pending) */
    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private SavingPeriodStatus status;

    @Column(name = "created_at", nullable = false)
    private Long createdAt;

    @Column(name = "updated_at", nullable = false)
    private Long updatedAt;
}
