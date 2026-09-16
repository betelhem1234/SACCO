package com.example.ngrxcrud.api.service;

import com.example.ngrxcrud.api.model.*;
import com.example.ngrxcrud.api.repository.AccountRepository;
import com.example.ngrxcrud.api.repository.AssetDisposalRepository;
import com.example.ngrxcrud.api.repository.DepreciationEntryRepository;
import com.example.ngrxcrud.api.repository.ExpenseRequestRepository;
import com.example.ngrxcrud.api.repository.FixedAssetRepository;
import com.example.ngrxcrud.api.repository.RentalContractRepository;
import com.example.ngrxcrud.api.repository.RentalPaymentRepository;
import com.example.ngrxcrud.api.repository.SettingRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.YearMonth;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class AssetsExpenseService {

    public static final String REQUEST_STATUS_PENDING = "PENDING";
    public static final String REQUEST_STATUS_APPROVED = "APPROVED";
    public static final String REQUEST_STATUS_PAID = "PAID";
    public static final String REQUEST_STATUS_REJECTED = "REJECTED";

    public static final String CATEGORY_EQUIPMENT = "EQUIPMENT";
    public static final String CATEGORY_CONSUMABLE = "CONSUMABLE";
    public static final String CATEGORY_RENT = "RENT";
    public static final String CATEGORY_UTILITY = "UTILITY";
    public static final String CATEGORY_OTHER = "OTHER";

    public static final String ASSET_STATUS_ACTIVE = "ACTIVE";
    public static final String ASSET_STATUS_DISPOSED = "DISPOSED";

    public static final String CONTRACT_STATUS_ACTIVE = "ACTIVE";
    public static final String CONTRACT_STATUS_COMPLETED = "COMPLETED";
    public static final String CONTRACT_STATUS_CANCELLED = "CANCELLED";

    public static final String FREQUENCY_DAILY = "DAILY";
    public static final String FREQUENCY_MONTHLY = "MONTHLY";
    public static final String FREQUENCY_YEARLY = "YEARLY";

    public static final String DISPOSAL_SALE = "SALE";
    public static final String DISPOSAL_LOST = "LOST";
    public static final String DISPOSAL_GIFT = "GIFT";
    public static final String DISPOSAL_SCRAP = "SCRAP";
    public static final String DISPOSAL_DAMAGED = "DAMAGED";
    public static final String DISPOSAL_OTHER = "OTHER";

    public static final String SETTING_EQUIPMENT_ACCOUNT = "equipment_account_id";
    public static final String SETTING_DEP_EXPENSE_ACCOUNT = "depreciation_expense_account_id";
    public static final String SETTING_RENT_EXPENSE_ACCOUNT = "rent_expense_account_id";
    public static final String SETTING_PREPAID_RENT_ACCOUNT = "prepaid_rent_account_id";
    public static final String SETTING_GENERAL_EXPENSE_ACCOUNT = "general_expense_account_id";
    public static final String SETTING_GAIN_LOSS_ACCOUNT = "gain_loss_account_id";
    public static final String SETTING_ASSET_SALE_INCOME_ACCOUNT = "asset_sale_income_account_id";

    @Autowired
    private ExpenseRequestRepository expenseRequestRepository;
    @Autowired
    private FixedAssetRepository fixedAssetRepository;
    @Autowired
    private DepreciationEntryRepository depreciationEntryRepository;
    @Autowired
    private AssetDisposalRepository assetDisposalRepository;
    @Autowired
    private RentalContractRepository rentalContractRepository;
    @Autowired
    private RentalPaymentRepository rentalPaymentRepository;
    @Autowired
    private SettingRepository settingRepository;
    @Autowired
    private AccountRepository accountRepository;
    @Autowired
    private JournalEntryService journalEntryService;

    // ─── Expense / purchase request workflow ───────────────────────────────

    @Transactional
    public ExpenseRequest createRequest(ExpenseRequest req) {
        validateRequest(req);
        String category = req.getCategory() != null ? req.getCategory() : CATEGORY_OTHER;
        requireRequestPostingAccounts(category);
        req.setId(null);
        req.setStatus(REQUEST_STATUS_PENDING);
        long now = System.currentTimeMillis();
        if (req.getRequestedDate() == null) req.setRequestedDate(now);
        req.setCreatedAt(now);
        req.setUpdatedAt(now);
        return expenseRequestRepository.save(req);
    }

    @Transactional
    public ExpenseRequest updateRequest(UUID id, ExpenseRequest incoming) {
        ExpenseRequest existing = getRequest(id);
        if (REQUEST_STATUS_PAID.equals(existing.getStatus()) || REQUEST_STATUS_APPROVED.equals(existing.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Only pending or rejected requests can be edited");
        }
        existing.setCategory(incoming.getCategory());
        existing.setTitle(incoming.getTitle());
        existing.setRequestedBy(incoming.getRequestedBy());
        existing.setRequestedDate(incoming.getRequestedDate());
        existing.setAmount(incoming.getAmount());
        existing.setAssetName(incoming.getAssetName());
        existing.setQuantity(incoming.getQuantity());
        existing.setSupplier(incoming.getSupplier());
        existing.setLandlord(incoming.getLandlord());
        existing.setFrequency(incoming.getFrequency());
        existing.setAmountPerPeriod(incoming.getAmountPerPeriod());
        existing.setPeriodsCovered(incoming.getPeriodsCovered());
        existing.setContractId(incoming.getContractId());
        existing.setNote(incoming.getNote());
        existing.setStatus(REQUEST_STATUS_PENDING);
        existing.setPaymentAccountId(incoming.getPaymentAccountId());
        existing.setApprovedBy(null);
        existing.setApprovedDate(null);
        existing.setPaidDate(null);
        existing.setUpdatedAt(System.currentTimeMillis());
        return expenseRequestRepository.save(existing);
    }

    @Transactional
    public void deleteRequest(UUID id) {
        ExpenseRequest existing = getRequest(id);
        if (REQUEST_STATUS_PAID.equals(existing.getStatus()) || REQUEST_STATUS_APPROVED.equals(existing.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Approved or paid requests cannot be deleted");
        }
        expenseRequestRepository.deleteById(id);
    }

    @Transactional
    public ExpenseRequest approveRequest(UUID id, String approvedBy) {
        ExpenseRequest req = getRequest(id);
        if (!REQUEST_STATUS_PENDING.equals(req.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only pending requests can be approved");
        }
        req.setStatus(REQUEST_STATUS_APPROVED);
        req.setApprovedBy(approvedBy);
        req.setApprovedDate(System.currentTimeMillis());
        req.setUpdatedAt(System.currentTimeMillis());
        return expenseRequestRepository.save(req);
    }

    @Transactional
    public ExpenseRequest rejectRequest(UUID id) {
        ExpenseRequest req = getRequest(id);
        if (!REQUEST_STATUS_PENDING.equals(req.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only pending requests can be rejected");
        }
        req.setStatus(REQUEST_STATUS_REJECTED);
        req.setUpdatedAt(System.currentTimeMillis());
        return expenseRequestRepository.save(req);
    }

    /**
     * Approve-and-pay step: APPROVED → PAID. Posts the journal entry and, for
     * equipment requests, capitalizes the asset. For rent requests it records the
     * first advance payment (creating a contract when none is attached).
     */
    @Transactional
    public ExpenseRequest payRequest(UUID id, UUID paymentAccountId, Long paidDate) {
        ExpenseRequest req = getRequest(id);
        if (!REQUEST_STATUS_APPROVED.equals(req.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only approved requests can be paid");
        }
        if (paymentAccountId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Select a payment account");
        }
        req.setPaymentAccountId(paymentAccountId);
        req.setPaidDate(paidDate != null ? paidDate : System.currentTimeMillis());
        req.setStatus(REQUEST_STATUS_PAID);
        req.setUpdatedAt(System.currentTimeMillis());
        expenseRequestRepository.save(req);

        String category = req.getCategory() != null ? req.getCategory() : CATEGORY_OTHER;
        if (CATEGORY_EQUIPMENT.equals(category)) {
            FixedAsset asset = new FixedAsset();
            asset.setName(req.getAssetName() != null ? req.getAssetName() : req.getTitle());
            asset.setCategory(category);
            asset.setDescription(req.getTitle());
            asset.setPurchaseDate(req.getPaidDate());
            asset.setCost(req.getAmount());
            asset.setSupplier(req.getSupplier());
            asset.setSourceRequestId(req.getId());
            asset.setDepreciable(true);
            asset.setUsefulLifeYears(5);
            asset.setSalvageValue(0.0);
            asset.setStatus(ASSET_STATUS_ACTIVE);
            asset.setCreatedAt(System.currentTimeMillis());
            FixedAsset saved = fixedAssetRepository.save(asset);
            postEquipmentPurchase(req.getAmount(), req.getPaidDate(), paymentAccountId, saved.getId(), saved.getName());
        } else if (CATEGORY_RENT.equals(category)) {
            RentalContract contract = resolveContractForRequest(req);
            RentalPayment payment = buildPaymentFromRequest(req, contract);
            addRentalPaymentInternal(payment);
        } else {
            postGeneralExpense(req.getAmount(), req.getPaidDate(), paymentAccountId, req.getId(), req.getTitle());
        }
        return req;
    }

    // ─── Fixed assets ──────────────────────────────────────────────────────

    public List<FixedAsset> getAllAssets() {
        return fixedAssetRepository.findAll();
    }

    @Transactional
    public FixedAsset addAsset(FixedAsset asset) {
        validateAsset(asset);
        asset.setId(null);
        if (asset.getStatus() == null) asset.setStatus(ASSET_STATUS_ACTIVE);
        if (asset.getPurchaseDate() == null) asset.setPurchaseDate(System.currentTimeMillis());
        if (asset.getDepreciable() == null) asset.setDepreciable(true);
        if (asset.getUsefulLifeYears() == null || asset.getUsefulLifeYears() < 1) asset.setUsefulLifeYears(5);
        if (asset.getSalvageValue() == null) asset.setSalvageValue(0.0);
        asset.setCreatedAt(System.currentTimeMillis());
        return fixedAssetRepository.save(asset);
    }

    @Transactional
    public FixedAsset updateAsset(UUID id, FixedAsset incoming) {
        FixedAsset asset = getAsset(id);
        if (ASSET_STATUS_DISPOSED.equals(asset.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Disposed assets cannot be edited");
        }
        asset.setName(incoming.getName());
        asset.setCategory(incoming.getCategory());
        asset.setDescription(incoming.getDescription());
        asset.setPurchaseDate(incoming.getPurchaseDate());
        asset.setCost(incoming.getCost());
        asset.setSupplier(incoming.getSupplier());
        asset.setDepreciable(incoming.getDepreciable());
        asset.setUsefulLifeYears(incoming.getUsefulLifeYears());
        asset.setSalvageValue(incoming.getSalvageValue());
        return fixedAssetRepository.save(asset);
    }

    @Transactional
    public void deleteAsset(UUID id) {
        FixedAsset asset = getAsset(id);
        if (ASSET_STATUS_DISPOSED.equals(asset.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Disposed assets cannot be deleted");
        }
        if (!depreciationEntryRepository.findByAssetId(id).isEmpty()
                || !assetDisposalRepository.findByAssetId(id).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Asset has depreciation or disposal history and cannot be deleted");
        }
        fixedAssetRepository.deleteById(id);
    }

    private FixedAsset getAsset(UUID id) {
        return fixedAssetRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Asset not found"));
    }

    /**
     * Runs straight-line depreciation for the missing periods (month by month)
     * from the purchase date up to today (or an explicit as-of date).
     */
    @Transactional
    public List<DepreciationEntry> runDepreciation(UUID assetId, Long asOf) {
        FixedAsset asset = getAsset(assetId);
        if (!Boolean.TRUE.equals(asset.getDepreciable())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    String.format("Asset \"%s\" is not depreciable", asset.getName()));
        }
        double depreciableBase = (asset.getCost() == null ? 0 : asset.getCost())
                - (asset.getSalvageValue() == null ? 0 : asset.getSalvageValue());
        int lifeMonths = Math.max(asset.getUsefulLifeYears() == null ? 5 : asset.getUsefulLifeYears(), 1) * 12;
        if (depreciableBase <= 0 || lifeMonths <= 0) {
            return new ArrayList<>();
        }
        double monthly = round2(depreciableBase / lifeMonths);

        long end = asOf != null ? asOf : System.currentTimeMillis();
        YearMonth currentMonth = toYearMonth(end);
        YearMonth purchaseMonth = toYearMonth(asset.getPurchaseDate() != null ? asset.getPurchaseDate() : end);

        List<DepreciationEntry> existing = depreciationEntryRepository.findByAssetId(assetId);
        double accumulated = existing.stream().mapToDouble(e -> e.getAccumulated() == null ? 0 : e.getAccumulated())
                .max().orElse(0.0);

        List<DepreciationEntry> created = new ArrayList<>();
        YearMonth month = purchaseMonth;
        while (!month.isAfter(currentMonth)) {
            String key = month.toString();
            boolean has = existing.stream().anyMatch(e -> key.equals(e.getPeriodKey()));
            if (!has) {
                double prevAccumulated = accumulated;
                double amount = round2(Math.min(monthly, Math.max(0, depreciableBase - prevAccumulated)));
                if (amount > 0) {
                    accumulated = round2(prevAccumulated + amount);
                    DepreciationEntry entry = new DepreciationEntry();
                    entry.setAssetId(assetId);
                    entry.setPeriodKey(key);
                    entry.setPeriodStart(month.atDay(1).atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli());
                    entry.setAmount(amount);
                    entry.setAccumulated(accumulated);
                    entry.setNetBookValue(round2((asset.getCost() == null ? 0 : asset.getCost()) - accumulated));
                    entry.setCreatedAt(System.currentTimeMillis());
                    created.add(depreciationEntryRepository.save(entry));
                    postDepreciationJournal(entry, asset.getName());
                }
            }
            month = month.plusMonths(1);
        }
        return created;
    }

    @Transactional
    public List<DepreciationEntry> runDepreciationForAll(Long asOf) {
        List<DepreciationEntry> all = new ArrayList<>();
        for (FixedAsset a : fixedAssetRepository.findAll()) {
            if (!ASSET_STATUS_DISPOSED.equals(a.getStatus()) && Boolean.TRUE.equals(a.getDepreciable())) {
                try {
                    all.addAll(runDepreciation(a.getId(), asOf));
                } catch (ResponseStatusException ignored) {
                    // skip assets that fail (e.g., missing config) without breaking the batch
                }
            }
        }
        return all;
    }

    public double accumulatedFor(UUID assetId) {
        List<DepreciationEntry> entries = depreciationEntryRepository.findByAssetId(assetId);
        return round2(entries.stream().mapToDouble(e -> e.getAccumulated() == null ? 0 : e.getAccumulated())
                .max().orElse(0.0));
    }

    public double netBookValue(FixedAsset asset) {
        if (asset == null) return 0;
        double cost = asset.getCost() == null ? 0 : asset.getCost();
        return round2(cost - accumulatedFor(asset.getId()));
    }

    // ─── Disposal ──────────────────────────────────────────────────────────

    @Transactional
    public AssetDisposal disposeAsset(UUID assetId, AssetDisposal payload) {
        FixedAsset asset = getAsset(assetId);
        if (ASSET_STATUS_DISPOSED.equals(asset.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Asset is already disposed");
        }
        String condition = payload.getCondition() != null ? payload.getCondition() : DISPOSAL_OTHER;
        long disposalDate = payload.getDisposalDate() != null ? payload.getDisposalDate() : System.currentTimeMillis();

        // Charge depreciation up to the disposal date so book value is current.
        try {
            runDepreciation(assetId, disposalDate);
        } catch (ResponseStatusException ignored) {
            // non-depreciable asset: no entries needed
        }

        double cost = asset.getCost() == null ? 0 : asset.getCost();
        double accumulated = accumulatedFor(assetId);
        double bookValue = round2(cost - accumulated);
        double proceeds = payload.getProceeds() != null ? payload.getProceeds() : 0.0;
        double gainLoss = round2(proceeds - bookValue);

        AssetDisposal disposal = new AssetDisposal();
        disposal.setAssetId(assetId);
        disposal.setAssetName(asset.getName());
        disposal.setDisposalDate(disposalDate);
        disposal.setCondition(condition);
        disposal.setProceeds(proceeds);
        disposal.setProceedsAccountId(payload.getProceedsAccountId());
        disposal.setBookValue(bookValue);
        disposal.setGainLoss(gainLoss);
        disposal.setNote(payload.getNote());
        disposal.setCreatedAt(System.currentTimeMillis());
        AssetDisposal saved = assetDisposalRepository.save(disposal);

        asset.setStatus(ASSET_STATUS_DISPOSED);
        fixedAssetRepository.save(asset);

        postDisposalJournal(saved, asset);
        return saved;
    }

    // ─── Rental contracts & payments ───────────────────────────────────────

    public List<RentalContract> getAllContracts() {
        return rentalContractRepository.findAll();
    }

    @Transactional
    public RentalContract addContract(RentalContract contract) {
        validateContract(contract);
        contract.setId(null);
        if (contract.getStatus() == null) contract.setStatus(CONTRACT_STATUS_ACTIVE);
        if (contract.getFrequency() == null) contract.setFrequency(FREQUENCY_MONTHLY);
        long now = System.currentTimeMillis();
        contract.setCreatedAt(now);
        contract.setUpdatedAt(now);
        return rentalContractRepository.save(contract);
    }

    @Transactional
    public RentalContract updateContract(UUID id, RentalContract incoming) {
        RentalContract contract = getContract(id);
        contract.setPropertyName(incoming.getPropertyName());
        contract.setDescription(incoming.getDescription());
        contract.setLandlord(incoming.getLandlord());
        contract.setFrequency(incoming.getFrequency());
        contract.setAmountPerPeriod(incoming.getAmountPerPeriod());
        contract.setStartDate(incoming.getStartDate());
        contract.setEndDate(incoming.getEndDate());
        contract.setAdvancePeriods(incoming.getAdvancePeriods());
        contract.setStatus(incoming.getStatus() != null ? incoming.getStatus() : contract.getStatus());
        contract.setUpdatedAt(System.currentTimeMillis());
        return rentalContractRepository.save(contract);
    }

    @Transactional
    public void deleteContract(UUID id) {
        if (!rentalPaymentRepository.findByContractId(id).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Contract has payments and cannot be deleted");
        }
        rentalContractRepository.deleteById(id);
    }

    private RentalContract getContract(UUID id) {
        return rentalContractRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contract not found"));
    }

    /**
     * Records a rental payment (cash or in advance). The covered portion up to
     * today is posted as rent expense and the future portion as prepaid rent.
     */
    @Transactional
    public RentalPayment addRentalPayment(RentalPayment payment) {
        validatePayment(payment);
        return addRentalPaymentInternal(payment);
    }

    private RentalPayment addRentalPaymentInternal(RentalPayment payment) {
        payment.setId(null);
        payment.setCreatedAt(System.currentTimeMillis());

        long now = System.currentTimeMillis();
        long from = payment.getPaidFrom();
        long to = payment.getPaidTo();
        long expensed = Math.min(Math.max(now, from), to);
        payment.setExpensedThrough(expensed);

        RentalPayment saved = rentalPaymentRepository.save(payment);
        postRentJournal(saved);
        return saved;
    }

    @Transactional
    public void deleteRentalPayment(UUID id) {
        RentalPayment payment = rentalPaymentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found"));
        journalEntryService.deleteEntriesByTargetId(id);
        rentalPaymentRepository.deleteById(id);
    }

    /** Moves prepaid rent into rent expense as covered months elapse. */
    @Transactional
    public List<RentalPayment> amortizePrepaid(UUID contractId) {
        List<RentalPayment> payments = contractId != null
                ? rentalPaymentRepository.findByContractId(contractId)
                : rentalPaymentRepository.findAll();
        long now = System.currentTimeMillis();
        List<RentalPayment> updated = new ArrayList<>();
        for (RentalPayment p : payments) {
            long from = p.getPaidFrom();
            long to = p.getPaidTo();
            long current = p.getExpensedThrough() != null ? p.getExpensedThrough() : from;
            long target = Math.min(now, to);
            if (target > current) {
                double amount = p.getAmountPaid() == null ? 0 : p.getAmountPaid();
                double delta = round2(amount * (target - current) / (double) (to - from));
                if (delta > 0) {
                    postRentExpense(p, delta);
                    p.setExpensedThrough(target);
                    updated.add(rentalPaymentRepository.save(p));
                }
            }
        }
        return updated;
    }

    // ─── Journal posting ───────────────────────────────────────────────────

    private void postEquipmentPurchase(double amount, Long date, UUID bankId, UUID assetId, String name) {
        UUID equipment = requireAccount(SETTING_EQUIPMENT_ACCOUNT, "Equipment asset account");
        long when = date != null ? date : System.currentTimeMillis();
        String ftp = "ASSET/" + shortId(assetId);
        journalEntryService.recordDebitEntry(equipment, assetId, ftp, when, "Equipment purchase: " + name, amount);
        journalEntryService.recordCreditEntry(bankId, assetId, ftp, when, "Payment for equipment: " + name, amount);
    }

    private void postGeneralExpense(double amount, Long date, UUID bankId, UUID targetId, String label) {
        UUID expense = requireAccount(SETTING_GENERAL_EXPENSE_ACCOUNT, "General expense account");
        long when = date != null ? date : System.currentTimeMillis();
        String ftp = "EXP/" + shortId(targetId);
        journalEntryService.recordDebitEntry(expense, targetId, ftp, when, label, amount);
        journalEntryService.recordCreditEntry(bankId, targetId, ftp, when, label, amount);
    }

    private void postRentJournal(RentalPayment p) {
        double amount = p.getAmountPaid() == null ? 0 : p.getAmountPaid();
        if (amount <= 0) return;
        long from = p.getPaidFrom();
        long to = p.getPaidTo();
        long expensedThrough = p.getExpensedThrough() != null ? p.getExpensedThrough() : from;
        double expensedPortion = round2(amount * (expensedThrough - from) / (double) (to - from));
        double prepaidPortion = round2(amount - expensedPortion);
        long when = p.getPayDate() != null ? p.getPayDate() : System.currentTimeMillis();
        String label = "Rent: " + (p.getPropertyName() != null ? p.getPropertyName() : "Office");
        String ftp = "RENT/" + shortId(p.getId());

        if (expensedPortion > 0) {
            UUID rentExpense = requireAccount(SETTING_RENT_EXPENSE_ACCOUNT, "Rent expense account");
            journalEntryService.recordDebitEntry(rentExpense, p.getId(), ftp, when, label + " (current)", expensedPortion);
        }
        if (prepaidPortion > 0) {
            UUID prepaid = requireAccount(SETTING_PREPAID_RENT_ACCOUNT, "Prepaid rent account");
            journalEntryService.recordDebitEntry(prepaid, p.getId(), ftp, when, label + " (advance)", prepaidPortion);
        }
        journalEntryService.recordCreditEntry(p.getPaymentAccountId(), p.getId(), ftp, when, label, amount);
    }

    private void postRentExpense(RentalPayment p, double delta) {
        UUID rentExpense = requireAccount(SETTING_RENT_EXPENSE_ACCOUNT, "Rent expense account");
        UUID prepaid = requireAccount(SETTING_PREPAID_RENT_ACCOUNT, "Prepaid rent account");
        long when = System.currentTimeMillis();
        String ftp = "RENTAM/";
        journalEntryService.recordDebitEntry(rentExpense, p.getId(), ftp, when, "Rent amortization: " + p.getPropertyName(), delta);
        journalEntryService.recordCreditEntry(prepaid, p.getId(), ftp, when, "Rent amortization: " + p.getPropertyName(), delta);
    }

    private void postDepreciationJournal(DepreciationEntry entry, String assetName) {
        UUID depExpense = requireAccount(SETTING_DEP_EXPENSE_ACCOUNT, "Depreciation expense account");
        UUID equipment = requireAccount(SETTING_EQUIPMENT_ACCOUNT, "Equipment asset account");
        long when = entry.getPeriodStart() != null ? entry.getPeriodStart() : System.currentTimeMillis();
        String ftp = "DEP/" + shortId(entry.getId());
        String label = "Depreciation " + entry.getPeriodKey() + ": " + assetName;
        journalEntryService.recordDebitEntry(depExpense, entry.getId(), ftp, when, label, entry.getAmount());
        journalEntryService.recordCreditEntry(equipment, entry.getId(), ftp, when, label, entry.getAmount());
    }

    /**
     * Disposal postings keep the asset account at net book value (depreciation
     * credited it directly), so removing the asset credits back exactly that
     * current value. A sale debits the proceeds account; anything above book
     * value is income (credit gain/loss), anything below is an expense (debit
     * gain/loss). Gifted / lost / scrapped / damaged / other always write off
     * the full book value as an expense — profit is never recognised.
     */
    private void postDisposalJournal(AssetDisposal disposal, FixedAsset asset) {
        UUID equipment = requireAccount(SETTING_EQUIPMENT_ACCOUNT, "Equipment asset account");
        double bookValue = disposal.getBookValue() == null ? 0 : disposal.getBookValue();
        double proceeds = disposal.getProceeds() == null ? 0 : disposal.getProceeds();
        double gainLossAmount = round2(proceeds - bookValue);

        long when = disposal.getDisposalDate() != null ? disposal.getDisposalDate() : System.currentTimeMillis();
        String ftp = "DISPOSAL/" + shortId(disposal.getId());
        String label = disposalLabel(disposal.getCondition(), asset.getName());

        if (DISPOSAL_SALE.equals(disposal.getCondition()) && proceeds > 0) {
            UUID proceedsAccount = disposal.getProceedsAccountId();
            if (proceedsAccount == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Select the account receiving the sale proceeds");
            }
            journalEntryService.recordDebitEntry(proceedsAccount, disposal.getId(), ftp, when,
                    "Sale proceeds: " + asset.getName(), proceeds);
        }

        journalEntryService.recordCreditEntry(equipment, disposal.getId(), ftp, when, label, round2(bookValue));

        if (gainLossAmount > 0) {
            UUID income = requireAccount(SETTING_ASSET_SALE_INCOME_ACCOUNT, "Asset sale income account");
            journalEntryService.recordCreditEntry(income, disposal.getId(), ftp, when,
                    "Gain on disposal: " + asset.getName(), round2(gainLossAmount));
        } else if (gainLossAmount < 0) {
            UUID loss = requireAccount(SETTING_GAIN_LOSS_ACCOUNT, "Disposal expense account");
            journalEntryService.recordDebitEntry(loss, disposal.getId(), ftp, when,
                    "Loss on disposal: " + asset.getName(), round2(-gainLossAmount));
        }
    }

    private String disposalLabel(String condition, String assetName) {
        if (DISPOSAL_SALE.equals(condition)) return "Disposal (sale): " + assetName;
        if (DISPOSAL_LOST.equals(condition)) return "Disposal (lost): " + assetName;
        if (DISPOSAL_GIFT.equals(condition)) return "Disposal (gifted): " + assetName;
        if (DISPOSAL_SCRAP.equals(condition)) return "Disposal (scrapped): " + assetName;
        if (DISPOSAL_DAMAGED.equals(condition)) return "Disposal (damaged): " + assetName;
        return "Disposal: " + assetName;
    }

    // ─── Account resolution & helpers ──────────────────────────────────────

    /**
     * Reads an account from Settings and requires it to be configured. There is
     * no heuristic fallback: the user must map the account in
     * Settings → Assets & Expenses, otherwise the posting is rejected with a
     * message naming the missing account.
     */
    private UUID requireAccount(String settingKey, String label) {
        String configured = settingRepository.findByKey(settingKey)
                .map(s -> s.getValue())
                .filter(v -> v != null && !v.isBlank())
                .map(String::trim)
                .orElse(null);
        if (configured != null) {
            try {
                UUID id = UUID.fromString(configured);
                if (accountRepository.findById(id).isPresent()) {
                    return id;
                }
            } catch (IllegalArgumentException ignored) {
                // treat as not configured
            }
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                label + " is not configured. Select it in Settings → Assets & Expenses before recording this entry.");
    }

    // ─── Validation ────────────────────────────────────────────────────────

    private void validateRequest(ExpenseRequest req) {
        if (req.getAmount() == null || req.getAmount() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Amount must be greater than zero");
        }
        if (req.getTitle() == null || req.getTitle().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title is required");
        }
        if (req.getCategory() == null || req.getCategory().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category is required");
        }
    }

    private void requireRequestPostingAccounts(String category) {
        if (CATEGORY_EQUIPMENT.equals(category)) {
            requireAccount(SETTING_EQUIPMENT_ACCOUNT, "Equipment asset account");
        } else if (CATEGORY_RENT.equals(category)) {
            requireAccount(SETTING_RENT_EXPENSE_ACCOUNT, "Rent expense account");
            requireAccount(SETTING_PREPAID_RENT_ACCOUNT, "Prepaid rent account");
        } else {
            requireAccount(SETTING_GENERAL_EXPENSE_ACCOUNT, "General expense account");
        }
    }

    private void validateAsset(FixedAsset asset) {
        if (asset.getName() == null || asset.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Asset name is required");
        }
        if (asset.getCost() == null || asset.getCost() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Asset cost must be greater than zero");
        }
    }

    private void validateContract(RentalContract contract) {
        if (contract.getPropertyName() == null || contract.getPropertyName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Property name is required");
        }
        if (contract.getAmountPerPeriod() == null || contract.getAmountPerPeriod() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Amount per period must be greater than zero");
        }
    }

    private void validatePayment(RentalPayment payment) {
        if (payment.getPaidFrom() == null || payment.getPaidTo() == null || payment.getPaidTo() <= payment.getPaidFrom()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Coverage period is invalid");
        }
        if (payment.getAmountPaid() == null || payment.getAmountPaid() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Amount paid must be greater than zero");
        }
        if (payment.getPaymentAccountId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Select a payment account");
        }
    }

    private RentalContract resolveContractForRequest(ExpenseRequest req) {
        if (req.getContractId() != null) {
            return getContract(req.getContractId());
        }
        RentalContract contract = new RentalContract();
        contract.setPropertyName(req.getTitle());
        contract.setDescription(req.getTitle());
        contract.setLandlord(req.getLandlord());
        contract.setFrequency(req.getFrequency() != null ? req.getFrequency() : FREQUENCY_MONTHLY);
        contract.setAmountPerPeriod(req.getAmountPerPeriod() != null ? req.getAmountPerPeriod() : req.getAmount());
        contract.setStartDate(req.getPaidDate());
        contract.setEndDate(null);
        contract.setAdvancePeriods(req.getPeriodsCovered() != null ? req.getPeriodsCovered() : 0);
        contract.setStatus(CONTRACT_STATUS_ACTIVE);
        long now = System.currentTimeMillis();
        contract.setCreatedAt(now);
        contract.setUpdatedAt(now);
        return rentalContractRepository.save(contract);
    }

    private RentalPayment buildPaymentFromRequest(ExpenseRequest req, RentalContract contract) {
        int periods = req.getPeriodsCovered() != null ? req.getPeriodsCovered() : 1;
        long from = req.getPaidDate() != null ? req.getPaidDate() : System.currentTimeMillis();
        long interval = frequencyInterval(contract.getFrequency());
        RentalPayment payment = new RentalPayment();
        payment.setContractId(contract.getId());
        payment.setPropertyName(contract.getPropertyName());
        payment.setFrequency(contract.getFrequency());
        payment.setAmountPerPeriod(contract.getAmountPerPeriod());
        payment.setPaidFrom(from);
        payment.setPaidTo(from + periods * interval);
        payment.setAmountPaid(req.getAmount());
        payment.setPayDate(req.getPaidDate());
        payment.setPaidBy(req.getRequestedBy());
        payment.setPaymentAccountId(req.getPaymentAccountId());
        payment.setNote(req.getTitle());
        return payment;
    }

    // ─── Misc helpers ──────────────────────────────────────────────────────

    private ExpenseRequest getRequest(UUID id) {
        return expenseRequestRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Expense request not found"));
    }

    public static long frequencyInterval(String frequency) {
        if (FREQUENCY_DAILY.equals(frequency)) return 86_400_000L;
        if (FREQUENCY_YEARLY.equals(frequency)) return 365L * 86_400_000L;
        return 30L * 86_400_000L;
    }

    private static YearMonth toYearMonth(Long millis) {
        if (millis == null || millis <= 0) return YearMonth.now();
        return YearMonth.from(java.time.Instant.ofEpochMilli(millis)
                .atZone(ZoneId.systemDefault())
                .toLocalDate());
    }

    private static String shortId(UUID id) {
        return id != null ? id.toString().substring(0, 8) : "n/a";
    }

    private static double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }
}