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
@Table(name = "rental_contracts")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class RentalContract {

    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.UUID)
    private UUID id;

    @Column(name = "property_name", nullable = false)
    private String propertyName;

    private String description;

    private String landlord;

    private String frequency;

    @Column(name = "amount_per_period", nullable = false)
    private Double amountPerPeriod;

    @Column(name = "start_date")
    private Long startDate;

    @Column(name = "end_date")
    private Long endDate;

    @Column(name = "advance_periods")
    private Integer advancePeriods;

    private String status;

    @Column(name = "created_at")
    private Long createdAt;

    @Column(name = "updated_at")
    private Long updatedAt;
}