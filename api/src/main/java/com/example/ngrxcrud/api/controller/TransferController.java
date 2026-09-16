package com.example.ngrxcrud.api.controller;

import com.example.ngrxcrud.api.model.Transfer;
import com.example.ngrxcrud.api.model.TransferStatus;
import com.example.ngrxcrud.api.repository.TransferRepository;
import com.example.ngrxcrud.api.service.TransferService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/transfers")
@CrossOrigin(origins = "*")
public class TransferController {

    @Autowired
    private TransferRepository transferRepository;
    @Autowired
    private TransferService transferService;

    @GetMapping
    public List<Transfer> getAllTransfers() {
        return transferRepository.findAll();
    }

    @PostMapping
    @Transactional
    public Transfer addTransfer(@RequestBody Transfer transfer) {
        return transferService.createTransfer(transfer);
    }

    @PutMapping("/{id}")
    @Transactional
    public Transfer updateTransfer(@PathVariable UUID id, @RequestBody Transfer transfer) {
        return transferService.updateTransfer(id, transfer);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public void deleteTransfer(@PathVariable UUID id) {
        transferService.deleteTransfer(id);
    }

    @PostMapping("/{id}/pay-fee")
    @Transactional
    public Transfer payFee(@PathVariable UUID id, @RequestBody(required = false) Map<String, Object> body) {
        UUID feePaidBy = parseUuid(body, "feePaidBy");
        String reference = body != null ? (String) body.get("feeReference") : null;
        return transferService.payTransferFee(id, feePaidBy, reference);
    }

    @PostMapping("/{id}/approve")
    @Transactional
    public Transfer approve(@PathVariable UUID id, @RequestBody(required = false) Map<String, Object> body) {
        UUID approvedBy = parseUuid(body, "approvedBy");
        return transferService.approveTransfer(id, approvedBy);
    }

    @PostMapping("/{id}/execute")
    @Transactional
    public Transfer execute(@PathVariable UUID id, @RequestBody(required = false) Map<String, Object> body) {
        UUID executedBy = parseUuid(body, "executedBy");
        return transferService.executeTransfer(id, executedBy);
    }

    @PostMapping("/{id}/reject")
    @Transactional
    public Transfer reject(@PathVariable UUID id) {
        return transferService.rejectTransfer(id);
    }

    private UUID parseUuid(Map<String, Object> body, String key) {
        if (body == null || body.get(key) == null) return null;
        try {
            return UUID.fromString(String.valueOf(body.get(key)));
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}