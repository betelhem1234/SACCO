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
}
