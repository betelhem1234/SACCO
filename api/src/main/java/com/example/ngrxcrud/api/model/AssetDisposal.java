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
@Table(name = "asset_disposals")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AssetDisposal {

    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.UUID)
    private UUID id;

    @Column(name = "asset_id", nullable = false)
    private UUID assetId;

    @Column(name = "asset_name")
    private String assetName;

    @Column(name = "disposal_date", nullable = false)
    private Long disposalDate;

    private String condition;

    private Double proceeds;

    @Column(name = "proceeds_account_id")
    private UUID proceedsAccountId;

    @Column(name = "book_value")
    private Double bookValue;

    @Column(name = "gain_loss")
    private Double gainLoss;

    private String note;

    @Column(name = "created_at")
    private Long createdAt;
}