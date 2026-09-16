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
@Table(name = "share_subscriptions")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ShareSubscription {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "member_id", nullable = false)
    private UUID memberId;

    @Column(nullable = false)
    private Double units;

    @Column(name = "total_amount", nullable = false)
    private Double totalAmount;

    @Column(name = "subscription_date", nullable = false)
    private Long subscriptionDate;

    @Column
    private String remark;

    @Column(name = "created_at", nullable = false)
    private Long createdAt;

    // PENDING, POSTED, REJECTED - see ShareStatus state machine
    @Column(name = "status", length = 20)
    @jakarta.persistence.Enumerated(jakarta.persistence.EnumType.STRING)
    private ShareStatus status;

    @Column(name = "approved_by")
    private UUID approvedBy;

    @Column(name = "approved_at")
    private Long approvedAt;
}
