package com.example.ngrxcrud.api.controller;

import com.example.ngrxcrud.api.model.AssetDisposal;
import com.example.ngrxcrud.api.model.DepreciationEntry;
import com.example.ngrxcrud.api.model.ExpenseRequest;
import com.example.ngrxcrud.api.model.FixedAsset;
import com.example.ngrxcrud.api.model.RentalContract;
import com.example.ngrxcrud.api.model.RentalPayment;
import com.example.ngrxcrud.api.repository.AssetDisposalRepository;
import com.example.ngrxcrud.api.repository.DepreciationEntryRepository;
import com.example.ngrxcrud.api.repository.ExpenseRequestRepository;
import com.example.ngrxcrud.api.repository.FixedAssetRepository;
import com.example.ngrxcrud.api.repository.RentalPaymentRepository;
import com.example.ngrxcrud.api.service.AssetsExpenseService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/assets-expenses")
@CrossOrigin(origins = "*")
public class AssetsExpenseController {

    @Autowired
    private AssetsExpenseService service;
    @Autowired
    private ExpenseRequestRepository expenseRequestRepository;
    @Autowired
    private FixedAssetRepository fixedAssetRepository;
    @Autowired
    private DepreciationEntryRepository depreciationEntryRepository;
    @Autowired
    private AssetDisposalRepository assetDisposalRepository;
    @Autowired
    private RentalPaymentRepository rentalPaymentRepository;

    // ─── Expense / purchase requests ───────────────────────────────────────

    @GetMapping("/requests")
    public List<ExpenseRequest> getAllRequests() {
        return expenseRequestRepository.findAll();
    }

    @PostMapping("/requests")
    @Transactional
    public ExpenseRequest createRequest(@RequestBody ExpenseRequest request) {
        return service.createRequest(request);
    }

    @PutMapping("/requests/{id}")
    @Transactional
    public ExpenseRequest updateRequest(@PathVariable UUID id, @RequestBody ExpenseRequest request) {
        return service.updateRequest(id, request);
    }

    @DeleteMapping("/requests/{id}")
    @Transactional
    public void deleteRequest(@PathVariable UUID id) {
        service.deleteRequest(id);
    }

    @PostMapping("/requests/{id}/approve")
    @Transactional
    public ExpenseRequest approveRequest(@PathVariable UUID id, @RequestBody(required = false) ExpenseRequest body) {
        String approvedBy = body != null ? body.getApprovedBy() : null;
        return service.approveRequest(id, approvedBy);
    }

    @PostMapping("/requests/{id}/reject")
    @Transactional
    public ExpenseRequest rejectRequest(@PathVariable UUID id) {
        return service.rejectRequest(id);
    }

    @PostMapping("/requests/{id}/pay")
    @Transactional
    public ExpenseRequest payRequest(@PathVariable UUID id, @RequestBody(required = false) ExpenseRequest body) {
        UUID accountId = body != null ? body.getPaymentAccountId() : null;
        Long paidDate = body != null ? body.getPaidDate() : null;
        return service.payRequest(id, accountId, paidDate);
    }

    // ─── Fixed assets ──────────────────────────────────────────────────────

    @GetMapping("/assets")
    public List<FixedAsset> getAllAssets() {
        return fixedAssetRepository.findAll();
    }

    @PostMapping("/assets")
    @Transactional
    public FixedAsset addAsset(@RequestBody FixedAsset asset) {
        return service.addAsset(asset);
    }

    @PutMapping("/assets/{id}")
    @Transactional
    public FixedAsset updateAsset(@PathVariable UUID id, @RequestBody FixedAsset asset) {
        return service.updateAsset(id, asset);
    }

    @DeleteMapping("/assets/{id}")
    @Transactional
    public void deleteAsset(@PathVariable UUID id) {
        service.deleteAsset(id);
    }

    @PostMapping("/assets/{id}/depreciation")
    @Transactional
    public List<DepreciationEntry> runDepreciation(@PathVariable UUID id,
                                                   @RequestBody(required = false) Map<String, Object> body) {
        Long asOf = null;
        if (body != null && body.get("asOf") != null) {
            asOf = ((Number) body.get("asOf")).longValue();
        }
        return service.runDepreciation(id, asOf);
    }

    @PostMapping("/assets/depreciation/run-all")
    @Transactional
    public List<DepreciationEntry> runDepreciationAll(@RequestBody(required = false) Map<String, Object> body) {
        Long asOf = null;
        if (body != null && body.get("asOf") != null) {
            asOf = ((Number) body.get("asOf")).longValue();
        }
        return service.runDepreciationForAll(asOf);
    }

    @PostMapping("/assets/{id}/dispose")
    @Transactional
    public AssetDisposal disposeAsset(@PathVariable UUID id, @RequestBody AssetDisposal disposal) {
        return service.disposeAsset(id, disposal);
    }

    // ─── Depreciation & disposals ──────────────────────────────────────────

    @GetMapping("/depreciation")
    public List<DepreciationEntry> getAllDepreciation() {
        return depreciationEntryRepository.findAll();
    }

    @GetMapping("/disposals")
    public List<AssetDisposal> getAllDisposals() {
        return assetDisposalRepository.findAll();
    }

    // ─── Rentals ───────────────────────────────────────────────────────────

    @GetMapping("/rent-contracts")
    public List<RentalContract> getAllContracts() {
        return service.getAllContracts();
    }

    @PostMapping("/rent-contracts")
    @Transactional
    public RentalContract addContract(@RequestBody RentalContract contract) {
        return service.addContract(contract);
    }

    @PutMapping("/rent-contracts/{id}")
    @Transactional
    public RentalContract updateContract(@PathVariable UUID id, @RequestBody RentalContract contract) {
        return service.updateContract(id, contract);
    }

    @DeleteMapping("/rent-contracts/{id}")
    @Transactional
    public void deleteContract(@PathVariable UUID id) {
        service.deleteContract(id);
    }

    @PostMapping("/rent-contracts/{id}/amortize")
    @Transactional
    public List<RentalPayment> amortizeContract(@PathVariable UUID id) {
        return service.amortizePrepaid(id);
    }

    @GetMapping("/rent-payments")
    public List<RentalPayment> getAllPayments() {
        return rentalPaymentRepository.findAll();
    }

    @PostMapping("/rent-payments")
    @Transactional
    public RentalPayment addPayment(@RequestBody RentalPayment payment) {
        return service.addRentalPayment(payment);
    }

    @DeleteMapping("/rent-payments/{id}")
    @Transactional
    public void deletePayment(@PathVariable UUID id) {
        service.deleteRentalPayment(id);
    }
}