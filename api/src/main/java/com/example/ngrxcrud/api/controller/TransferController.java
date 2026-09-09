package com.example.ngrxcrud.api.controller;

import com.example.ngrxcrud.api.model.Saving;
import com.example.ngrxcrud.api.model.SavingStatus;
import com.example.ngrxcrud.api.model.SavingType;
import com.example.ngrxcrud.api.model.Transfer;
import com.example.ngrxcrud.api.repository.SavingRepository;
import com.example.ngrxcrud.api.repository.SavingTypeRepository;
import com.example.ngrxcrud.api.repository.TransferRepository;
import com.example.ngrxcrud.api.service.JournalEntryService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/transfers")
@CrossOrigin(origins = "*")
public class TransferController {

    @Autowired
    private TransferRepository transferRepository;
    @Autowired
    private SavingTypeRepository savingTypeRepository;
    @Autowired
    private SavingRepository savingRepository;
    @Autowired
    private JournalEntryService journalEntryService;

    @GetMapping
    public List<Transfer> getAllTransfers() {
        return transferRepository.findAll();
    }

    @PostMapping
    @Transactional
    public Transfer addTransfer(@RequestBody Transfer transfer) {
        if (transfer.getCreatedAt() == null) transfer.setCreatedAt(System.currentTimeMillis());
        Transfer saved = transferRepository.save(transfer);

        SavingType sourceType = savingTypeRepository.findById(saved.getSourceSavingTypeId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Source saving type not found"));

        SavingType destType = savingTypeRepository.findById(saved.getDestinationSavingTypeId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Destination saving type not found"));

        // Journal entry: DEBIT source saving account (liability decreases)
        journalEntryService.recordDebitEntry(
                sourceType.getAccountId(),
                saved.getId(),
                saved.getFtp(),
                saved.getDate(),
                "Transfer out",
                saved.getAmount());

        // Journal entry: CREDIT destination saving account (liability increases)
        journalEntryService.recordCreditEntry(
                destType.getAccountId(),
                saved.getId(),
                saved.getFtp(),
                saved.getDate(),
                "Transfer in",
                saved.getAmount());

        // Negative saving entry for source
        recordSavingEntry(saved.getSourceMemberId(), saved.getSourceSavingTypeId(),
                saved, -saved.getAmount(), "Transfer out");

        // Positive saving entry for destination
        recordSavingEntry(saved.getDestinationMemberId(), saved.getDestinationSavingTypeId(),
                saved, saved.getAmount(), "Transfer in");

        return saved;
    }

    @PutMapping("/{id}")
    @Transactional
    public Transfer updateTransfer(@PathVariable UUID id, @RequestBody Transfer transfer) {
        transfer.setId(id);
        if (transfer.getCreatedAt() == null) transfer.setCreatedAt(System.currentTimeMillis());
        Transfer saved = transferRepository.save(transfer);

        SavingType sourceType = savingTypeRepository.findById(saved.getSourceSavingTypeId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Source saving type not found"));

        SavingType destType = savingTypeRepository.findById(saved.getDestinationSavingTypeId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Destination saving type not found"));

        journalEntryService.deleteEntriesByTargetId(saved.getId());

        journalEntryService.recordDebitEntry(
                sourceType.getAccountId(),
                saved.getId(),
                saved.getFtp(),
                saved.getDate(),
                "Transfer out",
                saved.getAmount());

        journalEntryService.recordCreditEntry(
                destType.getAccountId(),
                saved.getId(),
                saved.getFtp(),
                saved.getDate(),
                "Transfer in",
                saved.getAmount());

        // Replace old saving entries
        savingRepository.findByTransferId(id).ifPresent(savingRepository::delete);
        recordSavingEntry(saved.getSourceMemberId(), saved.getSourceSavingTypeId(),
                saved, -saved.getAmount(), "Transfer out");
        recordSavingEntry(saved.getDestinationMemberId(), saved.getDestinationSavingTypeId(),
                saved, saved.getAmount(), "Transfer in");

        return saved;
    }

    @DeleteMapping("/{id}")
    @Transactional
    public void deleteTransfer(@PathVariable UUID id) {
        savingRepository.findByTransferId(id).ifPresent(savingRepository::delete);
        journalEntryService.deleteEntriesByTargetId(id);
        transferRepository.deleteById(id);
    }

    private void recordSavingEntry(UUID memberId, UUID savingTypeId, Transfer transfer,
                                    Double amount, String prefix) {
        Saving saving = new Saving();
        saving.setMemberId(memberId);
        saving.setSavingAmount(amount);
        saving.setSavingDate(transfer.getDate());
        saving.setFtp(transfer.getFtp());
        saving.setSavingType(savingTypeId);
        saving.setAccountId(savingTypeId);
        saving.setTransferId(transfer.getId());
        saving.setRemark(transfer.getRemark() != null ? prefix + ": " + transfer.getRemark() : prefix);
        saving.setCreatedAt(System.currentTimeMillis());
        saving.setStatus(SavingStatus.POSTED);
        savingRepository.save(saving);
    }
}
