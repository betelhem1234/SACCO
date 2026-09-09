package com.example.ngrxcrud.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Setting {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String key;

    @Column(columnDefinition = "TEXT")
    private String value;

    /** Timestamp when this setting was last updated. */
    @Column(name = "updated_at")
    private Long updatedAt;
}
