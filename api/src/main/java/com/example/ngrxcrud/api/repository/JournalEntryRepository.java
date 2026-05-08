package com.example.ngrxcrud.api.repository;

import com.example.ngrxcrud.api.model.JournalEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JournalEntryRepository extends JpaRepository<JournalEntry, java.util.UUID> {
    void deleteByTargetId(java.util.UUID targetId);
}
