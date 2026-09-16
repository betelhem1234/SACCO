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
@Table(name = "depreciation_entries")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class DepreciationEntry {

    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.UUID)
    private UUID id;

    @Column(name = "asset_id", nullable = false)
    private UUID assetId;

    @Column(name = "period_key", nullable = false)
    private String periodKey;

    @Column(name = "period_start")
    private Long periodStart;

    private Double amount;

    private Double accumulated;

    @Column(name = "net_book_value")
    private Double netBookValue;

    @Column(name = "created_at")
    private Long createdAt;
}