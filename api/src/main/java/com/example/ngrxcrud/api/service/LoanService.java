package com.example.ngrxcrud.api.service;

import com.example.ngrxcrud.api.model.*;
import com.example.ngrxcrud.api.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class LoanService {

    @Autowired
    private LoanRequestRepository loanRequestRepository;
    @Autowired
    private LoanRepository loanRepository;
    @Autowired
    private LoanScheduleRepository loanScheduleRepository;
    @Autowired
    private LoanTransactionRepository loanTransactionRepository;
    @Autowired
    private LoanTypeRepository loanTypeRepository;
    @Autowired
    private JournalEntryService journalEntryService;

    // ─── Loan Request ─────────────────────────────────────────────────────────

    @Transactional
    public LoanRequest createLoanRequest(LoanRequest req) {
        // Validate loan type exists
        loanTypeRepository.findById(req.getLoanTypeId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Loan type not found"));

        req.setStatus("PENDING");
        req.setCreatedAt(System.currentTimeMillis());
        return loanRequestRepository.save(req);
    }

    public List<LoanRequest> getAllRequests() {
        return loanRequestRepository.findAll();
    }

    // ─── Loan Approval ────────────────────────────────────────────────────────

    @Transactional
    public Loan approveLoanRequest(UUID requestId, UUID approvedBy) {
        LoanRequest request = loanRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Loan request not found"));

        if (!"PENDING".equals(request.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only PENDING requests can be approved");
        }

        LoanType loanType = loanTypeRepository.findById(request.getLoanTypeId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Loan type not found"));

        // Determine interest rate based on gender (default to male; gender info could
        // be added later)
        BigDecimal interestRate = loanType.getMaleInterestAmount() != null
                ? loanType.getMaleInterestAmount()
                : BigDecimal.ZERO;

        // Update loan request status
        request.setStatus("APPROVED");
        request.setApprovedBy(approvedBy);
        request.setApprovedAt(System.currentTimeMillis());
        loanRequestRepository.save(request);

        // Create loan record
        Loan loan = new Loan();
        loan.setLoanRequestId(requestId);
        loan.setMemberId(request.getMemberId());
        loan.setLoanTypeId(request.getLoanTypeId());
        loan.setApprovedAmount(request.getRequestedAmount());
        loan.setInterestRate(interestRate);
        loan.setTermMonths(request.getRequestedMonths());
        loan.setIsDisbursed(false);
        loan.setStatus("APPROVED");
        loan.setCreatedAt(System.currentTimeMillis());
        Loan savedLoan = loanRepository.save(loan);

        // Generate repayment schedule
        generateSchedule(savedLoan, interestRate);

        return savedLoan;
    }

    private void generateSchedule(Loan loan, BigDecimal annualInterestRate) {
        BigDecimal principal = loan.getApprovedAmount();
        int months = loan.getTermMonths();

        // Monthly interest rate (annual % / 12 / 100)
        BigDecimal monthlyRate = annualInterestRate
                .divide(BigDecimal.valueOf(12), 10, RoundingMode.HALF_UP)
                .divide(BigDecimal.valueOf(100), 10, RoundingMode.HALF_UP);

        BigDecimal monthlyPrincipal = principal.divide(BigDecimal.valueOf(months), 2, RoundingMode.HALF_UP);

        long now = System.currentTimeMillis();
        long msPerMonth = 30L * 24 * 60 * 60 * 1000; // ~30 days

        List<LoanSchedule> schedules = new ArrayList<>();
        BigDecimal remainingPrincipal = principal;

        for (int i = 1; i <= months; i++) {
            BigDecimal interest = remainingPrincipal.multiply(monthlyRate).setScale(2, RoundingMode.HALF_UP);
            BigDecimal total = monthlyPrincipal.add(interest).setScale(2, RoundingMode.HALF_UP);

            LoanSchedule schedule = new LoanSchedule();
            schedule.setLoanId(loan.getId());
            schedule.setInstallmentNo(i);
            schedule.setDueDate(now + (long) i * msPerMonth);
            schedule.setPrincipalAmount(monthlyPrincipal);
            schedule.setInterestAmount(interest);
            schedule.setTotalAmount(total);
            schedule.setPaidAmount(BigDecimal.ZERO);
            schedule.setStatus("PENDING");
            schedule.setCreatedAt(now);

            schedules.add(schedule);
            remainingPrincipal = remainingPrincipal.subtract(monthlyPrincipal);
        }

        loanScheduleRepository.saveAll(schedules);
    }

    // ─── Disbursement ─────────────────────────────────────────────────────────

    @Transactional
    public Loan disburseLoan(UUID loanId, UUID cashAccountId, String referenceNo) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Loan not found"));

        if (!"APPROVED".equals(loan.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Loan must be in APPROVED status to disburse");
        }
        if (Boolean.TRUE.equals(loan.getIsDisbursed())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Loan already disbursed");
        }

        LoanType loanType = loanTypeRepository.findById(loan.getLoanTypeId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Loan type not found"));

        long now = System.currentTimeMillis();

        // Update loan
        loan.setIsDisbursed(true);
        loan.setStatus("ACTIVE");
        loan.setDisbursementDate(now);
        loanRepository.save(loan);

        // Record loan transaction
        LoanTransaction txn = new LoanTransaction();
        txn.setLoanId(loanId);
        txn.setTransactionType("DISBURSEMENT");
        txn.setAmount(loan.getApprovedAmount());
        txn.setPrincipalPortion(loan.getApprovedAmount());
        txn.setInterestPortion(BigDecimal.ZERO);
        txn.setPenaltyPortion(BigDecimal.ZERO);
        txn.setReferenceNo(referenceNo);
        txn.setCreatedAt(now);
        loanTransactionRepository.save(txn);

        // Journal entries
        // Determine principal account (long/short term)
        UUID principalAccountId = "LongTerm".equals(loanType.getLoanTerm())
                ? loanType.getLongTermPrincipalAccount()
                : loanType.getShortTermPrincipalAccount();

        double amount = loan.getApprovedAmount().doubleValue();

        // Debit: loan principal account (asset increases)
        journalEntryService.recordDebitEntry(
                principalAccountId,
                loanId,
                referenceNo != null ? referenceNo : "DISB-" + loanId,
                now,
                "Loan disbursement",
                amount);

        // Credit: cash/bank account (cash goes out)
        journalEntryService.recordCreditEntry(
                cashAccountId,
                loanId,
                referenceNo != null ? referenceNo : "DISB-" + loanId,
                now,
                "Loan disbursement",
                amount);

        return loan;
    }

    // ─── Due Amounts ──────────────────────────────────────────────────────────

    public BigDecimal getDueAmount(UUID loanId) {
        long now = System.currentTimeMillis();
        List<LoanSchedule> unpaid = loanScheduleRepository
                .findByLoanIdAndStatusNot(loanId, "PAID");

        return unpaid.stream()
                .filter(s -> s.getDueDate() <= now)
                .map(s -> s.getTotalAmount().subtract(s.getPaidAmount()))
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);
    }

    // ─── Repayment ────────────────────────────────────────────────────────────

    @Transactional
    public Loan processRepayment(UUID loanId, BigDecimal paymentAmount, UUID cashAccountId, String referenceNo) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Loan not found"));

        if (!"ACTIVE".equals(loan.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Loan is not active");
        }

        LoanType loanType = loanTypeRepository.findById(loan.getLoanTypeId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Loan type not found"));

        List<LoanSchedule> schedules = loanScheduleRepository
                .findByLoanIdOrderByInstallmentNo(loanId);

        BigDecimal remaining = paymentAmount;
        BigDecimal totalPrincipalPaid = BigDecimal.ZERO;
        BigDecimal totalInterestPaid = BigDecimal.ZERO;

        long now = System.currentTimeMillis();

        for (LoanSchedule schedule : schedules) {
            if ("PAID".equals(schedule.getStatus()))
                continue;
            if (remaining.compareTo(BigDecimal.ZERO) <= 0)
                break;

            BigDecimal scheduleRemaining = schedule.getTotalAmount().subtract(schedule.getPaidAmount());
            BigDecimal interestRemaining = schedule.getInterestAmount()
                    .subtract(schedule.getPaidAmount().min(schedule.getInterestAmount()));
            BigDecimal principalRemaining = scheduleRemaining.subtract(interestRemaining);

            // Pay interest first
            BigDecimal interestPayment = remaining.min(interestRemaining);
            remaining = remaining.subtract(interestPayment);
            totalInterestPaid = totalInterestPaid.add(interestPayment);

            // Then pay principal
            BigDecimal principalPayment = remaining.min(principalRemaining);
            remaining = remaining.subtract(principalPayment);
            totalPrincipalPaid = totalPrincipalPaid.add(principalPayment);

            BigDecimal paid = interestPayment.add(principalPayment);
            schedule.setPaidAmount(schedule.getPaidAmount().add(paid));

            BigDecimal newRemaining = schedule.getTotalAmount().subtract(schedule.getPaidAmount());
            if (newRemaining.compareTo(BigDecimal.ZERO) <= 0) {
                schedule.setStatus("PAID");
            } else {
                schedule.setStatus("PARTIAL");
            }
            loanScheduleRepository.save(schedule);
        }

        // Record loan transaction
        BigDecimal actualPaid = paymentAmount.subtract(remaining);
        LoanTransaction txn = new LoanTransaction();
        txn.setLoanId(loanId);
        txn.setTransactionType("REPAYMENT");
        txn.setAmount(actualPaid);
        txn.setPrincipalPortion(totalPrincipalPaid);
        txn.setInterestPortion(totalInterestPaid);
        txn.setPenaltyPortion(BigDecimal.ZERO);
        txn.setReferenceNo(referenceNo);
        txn.setCreatedAt(now);
        loanTransactionRepository.save(txn);

        String ftp = referenceNo != null ? referenceNo : "REPAY-" + loanId;

        // Journal entries
        UUID principalAccountId = "LongTerm".equals(loanType.getLoanTerm())
                ? loanType.getLongTermPrincipalAccount()
                : loanType.getShortTermPrincipalAccount();
        UUID interestAccountId = loanType.getInterestCollectiveAccount();

        // Debit: cash/bank (cash received)
        journalEntryService.recordDebitEntry(
                cashAccountId, loanId, ftp, now, "Loan repayment", actualPaid.doubleValue());

        // Credit: principal account
        if (totalPrincipalPaid.compareTo(BigDecimal.ZERO) > 0) {
            journalEntryService.recordCreditEntry(
                    principalAccountId, loanId, ftp, now, "Loan principal repayment", totalPrincipalPaid.doubleValue());
        }

        // Credit: interest income account
        if (totalInterestPaid.compareTo(BigDecimal.ZERO) > 0 && interestAccountId != null) {
            journalEntryService.recordCreditEntry(
                    interestAccountId, loanId, ftp, now, "Loan interest income", totalInterestPaid.doubleValue());
        }

        // Check if loan is fully paid → close it
        boolean allPaid = loanScheduleRepository
                .findByLoanIdAndStatusNot(loanId, "PAID").isEmpty();
        if (allPaid) {
            loan.setStatus("CLOSED");
            loanRepository.save(loan);
        }

        return loanRepository.findById(loanId).orElse(loan);
    }

    // ─── Queries ──────────────────────────────────────────────────────────────

    public List<Loan> getAllLoans() {
        return loanRepository.findAll();
    }

    public List<LoanSchedule> getScheduleForLoan(UUID loanId) {
        return loanScheduleRepository.findByLoanIdOrderByInstallmentNo(loanId);
    }

    public List<LoanTransaction> getTransactionsForLoan(UUID loanId) {
        return loanTransactionRepository.findByLoanId(loanId);
    }
}
