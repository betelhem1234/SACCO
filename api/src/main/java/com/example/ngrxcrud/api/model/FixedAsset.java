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
@Table(name = "fixed_assets")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class FixedAsset {

    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.UUID)
    private UUID id;

    private String name;

    private String category;

    private String description;

    @Column(name = "purchase_date")
    private Long purchaseDate;

    private Double cost;

    private String supplier;

    @Column(name = "source_request_id")
    private UUID sourceRequestId;

    private Boolean depreciable;

    @Column(name = "useful_life_years")
    private Integer usefulLifeYears;

    @Column(name = "salvage_value")
    private Double salvageValue;

    private String status;

    @Column(name = "created_at")
    private Long createdAt;
}