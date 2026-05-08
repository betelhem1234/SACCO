package com.example.ngrxcrud.api.controller;

import com.example.ngrxcrud.api.model.*;
import com.example.ngrxcrud.api.service.LoanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/loans")
@CrossOrigin(origins = "*")
public class LoanController {

    @Autowired
    private LoanService loanService;

    // ─── Loan Requests ────────────────────────────────────────────────────────

    @GetMapping("/requests")
    public List<LoanRequest> getAllRequests() {
        return loanService.getAllRequests();
    }

    @PostMapping("/request")
    public LoanRequest createRequest(@RequestBody LoanRequest req) {
        return loanService.createLoanRequest(req);
    }

    /**
     * Approve a loan request; creates Loan + schedule.
     * Body: { "approvedBy": "<uuid>" }
     */
    @PostMapping("/approve/{requestId}")
    public Loan approve(@PathVariable UUID requestId, @RequestBody Map<String, String> body) {
        UUID approvedBy = body.containsKey("approvedBy") ? UUID.fromString(body.get("approvedBy")) : null;
        return loanService.approveLoanRequest(requestId, approvedBy);
    }

    // ─── Loans ────────────────────────────────────────────────────────────────

    @GetMapping
    public List<Loan> getAllLoans() {
        return loanService.getAllLoans();
    }

    /**
     * Disburse a loan.
     * Body: { "cashAccountId": "<uuid>", "referenceNo": "REF-001" }
     */
    @PostMapping("/disburse/{loanId}")
    public Loan disburse(@PathVariable UUID loanId, @RequestBody Map<String, String> body) {
        UUID cashAccountId = UUID.fromString(body.get("cashAccountId"));
        String referenceNo = body.getOrDefault("referenceNo", null);
        return loanService.disburseLoan(loanId, cashAccountId, referenceNo);
    }

    // ─── Schedule ─────────────────────────────────────────────────────────────

    @GetMapping("/{loanId}/schedule")
    public List<LoanSchedule> getSchedule(@PathVariable UUID loanId) {
        return loanService.getScheduleForLoan(loanId);
    }

    @GetMapping("/{loanId}/due")
    public Map<String, Object> getDue(@PathVariable UUID loanId) {
        BigDecimal due = loanService.getDueAmount(loanId);
        return Map.of("loanId", loanId, "totalDue", due);
    }

    // ─── Repayment ────────────────────────────────────────────────────────────

    /**
     * Process a loan repayment.
     * Body: { "amount": 5000, "cashAccountId": "<uuid>", "referenceNo": "REC-001" }
     */
    @PostMapping("/repay/{loanId}")
    public Loan repay(@PathVariable UUID loanId, @RequestBody Map<String, String> body) {
        BigDecimal amount = new BigDecimal(body.get("amount"));
        UUID cashAccountId = UUID.fromString(body.get("cashAccountId"));
        String referenceNo = body.getOrDefault("referenceNo", null);
        return loanService.processRepayment(loanId, amount, cashAccountId, referenceNo);
    }

    // ─── Transactions ─────────────────────────────────────────────────────────

    @GetMapping("/{loanId}/transactions")
    public List<LoanTransaction> getTransactions(@PathVariable UUID loanId) {
        return loanService.getTransactionsForLoan(loanId);
    }
}
