package com.example.ngrxcrud.api.controller;

import com.example.ngrxcrud.api.model.SharePurchase;
import com.example.ngrxcrud.api.model.ShareStatus;
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

import java.util.ArrayList;
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
    @Transactional
    public ShareSubscription addSubscription(@RequestBody ShareSubscription sub) {
        if (sub.getCreatedAt() == null) sub.setCreatedAt(System.currentTimeMillis());
        enforceShareSettingsConfigured();
        enforceAuthorizedCapitalForSubscription(sub, null);
        sub.setStatus(requiresApproval() ? ShareStatus.PENDING : ShareStatus.POSTED);
        return subscriptionRepository.save(sub);
    }

    @PutMapping("/subscriptions/{id}")
    @Transactional
    public ShareSubscription updateSubscription(@PathVariable UUID id, @RequestBody ShareSubscription incoming) {
        ShareSubscription existing = subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Subscription not found"));
        ShareStatus status = ShareStatus.resolve(existing.getStatus());
        if (!status.canEdit()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Posted subscriptions cannot be edited");
        }
        enforceShareSettingsConfigured();
        enforceAuthorizedCapitalForSubscription(incoming, id);
        enforceSubscriptionCoversPurchase(incoming.getMemberId(), id, incoming.getTotalAmount());
        existing.setMemberId(incoming.getMemberId());
        existing.setUnits(incoming.getUnits());
        existing.setTotalAmount(incoming.getTotalAmount());
        existing.setSubscriptionDate(incoming.getSubscriptionDate());
        existing.setRemark(incoming.getRemark());
        ShareStatus effective = incoming.getStatus() != null ? incoming.getStatus() : status;
        existing.setStatus(effective);
        return subscriptionRepository.save(existing);
    }

    @DeleteMapping("/subscriptions/{id}")
    @Transactional
    public void deleteSubscription(@PathVariable UUID id) {
        ShareSubscription existing = subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Subscription not found"));
        ShareStatus status = ShareStatus.resolve(existing.getStatus());
        if (!status.canDelete()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Posted subscriptions cannot be deleted");
        }
        enforceSubscriptionCoversPurchase(existing.getMemberId(), id, null);
        subscriptionRepository.deleteById(id);
    }

    @PostMapping("/subscriptions/{id}/approve")
    @Transactional
    public ShareSubscription approveSubscription(@PathVariable UUID id, @RequestBody(required = false) ShareSubscription req) {
        ShareSubscription existing = subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Subscription not found"));
        ShareStatus status = ShareStatus.resolve(existing.getStatus());
        if (!status.canApprove()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only PENDING subscriptions can be approved");
        }
        enforceShareSettingsConfigured();
        enforceAuthorizedCapitalForSubscription(existing, existing.getId());
        existing.setStatus(ShareStatus.POSTED);
        existing.setApprovedBy(req != null ? req.getApprovedBy() : null);
        existing.setApprovedAt(System.currentTimeMillis());
        return subscriptionRepository.save(existing);
    }

    @PostMapping("/subscriptions/{id}/reject")
    @Transactional
    public ShareSubscription rejectSubscription(@PathVariable UUID id) {
        ShareSubscription existing = subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Subscription not found"));
        ShareStatus status = ShareStatus.resolve(existing.getStatus());
        if (!status.canReject()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only PENDING subscriptions can be rejected");
        }
        existing.setStatus(ShareStatus.REJECTED);
        return subscriptionRepository.save(existing);
    }

    @PostMapping("/subscriptions/{id}/reverse")
    @Transactional
    public ShareSubscription reverseSubscription(@PathVariable UUID id) {
        ShareSubscription existing = subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Subscription not found"));
        ShareStatus status = ShareStatus.resolve(existing.getStatus());
        if (!status.canReverse()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only POSTED subscriptions can be reversed to PENDING");
        }
        enforceSubscriptionCoversPurchase(existing.getMemberId(), id, null);
        existing.setStatus(ShareStatus.PENDING);
        return subscriptionRepository.save(existing);
    }

    // ---- Purchases ----

    @PostMapping("/purchases")
    @Transactional
    public SharePurchase addPurchase(@RequestBody SharePurchase purchase) {
        if (purchase.getCreatedAt() == null) purchase.setCreatedAt(System.currentTimeMillis());
        enforceShareSettingsConfigured();
        enforceAuthorizedCapitalForPurchase(purchase, null);
        enforceSubscriptionForPurchase(purchase, null);
        purchase.setStatus(requiresApproval() ? ShareStatus.PENDING : ShareStatus.POSTED);
        SharePurchase saved = purchaseRepository.save(purchase);
        if (ShareStatus.resolve(saved.getStatus()).postsToLedger()) {
            recordPurchaseJournalEntries(saved);
        }
        return saved;
    }

    @PutMapping("/purchases/{id}")
    @Transactional
    public SharePurchase updatePurchase(@PathVariable UUID id, @RequestBody SharePurchase incoming) {
        SharePurchase existing = purchaseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Purchase not found"));
        ShareStatus status = ShareStatus.resolve(existing.getStatus());
        if (!status.canEdit()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Posted purchases cannot be edited");
        }
        enforceShareSettingsConfigured();
        enforceAuthorizedCapitalForPurchase(incoming, id);
        enforceSubscriptionForPurchase(incoming, id);
        existing.setMemberId(incoming.getMemberId());
        existing.setUnits(incoming.getUnits());
        existing.setTotalAmount(incoming.getTotalAmount());
        existing.setPurchaseDate(incoming.getPurchaseDate()); 
        existing.setBankId(incoming.getBankId());
        existing.setTransactionReference(incoming.getTransactionReference());
        existing.setServiceFee(incoming.getServiceFee());
        existing.setRemark(incoming.getRemark());
        ShareStatus effective = incoming.getStatus() != null ? incoming.getStatus() : status;
        existing.setStatus(effective);
        SharePurchase saved = purchaseRepository.save(existing);

        if (effective.postsToLedger() && !status.postsToLedger()) {
            journalEntryService.deleteEntriesByTargetId(saved.getId());
            recordPurchaseJournalEntries(saved);
        }
        return saved;
    }

    @DeleteMapping("/purchases/{id}")
    @Transactional
    public void deletePurchase(@PathVariable UUID id) {
        SharePurchase existing = purchaseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Purchase not found"));
        ShareStatus status = ShareStatus.resolve(existing.getStatus());
        if (!status.canDelete()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Posted purchases cannot be deleted");
        }
        journalEntryService.deleteEntriesByTargetId(id);
        purchaseRepository.deleteById(id);
    }

    @GetMapping("/purchases")
    public List<SharePurchase> getAllPurchases() {
        return purchaseRepository.findAll();
    }

    @PostMapping("/purchases/{id}/approve")
    @Transactional
    public SharePurchase approvePurchase(@PathVariable UUID id, @RequestBody(required = false) SharePurchase req) {
        SharePurchase existing = purchaseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Purchase not found"));
        ShareStatus status = ShareStatus.resolve(existing.getStatus());
        if (!status.canApprove()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only PENDING purchases can be approved");
        }
        enforceShareSettingsConfigured();
        enforceAuthorizedCapitalForPurchase(existing, existing.getId());
        enforceSubscriptionForPurchase(existing, existing.getId());
        existing.setStatus(ShareStatus.POSTED);
        existing.setApprovedBy(req != null ? req.getApprovedBy() : null);
        existing.setApprovedAt(System.currentTimeMillis());
        SharePurchase saved = purchaseRepository.save(existing);
        recordPurchaseJournalEntries(saved);
        return saved;
    }

    @PostMapping("/purchases/{id}/reject")
    @Transactional
    public SharePurchase rejectPurchase(@PathVariable UUID id) {
        SharePurchase existing = purchaseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Purchase not found"));
        ShareStatus status = ShareStatus.resolve(existing.getStatus());
        if (!status.canReject()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only PENDING purchases can be rejected");
        }
        existing.setStatus(ShareStatus.REJECTED);
        return purchaseRepository.save(existing);
    }

    @PostMapping("/purchases/{id}/reverse")
    @Transactional
    public SharePurchase reversePurchase(@PathVariable UUID id) {
        SharePurchase existing = purchaseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Purchase not found"));
        ShareStatus status = ShareStatus.resolve(existing.getStatus());
        if (!status.canReverse()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only POSTED purchases can be reversed to PENDING");
        }
        if (existing.getTransferId() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Transfer-linked purchases cannot be reversed; reverse the share transfer instead");
        }
        journalEntryService.deleteEntriesByTargetId(id);
        existing.setStatus(ShareStatus.PENDING);
        return purchaseRepository.save(existing);
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

    private boolean requiresApproval() {
        String v = readSetting("share_requires_approval");
        return v != null && Boolean.parseBoolean(v.trim());
    }

    private double readSettingDouble(String key) {
        String v = readSetting(key);
        if (v == null || v.isBlank()) return 0;
        try {
            return Double.parseDouble(v.trim());
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    private double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }

    private void rejectIfOverAuthorized(String what, double totalShareCapital) {
        double authorized = readSettingDouble("authorized_capital");
        if (authorized <= 0) return;
        if (totalShareCapital > authorized + 0.001) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    what + " exceeds the authorized share capital of " + round2(authorized));
        }
    }

    private void enforceAuthorizedCapitalForPurchase(SharePurchase incoming, UUID excludeId) {
        double amount = incoming.getTotalAmount() != null ? incoming.getTotalAmount() : 0;
        double fee = incoming.getServiceFee() != null ? Math.min(incoming.getServiceFee(), amount) : 0;
        if (amount <= 0) return;
        double total = Math.max(amount - fee, 0);
        for (SharePurchase p : purchaseRepository.findAll()) {
            if (excludeId != null && excludeId.equals(p.getId())) continue;
            if (!ShareStatus.resolve(p.getStatus()).postsToLedger()) continue;
            double amt = p.getTotalAmount() != null ? p.getTotalAmount() : 0;
            double pFee = p.getServiceFee() != null ? Math.min(p.getServiceFee(), amt) : 0;
            if (amt > 0) {
                total = round2(total + Math.max(amt - pFee, 0));
            }
        }
        rejectIfOverAuthorized("This share purchase", total);
    }

    private void enforceAuthorizedCapitalForSubscription(ShareSubscription incoming, UUID excludeId) {
        double newAmount = incoming.getTotalAmount() != null ? incoming.getTotalAmount() : 0;
        if (newAmount <= 0) return;
        double total = newAmount;
        for (ShareSubscription s : subscriptionRepository.findAll()) {
            if (excludeId != null && excludeId.equals(s.getId())) continue;
            if (!ShareStatus.resolve(s.getStatus()).postsToLedger()) continue;
            double amt = s.getTotalAmount() != null ? s.getTotalAmount() : 0;
            if (amt > 0) {
                total = round2(total + amt);
            }
        }
        rejectIfOverAuthorized("This subscription", total);
    }

    private static final List<String> REQUIRED_SHARE_SETTINGS = List.of(
            "share_unit_price",
            "registration_fee",
            "minimum_share_unit",
            "maximum_share_unit",
            "share_purchase_account_id",
            "registration_fee_account_id");

    private void enforceShareSettingsConfigured() {
        List<String> missing = new ArrayList<>();
        for (String key : REQUIRED_SHARE_SETTINGS) {
            if (!hasSetting(key)) {
                missing.add(key);
            }
        }
        if (!missing.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Missing required share settings: " + String.join(", ", missing)
                            + ". Configure them in Settings > Share Settings before adding shares.");
        }
    }

    private boolean hasSetting(String key) {
        String v = readSetting(key);
        return v != null && !v.isBlank();
    }

    /**
     * Subscription-side invariant: a member's effective (POSTED) subscriptions,
     * after this operation, must still be >= their total share purchase value
     * (net of service fee). Called when a subscription is edited, deleted or
     * reversed so it can never drop below the purchases it covers.
     *
     * @param memberId   the member
     * @param excludeSubId  the subscription being removed/replaced (excluded from the total)
     * @param extraNewAmount replacement value for the target subscription
     *                       (the new totalAmount on edit, or null when removed)
     */
    private void enforceSubscriptionCoversPurchase(UUID memberId, UUID excludeSubId, Double extraNewAmount) {
        if (memberId == null) return;

        double subscribed = extraNewAmount != null ? extraNewAmount : 0;
        for (ShareSubscription s : subscriptionRepository.findAll()) {
            if (excludeSubId != null && excludeSubId.equals(s.getId())) continue;
            if (!memberId.equals(s.getMemberId())) continue;
            if (!ShareStatus.resolve(s.getStatus()).postsToLedger()) continue;
            double amt = s.getTotalAmount() != null ? s.getTotalAmount() : 0;
            if (amt > 0) subscribed = round2(subscribed + amt);
        }

        double purchased = 0;
        for (SharePurchase p : purchaseRepository.findAll()) {
            if (!memberId.equals(p.getMemberId())) continue;
            if (!ShareStatus.resolve(p.getStatus()).postsToLedger()) continue;
            double amt = p.getTotalAmount() != null ? p.getTotalAmount() : 0;
            double pFee = p.getServiceFee() != null ? Math.min(p.getServiceFee(), amt) : 0;
            if (amt > 0) purchased = round2(purchased + Math.max(amt - pFee, 0));
        }

        if (subscribed < purchased - 0.001) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "This operation would leave the member's subscribed amount (" + round2(subscribed)
                            + ") below their total share purchase value (" + round2(purchased)
                            + "). The subscription cannot be less than the purchases it covers.");
        }
    }

    private void enforceSubscriptionForPurchase(SharePurchase incoming, UUID excludeId) {
        UUID memberId = incoming.getMemberId();
        if (memberId == null) return;

        double subscribed = 0;
        for (ShareSubscription s : subscriptionRepository.findAll()) {
            if (memberId.equals(s.getMemberId())
                    && ShareStatus.resolve(s.getStatus()).postsToLedger()) {
                double amt = s.getTotalAmount() != null ? s.getTotalAmount() : 0;
                if (amt > 0) subscribed = round2(subscribed + amt);
            }
        }

        if (subscribed <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Please add an approved (posted) subscription before adding a purchase for this member.");
        }

        double amount = incoming.getTotalAmount() != null ? incoming.getTotalAmount() : 0;
        double fee = incoming.getServiceFee() != null ? Math.min(incoming.getServiceFee(), amount) : 0;
        double newNet = Math.max(amount - fee, 0);

        double purchasedNet = 0;
        for (SharePurchase p : purchaseRepository.findAll()) {
            if (excludeId != null && excludeId.equals(p.getId())) continue;
            if (!memberId.equals(p.getMemberId())) continue;
            if (!ShareStatus.resolve(p.getStatus()).postsToLedger()) continue;
            double amt = p.getTotalAmount() != null ? p.getTotalAmount() : 0;
            double pFee = p.getServiceFee() != null ? Math.min(p.getServiceFee(), amt) : 0;
            if (amt > 0) purchasedNet = round2(purchasedNet + Math.max(amt - pFee, 0));
        }

        double remaining = round2(subscribed - purchasedNet);
        if (newNet > remaining + 0.001) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "This purchase of " + round2(newNet) + " exceeds the member's posted subscription amount of "
                            + round2(subscribed) + " (remaining after current purchases: " + round2(remaining) + ").");
        }
    }
}
