package com.example.ngrxcrud.api.controller;

import com.example.ngrxcrud.api.model.Withdrawal;
import com.example.ngrxcrud.api.model.SavingType;
import com.example.ngrxcrud.api.repository.SavingTypeRepository;
import com.example.ngrxcrud.api.repository.WithdrawalRepository;
import com.example.ngrxcrud.api.service.JournalEntryService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/withdrawals")
@CrossOrigin(origins = "*")
public class WithdrawalController {

    @Autowired
    private WithdrawalRepository withdrawalRepository;
    @Autowired
    private SavingTypeRepository savingTypeRepository;
    @Autowired
    private JournalEntryService journalEntryService;

    @GetMapping
    public List<Withdrawal> getAllWithdrawals() {
        return withdrawalRepository.findAll();
    }

    @PostMapping
    @Transactional
    public Withdrawal addWithdrawal(@RequestBody Withdrawal withdrawal) {
        Withdrawal saved = withdrawalRepository.save(withdrawal);

        SavingType type = savingTypeRepository.findById(saved.getSavingTypeId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Saving type not found"));

        // DEBIT saving account (money leaves savings ledger)
        journalEntryService.recordDebitEntry(
                type.getAccountId(),
                saved.getId(),
                saved.getFtp(),
                saved.getDate(),
                "Withdrawal",
                saved.getAmount());

        // CREDIT bank account (cash paid to member)
        journalEntryService.recordCreditEntry(
                saved.getBankId(),
                saved.getId(),
                saved.getFtp(),
                saved.getDate(),
                "Withdrawal",
                saved.getAmount());

        return saved;
    }

    @PutMapping("/{id}")
    @Transactional
    public Withdrawal updateWithdrawal(@PathVariable UUID id, @RequestBody Withdrawal withdrawal) {
        withdrawal.setId(id);
        Withdrawal saved = withdrawalRepository.save(withdrawal);

        SavingType type = savingTypeRepository.findById(saved.getSavingTypeId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Saving type not found"));

        // Replace old journal entries with fresh ones reflecting the updated values
        journalEntryService.deleteEntriesByTargetId(saved.getId());

        journalEntryService.recordDebitEntry(
                type.getAccountId(),
                saved.getId(),
                saved.getFtp(),
                saved.getDate(),
                "Withdrawal",
                saved.getAmount());

        journalEntryService.recordCreditEntry(
                saved.getBankId(),
                saved.getId(),
                saved.getFtp(),
                saved.getDate(),
                "Withdrawal",
                saved.getAmount());

        return saved;
    }

    @DeleteMapping("/{id}")
    @Transactional
    public void deleteWithdrawal(@PathVariable UUID id) {
        journalEntryService.deleteEntriesByTargetId(id);
        withdrawalRepository.deleteById(id);
    }
}
