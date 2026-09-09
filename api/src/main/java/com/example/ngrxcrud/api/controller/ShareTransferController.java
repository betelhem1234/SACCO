package com.example.ngrxcrud.api.controller;

import com.example.ngrxcrud.api.model.SharePurchase;
import com.example.ngrxcrud.api.model.ShareTransfer;
import com.example.ngrxcrud.api.repository.SharePurchaseRepository;
import com.example.ngrxcrud.api.repository.ShareTransferRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/share-transfers")
@CrossOrigin(origins = "*")
public class ShareTransferController {

    @Autowired
    private ShareTransferRepository shareTransferRepository;

    @Autowired
    private SharePurchaseRepository sharePurchaseRepository;

    @GetMapping
    public List<ShareTransfer> getAll() {
        return shareTransferRepository.findAll();
    }

    @PostMapping
    @Transactional
    public ShareTransfer create(@RequestBody ShareTransfer transfer) {
        if (transfer.getCreatedAt() == null) transfer.setCreatedAt(System.currentTimeMillis());
        ShareTransfer saved = shareTransferRepository.save(transfer);
        recordShareEntries(saved);
        return saved;
    }

    @PutMapping("/{id}")
    @Transactional
    public ShareTransfer update(@PathVariable UUID id, @RequestBody ShareTransfer transfer) {
        transfer.setId(id);
        if (transfer.getCreatedAt() == null) transfer.setCreatedAt(System.currentTimeMillis());
        sharePurchaseRepository.findByTransferId(id).ifPresent(sharePurchaseRepository::delete);
        ShareTransfer saved = shareTransferRepository.save(transfer);
        recordShareEntries(saved);
        return saved;
    }

    @DeleteMapping("/{id}")
    @Transactional
    public void delete(@PathVariable UUID id) {
        sharePurchaseRepository.findByTransferId(id).ifPresent(sharePurchaseRepository::delete);
        shareTransferRepository.deleteById(id);
    }

    private void recordShareEntries(ShareTransfer transfer) {
        recordPurchase(transfer.getSourceMemberId(), -transfer.getUnits(), -transfer.getTotalAmount(),
                transfer, "Transfer out: " + (transfer.getRemark() != null ? transfer.getRemark() : ""));
        recordPurchase(transfer.getDestinationMemberId(), transfer.getUnits(), transfer.getTotalAmount(),
                transfer, "Transfer in: " + (transfer.getRemark() != null ? transfer.getRemark() : ""));
    }

    private void recordPurchase(UUID memberId, Double units, Double totalAmount,
                                 ShareTransfer transfer, String remark) {
        SharePurchase purchase = new SharePurchase();
        purchase.setMemberId(memberId);
        purchase.setUnits(units);
        purchase.setTotalAmount(totalAmount);
        purchase.setPurchaseDate(transfer.getTransferDate());
        purchase.setTransactionReference(transfer.getFtp());
        purchase.setServiceFee(0.0);
        purchase.setTransferId(transfer.getId());
        purchase.setRemark(remark);
        purchase.setCreatedAt(System.currentTimeMillis());
        sharePurchaseRepository.save(purchase);
    }
}
