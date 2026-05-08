package com.example.ngrxcrud.api.service;

import com.example.ngrxcrud.api.model.JournalEntry;
import com.example.ngrxcrud.api.repository.JournalEntryRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class JournalEntryService {

    @Autowired
    private JournalEntryRepository journalEntryRepository;

    /**
     * Removes all journal entries linked to a source transaction.
     * Call this before re-recording entries on update, or on delete.
     */
    @Transactional
    public void deleteEntriesByTargetId(UUID targetId) {
        journalEntryRepository.deleteByTargetId(targetId);
    }

    /**
     * Records a single DEBIT journal entry (isCredit = false).
     * Call once per account being debited.
     */
    public void recordDebitEntry(
            UUID accountId,
            UUID targetId,
            String ftp,
            Long date,
            String description,
            Double amount) {

        JournalEntry entry = new JournalEntry();
        entry.setAccountId(accountId);
        entry.setTargetId(targetId);
        entry.setFtp(ftp);
        entry.setDate(date);
        entry.setCreatedAt(System.currentTimeMillis());
        entry.setIsCredit(false);
        entry.setDescription(description);
        entry.setAmount(amount);
        journalEntryRepository.save(entry);
    }

    /**
     * Records a single CREDIT journal entry (isCredit = true).
     * Call once per account being credited.
     */
    public void recordCreditEntry(
            UUID accountId,
            UUID targetId,
            String ftp,
            Long date,
            String description,
            Double amount) {

        JournalEntry entry = new JournalEntry();
        entry.setAccountId(accountId);
        entry.setTargetId(targetId);
        entry.setFtp(ftp);
        entry.setDate(date);
        entry.setCreatedAt(System.currentTimeMillis());
        entry.setIsCredit(true);
        entry.setDescription(description);
        entry.setAmount(amount);
        journalEntryRepository.save(entry);
    }
}
