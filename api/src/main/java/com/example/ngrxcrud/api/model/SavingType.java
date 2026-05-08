package com.example.ngrxcrud.api.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "saving_types")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SavingType {
    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.UUID)
    private java.util.UUID id;
    private String name;
    private java.util.UUID accountId;
    private String description;
}
