package com.example.ngrxcrud.api.controller;

import com.example.ngrxcrud.api.model.Saving;
import com.example.ngrxcrud.api.model.SavingType;
import com.example.ngrxcrud.api.repository.SavingRepository;
import com.example.ngrxcrud.api.repository.SavingTypeRepository;
import com.example.ngrxcrud.api.service.JournalEntryService;

import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/savings")
@CrossOrigin(origins = "*")
public class SavingController {

    @Autowired
    private SavingRepository savingRepository;
    @Autowired
    private SavingTypeRepository savingTypeRepository;
    @Autowired
    private JournalEntryService journalEntryService;

    @GetMapping
    public List<Saving> getAllSavings() {
        return savingRepository.findAll();
    }

    // @PostMapping
    // public Saving addSaving(@RequestBody Saving saving) {
    // // return savingRepository.save(saving);
    // // 1. Save saving first
    // Saving saved = savingRepository.save(saving);
    // // 2. Get saving type → account_id
    // SavingType type = savingTypeRepository.findById(saved.getSavingType())
    // .orElseThrow(() -> new RuntimeException("Saving type not found"));

    // UUID savingAccountId = type.getAccountId();
    // UUID bankAccountId = saved.getAccountId(); // assuming this is bank

    // // 3. Credit entry (saving account)
    // JournalEntry credit = new JournalEntry();
    // credit.setAccountId(savingAccountId);
    // credit.setTargetId(saved.getId());
    // credit.setDate(saved.getSavingDate());
    // credit.setCreatedAt(now);
    // credit.setIsCredit(true);
    // credit.setDescription("Saving deposit");

    // // 4. Debit entry (bank account)
    // JournalEntry debit = new JournalEntry();
    // debit.setAccountId(bankAccountId);
    // debit.setTargetId(saved.getId());
    // debit.setDate(saved.getSavingDate());
    // debit.setCreatedAt(now);
    // debit.setIsCredit(false);
    // debit.setDescription("Saving deposit");

    // // 5. Save both
    // journalEntryRepository.save(credit);
    // journalEntryRepository.save(debit);

    // return saved;

    // }

    @PostMapping
    @jakarta.transaction.Transactional
    public Saving addSaving(@RequestBody Saving saving) {
        Saving saved = savingRepository.save(saving);

        SavingType type = savingTypeRepository.findById(saved.getSavingType())
                .orElseThrow(() -> new RuntimeException("Saving type not found"));

        // DEBIT bank account (cash received)
        journalEntryService.recordDebitEntry(
                saved.getAccountId(),
                saved.getId(),
                saved.getFtp(),
                saved.getSavingDate(),
                "Saving deposit",
                saved.getSavingAmount());

        // CREDIT saving ledger account (liability increases)
        journalEntryService.recordCreditEntry(
                type.getAccountId(),
                saved.getId(),
                saved.getFtp(),
                saved.getSavingDate(),
                "Saving deposit",
                saved.getSavingAmount());

        return saved;
    }

    @PutMapping("/{id}")
    @Transactional
    public Saving updateSaving(@PathVariable UUID id, @RequestBody Saving incoming) {
        Saving existing = savingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Saving not found"));
        existing.setMemberId(incoming.getMemberId());
        existing.setSavingAmount(incoming.getSavingAmount());
        existing.setSavingDate(incoming.getSavingDate());
        existing.setFtp(incoming.getFtp());
        existing.setSavingType(incoming.getSavingType());
        existing.setAccountId(incoming.getAccountId());
        existing.setRemark(incoming.getRemark());
        Saving saved = savingRepository.save(existing);

        SavingType type = savingTypeRepository.findById(saved.getSavingType())
                .orElseThrow(() -> new RuntimeException("Saving type not found"));

        // Replace old journal entries with fresh ones reflecting the updated values
        journalEntryService.deleteEntriesByTargetId(saved.getId());

        journalEntryService.recordDebitEntry(
                saved.getAccountId(),
                saved.getId(),
                saved.getFtp(),
                saved.getSavingDate(),
                "Saving deposit",
                saved.getSavingAmount());

        journalEntryService.recordCreditEntry(
                type.getAccountId(),
                saved.getId(),
                saved.getFtp(),
                saved.getSavingDate(),
                "Saving deposit",
                saved.getSavingAmount());

        return saved;
    }

    @DeleteMapping("/{id}")
    @Transactional
    public void deleteSaving(@PathVariable java.util.UUID id) {
        journalEntryService.deleteEntriesByTargetId(id);
        savingRepository.deleteById(id);
    }
}
