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

/**
 * Immutable-ish history of mandatory saving amount changes. One row is written
 * when the saving type is created (first amount) and a new row is appended on
 * every amount change, storing the amount together with the date it took
 * effect. Member payments of the mandatory type are validated against the row
 * whose effective date is the latest one on or before the payment date.
 */
@Entity
@Table(name = "saving_type_amount_history")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SavingTypeAmountHistory {
    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.UUID)
    private UUID id;

    @Column(name = "saving_type_id", nullable = false)
    private UUID savingTypeId;

    @Column(nullable = false)
    private Double amount;

    /** epoch millis when this amount takes effect */
    @Column(name = "effective_from", nullable = false)
    private Long effectiveFrom;

    /** epoch millis when this record was saved */
    @Column(name = "created_at", nullable = false)
    private Long createdAt;
}