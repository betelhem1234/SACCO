package com.example.ngrxcrud.api.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "subcities")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Subcity {
    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.UUID)
    private java.util.UUID id;
    private String name;
    private String description;
    @JsonProperty("state_id")
    private java.util.UUID stateId;
}
