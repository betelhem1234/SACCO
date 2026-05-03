package com.example.ngrxcrud.api.model;

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

    private java.util.UUID memberId;
    private Double savingAmount;
    private Long savingDate;
    private String ftp;
    private java.util.UUID savingType;
    private java.util.UUID bankId;
    private String remark;
    private Long createdAt;
}
