package com.example.ngrxcrud.api.controller;

import com.example.ngrxcrud.api.dto.FinanceReport;
import com.example.ngrxcrud.api.service.FinanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/finance")
@CrossOrigin(origins = "*")
public class FinanceController {

    @Autowired
    private FinanceService financeService;

    @GetMapping("/summary")
    public FinanceReport.SummaryReport summary(
            @RequestParam(required = false) Long from,
            @RequestParam(required = false) Long to) {
        return financeService.summary(from, to);
    }

    @GetMapping("/trial-balance")
    public FinanceReport.TrialBalanceReport trialBalance(
            @RequestParam(required = false) Long from,
            @RequestParam(required = false) Long to) {
        return financeService.trialBalance(from, to);
    }

    @GetMapping("/income-statement")
    public FinanceReport.IncomeStatementReport incomeStatement(
            @RequestParam(required = false) Long from,
            @RequestParam(required = false) Long to) {
        return financeService.incomeStatement(from, to);
    }

    @GetMapping("/balance-sheet")
    public FinanceReport.BalanceSheetReport balanceSheet(
            @RequestParam(required = false) Long from,
            @RequestParam(required = false) Long to) {
        return financeService.balanceSheet(from, to);
    }

    @GetMapping("/cash-flow")
    public FinanceReport.CashFlowReport cashFlow(
            @RequestParam(required = false) Long from,
            @RequestParam(required = false) Long to) {
        return financeService.cashFlow(from, to);
    }

    @GetMapping("/cash-flow-statement")
    public FinanceReport.CashFlowStatementReport cashFlowStatement(
            @RequestParam(required = false) Long from,
            @RequestParam(required = false) Long to) {
        return financeService.cashFlowStatement(from, to);
    }

    @GetMapping("/general-ledger")
    public FinanceReport.GeneralLedgerReport generalLedger(
            @RequestParam(required = false) Long from,
            @RequestParam(required = false) Long to,
            @RequestParam(required = false) UUID accountId) {
        return financeService.generalLedger(from, to, accountId);
    }

    @GetMapping("/retained-earnings")
    public FinanceReport.RetainedEarningsReport retainedEarnings(
            @RequestParam(required = false) Long from,
            @RequestParam(required = false) Long to) {
        return financeService.retainedEarnings(from, to);
    }

    @GetMapping("/statement-of-changes-in-equity")
    public FinanceReport.StatementOfChangesInEquityReport statementOfChangesInEquity(
            @RequestParam(required = false) Long from,
            @RequestParam(required = false) Long to) {
        return financeService.statementOfChangesInEquity(from, to);
    }

    @GetMapping("/monthly-report")
    public FinanceReport.MonthlyFinanceReport monthlyReport(@RequestParam int year) {
        return financeService.monthlyFinanceReport(year);
    }

    @GetMapping("/weekly-report")
    public FinanceReport.WeeklyFinanceReport weeklyReport(@RequestParam int year) {
        return financeService.weeklyFinanceReport(year);
    }

    @GetMapping("/period-detail")
    public FinanceReport.ReportDetail periodDetail(
            @RequestParam long from,
            @RequestParam long to,
            @RequestParam String category,
            @RequestParam(required = false) String accountName) {
        return financeService.periodDetail(from, to, category, accountName);
    }
}