package com.example.ngrxcrud.api.service;

import com.example.ngrxcrud.api.model.Saving;
import com.example.ngrxcrud.api.model.SavingStatus;
import com.example.ngrxcrud.api.model.SavingType;
import com.example.ngrxcrud.api.model.Transfer;
import com.example.ngrxcrud.api.model.TransferFeeSource;
import com.example.ngrxcrud.api.model.TransferStatus;
import com.example.ngrxcrud.api.repository.SavingRepository;
import com.example.ngrxcrud.api.repository.SavingTypeRepository;
import com.example.ngrxcrud.api.repository.SettingRepository;
import com.example.ngrxcrud.api.repository.TransferRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
public class TransferService {

    public static final String TRANSFER_REQUIRES_APPROVAL_KEY = "transfer_requires_approval";
    public static final String TRANSFER_REQUIRES_SERVICE_FEE_KEY = "transfer_requires_service_fee";
    public static final String TRANSFER_SERVICE_FEE_FLAT_KEY = "transfer_service_fee_flat";
    public static final String TRANSFER_SERVICE_FEE_PERCENTAGE_KEY = "transfer_service_fee_percentage";
    public static final String TRANSFER_SERVICE_FEE_ACCOUNT_ID_KEY = "transfer_service_fee_account_id";
    public static final String TRANSFER_FEE_PAYMENT_STAGE_KEY = "transfer_fee_payment_stage";

    public static final String FEE_STAGE_SAME_TIME = "SAME_TIME";
    public static final String FEE_STAGE_FEE_FIRST = "FEE_FIRST";

    @Autowired
    private TransferRepository transferRepository;
    @Autowired
    private SavingTypeRepository savingTypeRepository;
    @Autowired
    private SavingRepository savingRepository;
    @Autowired
    private SettingRepository settingRepository;
    @Autowired
    private JournalEntryService journalEntryService;

    // ─── Settings lookup ─────────────────────────────────────────────────────

    public boolean requiresApproval() {
        return readBool(TRANSFER_REQUIRES_APPROVAL_KEY);
    }

    public boolean requiresServiceFee() {
        return readBool(TRANSFER_REQUIRES_SERVICE_FEE_KEY);
    }

    public double serviceFeeFlat() {
        return readDouble(TRANSFER_SERVICE_FEE_FLAT_KEY);
    }

    public double serviceFeePercentage() {
        return readDouble(TRANSFER_SERVICE_FEE_PERCENTAGE_KEY);
    }

    public String serviceFeeAccountId() {
        return readSetting(TRANSFER_SERVICE_FEE_ACCOUNT_ID_KEY);
    }

    public boolean isFeeFirst() {
        String stage = readSetting(TRANSFER_FEE_PAYMENT_STAGE_KEY);
        if (stage == null) return false;
        return FEE_STAGE_FEE_FIRST.equalsIgnoreCase(stage.trim());
    }

    /**
     * A service fee applies only when the feature is enabled, a fee credit
     * account is configured, and either the flat fee or the percentage is > 0.
     */
    public boolean feePayable() {
        if (!requiresServiceFee()) return false;
        String account = serviceFeeAccountId();
        if (account == null || account.isBlank()) return false;
        return serviceFeeFlat() > 0 || serviceFeePercentage() > 0;
    }

    /** Computes the service fee for a transfer amount: flat OR percentage (never both). */
    public double computeFee(double amount) {
        if (!requiresServiceFee()) return 0;
        double flat = serviceFeeFlat();
        double pct = serviceFeePercentage();
        if (flat <= 0 && pct <= 0) return 0;
        String account = serviceFeeAccountId();
        if (account == null || account.isBlank()) return 0;
        if (flat > 0 && pct > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Choose either a flat service fee or a percentage, not both");
        }
        return round2(flat > 0 ? flat : round2(amount * pct / 100.0));
    }

    // ─── Lifecycle ───────────────────────────────────────────────────────────

    /**
     * Creates a transfer. Status depends on settings:
     * <ul>
     *   <li>approval on            → PENDING (no ledger)</li>
     *   <li>"fee first" + fee due  → PENDING (fee must be paid first)</li>
     *   <li>otherwise              → POSTED immediately (ledger; fee with it)</li>
     * </ul>
     */
    @Transactional
    public Transfer createTransfer(Transfer transfer) {
        TransferStatus status;
        double fee = computeFee(transfer.getAmount() != null ? transfer.getAmount() : 0);
        transfer.setServiceFee(fee > 0 ? fee : 0);
        if (requiresApproval()) {
            status = TransferStatus.PENDING;
        } else if (isFeeFirst() && feePayable()) {
            status = TransferStatus.PENDING;
        } else {
            status = TransferStatus.POSTED;
        }
        if (transfer.getCreatedAt() == null) {
            transfer.setCreatedAt(System.currentTimeMillis());
        }
        transfer.setStatus(status);
        if (fee <= 0 || !requiresServiceFee()) {
            transfer.setFeeSource(TransferFeeSource.NONE);
        }
        if (transfer.getFeeSource() == null) {
            transfer.setFeeSource(TransferFeeSource.NONE);
        }
        Transfer saved = transferRepository.save(transfer);
        if (TransferStatus.resolve(saved.getStatus()).postsToLedger()) {
            validateBalance(saved, saved.getAmount());
            postToLedger(saved, saved.getDate());
        }
        return saved;
    }

    @Transactional
    public Transfer updateTransfer(UUID id, Transfer incoming) {
        Transfer existing = getTransfer(id);
        TransferStatus status = TransferStatus.resolve(existing.getStatus());
        if (!status.canEdit()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Posted or approved transfers cannot be edited");
        }
        existing.setSourceMemberId(incoming.getSourceMemberId());
        existing.setSourceSavingTypeId(incoming.getSourceSavingTypeId());
        existing.setDestinationMemberId(incoming.getDestinationMemberId());
        existing.setDestinationSavingTypeId(incoming.getDestinationSavingTypeId());
        existing.setAmount(incoming.getAmount());
        existing.setFtp(incoming.getFtp());
        existing.setDate(incoming.getDate());
        existing.setRemark(incoming.getRemark());
        double fee = computeFee(incoming.getAmount() != null ? incoming.getAmount() : 0);
        existing.setServiceFee(fee > 0 ? fee : 0);
        existing.setFeeSource(TransferFeeSource.resolve(incoming.getFeeSource()));
        existing.setBankId(incoming.getBankId());
        if (fee <= 0 || !requiresServiceFee()) {
            existing.setFeeSource(TransferFeeSource.NONE);
            existing.setBankId(null);
        }

        // If it was PENDING/FEE_PAID/REJECTED and the effective status becomes
        // POSTED, clear orphaned entries and post fresh ones.
        TransferStatus effective = incoming.getStatus() != null
                ? TransferStatus.resolve(incoming.getStatus())
                : status;
        existing.setStatus(effective);
        Transfer saved = transferRepository.save(existing);
        if (effective.postsToLedger() && !status.postsToLedger()) {
            validateBalance(saved, saved.getAmount());
            journalEntryService.deleteEntriesByTargetId(saved.getId());
            postToLedger(saved, saved.getDate());
        }
        return saved;
    }

    @Transactional
    public void deleteTransfer(UUID id) {
        Transfer transfer = getTransfer(id);
        TransferStatus status = TransferStatus.resolve(transfer.getStatus());
        if (!status.canDelete()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Posted or approved transfers cannot be deleted");
        }
        savingRepository.findByTransferId(id).ifPresent(savingRepository::delete);
        journalEntryService.deleteEntriesByTargetId(id);
        transferRepository.deleteById(id);
    }

    /**
     * Pays the service fee for a PENDING transfer, moving it to FEE_PAID and
     * recording only the fee journal entries. Only available when the "fee
     * first" payment stage is selected and a fee is due.
     */
    @Transactional
    public Transfer payTransferFee(UUID id, UUID feePaidBy, String reference) {
        Transfer transfer = getTransfer(id);
        TransferStatus status = TransferStatus.resolve(transfer.getStatus());
        if (!status.canPayFee()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Service fee can only be paid on a PENDING transfer");
        }
        if (!isFeeFirst()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "The transfer service fee is paid together with the transfer; no separate fee step is configured");
        }
        if (!feePayable() || transfer.getServiceFee() == null || transfer.getServiceFee() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "No transfer service fee is configured for this transfer");
        }
        TransferFeeSource source = TransferFeeSource.resolve(transfer.getFeeSource());
        if (source == TransferFeeSource.NONE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Choose where the service fee is paid from (saving or bank)");
        }
        if (source == TransferFeeSource.BANK && transfer.getBankId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Select the bank account used to pay the service fee");
        }
        validateBalance(transfer, transfer.getAmount());
        long now = System.currentTimeMillis();
        transfer.setStatus(TransferStatus.FEE_PAID);
        transfer.setFeePaidBy(feePaidBy);
        transfer.setFeePaidAt(now);
        transfer.setFeeReference(reference);
        Transfer saved = transferRepository.save(transfer);
        recordFeeEntries(saved, now);
        return saved;
    }

    /**
     * Approves a PENDING or FEE_PAID transfer, moving it to APPROVED. When the
     * "fee first" stage is selected the fee must already have been paid.
     */
    @Transactional
    public Transfer approveTransfer(UUID id, UUID approvedBy) {
        Transfer transfer = getTransfer(id);
        TransferStatus status = TransferStatus.resolve(transfer.getStatus());
        if (!status.canApprove()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Only PENDING or fee-paid transfers can be approved");
        }
        if (!requiresApproval()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Transfer approval is not enabled; no approval is required");
        }
        if (isFeeFirst() && feePayable() && transfer.getServiceFee() != null
                && transfer.getServiceFee() > 0 && transfer.getFeePaidAt() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "The transfer service fee must be paid before the transfer can be approved");
        }
        transfer.setStatus(TransferStatus.APPROVED);
        transfer.setApprovedBy(approvedBy);
        transfer.setApprovedAt(System.currentTimeMillis());
        return transferRepository.save(transfer);
    }

    /**
     * Executes the final transfer stage: moves an APPROVED or fee-paid transfer
     * to POSTED and posts the transfer to the ledger. Any service fee that was
     * not paid earlier (same-time payment stage) is recorded together with the
     * transfer. This is the point where the transfer affects finance.
     */
    @Transactional
    public Transfer executeTransfer(UUID id, UUID executedBy) {
        Transfer transfer = getTransfer(id);
        TransferStatus status = TransferStatus.resolve(transfer.getStatus());
        if (!status.canExecute()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Only approved or fee-paid transfers can be executed");
        }
        long now = System.currentTimeMillis();
        transfer.setStatus(TransferStatus.POSTED);
        transfer.setExecutedBy(executedBy);
        transfer.setExecutedAt(now);
        Transfer saved = transferRepository.save(transfer);
        validateBalance(saved, saved.getAmount());
        postToLedger(saved, now);
        return saved;
    }

    @Transactional
    public Transfer rejectTransfer(UUID id) {
        Transfer transfer = getTransfer(id);
        TransferStatus status = TransferStatus.resolve(transfer.getStatus());
        if (!status.canReject()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Only PENDING or fee-paid transfers can be rejected");
        }
        transfer.setStatus(TransferStatus.REJECTED);
        return transferRepository.save(transfer);
    }

    private Transfer getTransfer(UUID id) {
        return transferRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transfer not found"));
    }

    // ─── Validation ──────────────────────────────────────────────────────────

    /**
     * Source member's balance for the source saving type must cover the amount,
     * plus the service fee when it is deducted from savings.
     */
    private void validateBalance(Transfer transfer, double amount) {
        TransferFeeSource source = TransferFeeSource.resolve(transfer.getFeeSource());
        double fee = transfer.getServiceFee() != null ? transfer.getServiceFee() : 0;
        double required = amount;
        if (fee > 0 && source == TransferFeeSource.SAVING) {
            required += fee;
        }
        double balance = sourceBalance(transfer.getSourceMemberId(), transfer.getSourceSavingTypeId());
        if (balance < required - 0.001) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    String.format(
                            "Insufficient savings balance of %.2f ETB in the source saving type to cover the transfer of %.2f ETB%s.",
                            balance, amount,
                            fee > 0 && source == TransferFeeSource.SAVING
                                    ? " + service fee " + round2(fee) : ""));
        }
    }

    private double sourceBalance(UUID memberId, UUID savingTypeId) {
        double total = 0;
        for (Saving s : savingRepository.findAll()) {
            if (s.getSavingAmount() == null) continue;
            if (SavingStatus.REJECTED.equals(s.getStatus())) continue;
            if (s.getMemberId() != null && memberId != null && s.getMemberId().equals(memberId)
                    && s.getSavingType() != null && savingTypeId != null && s.getSavingType().equals(savingTypeId)) {
                total += s.getSavingAmount();
            }
        }
        return round2(total);
    }

    // ─── Ledger posting ──────────────────────────────────────────────────────

    private void postToLedger(Transfer transfer, Long ledgerDate) {
        recordTransferEntries(transfer, ledgerDate);
        if (transfer.getServiceFee() != null && transfer.getServiceFee() > 0
                && transfer.getFeePaidAt() == null) {
            recordFeeEntries(transfer, ledgerDate);
        }
    }

    private SavingType sourceType(Transfer t) {
        return savingTypeRepository.findById(t.getSourceSavingTypeId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Source saving type not found"));
    }

    private SavingType destType(Transfer t) {
        return savingTypeRepository.findById(t.getDestinationSavingTypeId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Destination saving type not found"));
    }

    private void recordTransferEntries(Transfer transfer, Long ledgerDate) {
        SavingType src = sourceType(transfer);
        SavingType dst = destType(transfer);
        Long d = ledgerDate != null ? ledgerDate : transfer.getDate();
        String ftp = transfer.getFtp();

        journalEntryService.recordDebitEntry(
                src.getAccountId(), transfer.getId(), ftp, d,
                "Transfer out", transfer.getAmount());
        journalEntryService.recordCreditEntry(
                dst.getAccountId(), transfer.getId(), ftp, d,
                "Transfer in", transfer.getAmount());

        recordSavingEntry(transfer.getSourceMemberId(), src, transfer, -transfer.getAmount(), "Transfer out");
        recordSavingEntry(transfer.getDestinationMemberId(), dst, transfer, transfer.getAmount(), "Transfer in");
    }

    private void recordFeeEntries(Transfer transfer, Long ledgerDate) {
        double fee = transfer.getServiceFee() != null ? transfer.getServiceFee() : 0;
        if (fee <= 0) return;
        String accountId = serviceFeeAccountId();
        if (accountId == null || accountId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "The transfer service fee credit account is not configured");
        }
        UUID creditAccount = UUID.fromString(accountId);
        Long d = ledgerDate != null ? ledgerDate : transfer.getDate();
        String ftp = transfer.getFtp();

        TransferFeeSource source = TransferFeeSource.resolve(transfer.getFeeSource());
        if (source == TransferFeeSource.BANK) {
            if (transfer.getBankId() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Select the bank account used to pay the service fee");
            }
            // DEBIT the bank account (cash received for the fee)
            journalEntryService.recordDebitEntry(
                    transfer.getBankId(), transfer.getId(), ftp, d,
                    "Transfer service fee", fee);
        } else {
            // DEBIT the source saving account (fee deducted from the member's savings)
            journalEntryService.recordDebitEntry(
                    sourceType(transfer).getAccountId(), transfer.getId(), ftp, d,
                    "Transfer service fee", fee);
            recordSavingEntry(transfer.getSourceMemberId(), sourceType(transfer),
                    transfer, -fee, "Service fee");
        }

        // CREDIT the service fee account (revenue)
        journalEntryService.recordCreditEntry(
                creditAccount, transfer.getId(), ftp, d,
                "Transfer service fee", fee);
    }

    private void recordSavingEntry(UUID memberId, SavingType type, Transfer transfer,
                                   Double amount, String prefix) {
        Saving saving = new Saving();
        saving.setMemberId(memberId);
        saving.setSavingAmount(amount);
        saving.setSavingDate(transfer.getDate());
        saving.setFtp(transfer.getFtp());
        saving.setSavingType(type.getId());
        saving.setAccountId(type.getId());
        saving.setTransferId(transfer.getId());
        saving.setRemark(transfer.getRemark() != null ? prefix + ": " + transfer.getRemark() : prefix);
        saving.setCreatedAt(System.currentTimeMillis());
        saving.setStatus(SavingStatus.POSTED);
        savingRepository.save(saving);
    }

    // ─── Settings helpers ────────────────────────────────────────────────────

    private String readSetting(String key) {
        return settingRepository.findByKey(key)
                .map(s -> s.getValue())
                .orElse(null);
    }

    private boolean readBool(String key) {
        String v = readSetting(key);
        return v != null && Boolean.parseBoolean(v.trim());
    }

    private double readDouble(String key) {
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
}