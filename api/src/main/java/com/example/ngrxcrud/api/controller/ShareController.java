package com.example.ngrxcrud.api.controller;

import com.example.ngrxcrud.api.model.SharePurchase;
import com.example.ngrxcrud.api.model.ShareSubscription;
import com.example.ngrxcrud.api.repository.SettingRepository;
import com.example.ngrxcrud.api.repository.SharePurchaseRepository;
import com.example.ngrxcrud.api.repository.ShareSubscriptionRepository;
import com.example.ngrxcrud.api.service.JournalEntryService;

import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/shares")
@CrossOrigin(origins = "*")
public class ShareController {

    @Autowired
    private ShareSubscriptionRepository subscriptionRepository;

    @Autowired
    private SharePurchaseRepository purchaseRepository;

    @Autowired
    private SettingRepository settingRepository;

    @Autowired
    private JournalEntryService journalEntryService;

    // ---- Subscriptions ----

    @GetMapping("/subscriptions")
    public List<ShareSubscription> getAllSubscriptions() {
        return subscriptionRepository.findAll();
    }

    @PostMapping("/subscriptions")
    public ShareSubscription addSubscription(@RequestBody ShareSubscription sub) {
        if (sub.getCreatedAt() == null) sub.setCreatedAt(System.currentTimeMillis());
        return subscriptionRepository.save(sub);
    }

    @PutMapping("/subscriptions/{id}")
    public ShareSubscription updateSubscription(@PathVariable UUID id, @RequestBody ShareSubscription incoming) {
        ShareSubscription existing = subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Subscription not found"));
        existing.setMemberId(incoming.getMemberId());
        existing.setUnits(incoming.getUnits());
        existing.setTotalAmount(incoming.getTotalAmount());
        existing.setSubscriptionDate(incoming.getSubscriptionDate());
        existing.setRemark(incoming.getRemark());
        return subscriptionRepository.save(existing);
    }

    @DeleteMapping("/subscriptions/{id}")
    public void deleteSubscription(@PathVariable UUID id) {
        subscriptionRepository.deleteById(id);
    }

    // ---- Purchases ----

    @PostMapping("/purchases")
    @Transactional
    public SharePurchase addPurchase(@RequestBody SharePurchase purchase) {
        if (purchase.getCreatedAt() == null) purchase.setCreatedAt(System.currentTimeMillis());
        SharePurchase saved = purchaseRepository.save(purchase);
        recordPurchaseJournalEntries(saved);
        return saved;
    }

    @PutMapping("/purchases/{id}")
    @Transactional
    public SharePurchase updatePurchase(@PathVariable UUID id, @RequestBody SharePurchase incoming) {
        SharePurchase existing = purchaseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Purchase not found"));
        existing.setMemberId(incoming.getMemberId());
        existing.setUnits(incoming.getUnits());
        existing.setTotalAmount(incoming.getTotalAmount());
        existing.setPurchaseDate(incoming.getPurchaseDate());
        existing.setBankId(incoming.getBankId());
        existing.setTransactionReference(incoming.getTransactionReference());
        existing.setServiceFee(incoming.getServiceFee());
        existing.setRemark(incoming.getRemark());
        SharePurchase saved = purchaseRepository.save(existing);

        journalEntryService.deleteEntriesByTargetId(saved.getId());
        recordPurchaseJournalEntries(saved);
        return saved;
    }

    @DeleteMapping("/purchases/{id}")
    @Transactional
    public void deletePurchase(@PathVariable UUID id) {
        journalEntryService.deleteEntriesByTargetId(id);
        purchaseRepository.deleteById(id);
    }

    @GetMapping("/purchases")
    public List<SharePurchase> getAllPurchases() {
        return purchaseRepository.findAll();
    }

    private void recordPurchaseJournalEntries(SharePurchase purchase) {
        UUID bankId = purchase.getBankId();
        if (bankId == null) return;

        String sharePurchaseAccountId = readSetting("share_purchase_account_id");
        String regFeeAccountId = readSetting("registration_fee_account_id");
        if (sharePurchaseAccountId == null && regFeeAccountId == null) return;

        double amount = purchase.getTotalAmount() != null ? purchase.getTotalAmount() : 0;
        double serviceFee = purchase.getServiceFee() != null ? purchase.getServiceFee() : 0;
        if (amount <= 0) return;

        // Ensure fee does not exceed total amount (always keeps entries balanced)
        double actualFee = Math.min(serviceFee, amount);
        double shareAmount = amount - actualFee;

        String ftp = purchase.getTransactionReference() != null ? purchase.getTransactionReference() : "";
        Long date = purchase.getPurchaseDate() != null ? purchase.getPurchaseDate() : System.currentTimeMillis();

        // Debit bank for total amount received
        journalEntryService.recordDebitEntry(
                bankId, purchase.getId(), ftp, date,
                "Share purchase", amount);

        // Credit share purchase account (net of fee)
        if (sharePurchaseAccountId != null && shareAmount > 0) {
            journalEntryService.recordCreditEntry(
                    UUID.fromString(sharePurchaseAccountId), purchase.getId(), ftp, date,
                    "Share purchase", shareAmount);
        }

        // Credit registration fee account
        if (regFeeAccountId != null && actualFee > 0) {
            journalEntryService.recordCreditEntry(
                    UUID.fromString(regFeeAccountId), purchase.getId(), ftp, date,
                    "Registration fee", actualFee);
        }
    }

    private String readSetting(String key) {
        return settingRepository.findByKey(key)
                .map(s -> s.getValue())
                .orElse(null);
    }
}
