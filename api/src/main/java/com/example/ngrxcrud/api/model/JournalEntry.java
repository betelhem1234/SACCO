package com.example.ngrxcrud.api.model;

import java.util.UUID;
import jakarta.persistence.Id;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "journal_entry")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class JournalEntry {

    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.UUID)
    private java.util.UUID id;
    private String ftp;
    private String description;
    private UUID accountId;
    private UUID targetId;
    private Long date;
    private Long createdAt;
    private Boolean isCredit;
    private Double amount;

    // getters/setters
}