package com.example.ngrxcrud.api.dto;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Payload models returned by the finance reporting endpoints.
 * Each nested class maps 1:1 to a frontend report shape.
 */
public final class FinanceReport {

    private FinanceReport() {
    }

    /** Base for reports that carry an optional date window. */
    public abstract static class Base implements Serializable {
        public Long from;
        public Long to;
    }

    // ─── Trial Balance ────────────────────────────────────────────────────────

    public static class TrialRow implements Serializable {
        public UUID accountId;
        public String accountNumber;
        public String accountName;
        public Integer accountType;
        public double debit;
        public double credit;
        public double balance;
    }

    public static class TrialGroup implements Serializable {
        public String name;
        public Integer accountType;
        public double debit;
        public double credit;
        public double balance;
        public List<TrialRow> rows = new ArrayList<>();
    }

    public static class TrialBalanceReport extends Base {
        public List<TrialGroup> groups = new ArrayList<>();
        public double totalDebit;
        public double totalCredit;
        public double totalBalance;
    }

    // ─── Income Statement ─────────────────────────────────────────────────────

    public static class IncomeRow implements Serializable {
        public UUID accountId;
        public String accountNumber;
        public String accountName;
        public double amount;
    }

    public static class IncomeStatementReport extends Base {
        public List<IncomeRow> revenue = new ArrayList<>();
        public List<IncomeRow> expenses = new ArrayList<>();
        public double totalRevenue;
        public double totalExpenses;
        public double netIncome;
    }

    // ─── Balance Sheet ────────────────────────────────────────────────────────

    public static class BalanceRow implements Serializable {
        public UUID accountId;
        public String accountNumber;
        public String accountName;
        public double amount;
        public boolean isRetainedEarnings;
    }

    public static class BalanceSheetReport extends Base {
        public List<BalanceRow> assets = new ArrayList<>();
        public List<BalanceRow> liabilities = new ArrayList<>();
        public List<BalanceRow> equity = new ArrayList<>();
        public double totalAssets;
        public double totalLiabilities;
        public double totalEquity;
        public double totalLiabilitiesAndEquity;
        public double netIncome;
        public boolean balanced;
    }

    // ─── Cash Flow Statement ──────────────────────────────────────────────────

    public static class CashFlowRow implements Serializable {
        public UUID id;
        public Long date;
        public UUID accountId;
        public String accountNumber;
        public String accountName;
        public String description;
        public String reference;
        public String ftp;
        public double amount;

        public long getDateValue() {
            return date != null ? date : 0L;
        }
    }

    public static class CashFlowReport extends Base {
        public List<CashFlowRow> inflows = new ArrayList<>();
        public List<CashFlowRow> outflows = new ArrayList<>();
        public double totalInflows;
        public double totalOutflows;
        public double netCashFlow;
    }

    // ─── Cash Flow Statement (ethiotrit-style summary) ────────────────────────
    //
    // Groups accounts into Operating / Investing / Financing activities.
    // `balance` is each account's net cash effect for the window; the section
    // nets roll up into netCashFlow. `accountId`/`accountNumber`/`accountName`
    // let the UI build drill-down ledger links (mirrors ethiotrit's rows).

    public static class CashFlowActivityRow implements Serializable {
        public UUID accountId;
        public String accountNumber;
        public String accountName;
        public Integer accountType;
        public double debit;
        public double credit;
        public double balance;
    }

    public static class CashFlowStatementReport extends Base {
        public List<CashFlowActivityRow> operating = new ArrayList<>();
        public List<CashFlowActivityRow> investing = new ArrayList<>();
        public List<CashFlowActivityRow> financing = new ArrayList<>();
        public double operatingNet;
        public double investingNet;
        public double financingNet;
        public double netCashFlow;
        // Total Year Cash Flow (cash & bank balances)
        public double startingAmount;
        public double endingAmount;
        public double netChange;
    }

    // ─── General Ledger ───────────────────────────────────────────────────────

    public static class LedgerRow implements Serializable {
        public UUID id;
        public Long date;
        public Long createdAt;
        public UUID accountId;
        public String accountNumber;
        public String accountName;
        public Integer accountType;
        public String description;
        public String reference;
        public String ftp;
        public boolean credit;
        public double debit;
        public double creditAmount;
        public double runningBalance;
    }

    public static class GeneralLedgerReport extends Base {
        public List<LedgerRow> entries = new ArrayList<>();
        public double totalDebit;
        public double totalCredit;
        public double balance;
        public double openingBalance;
    }

    // ─── Retained Earnings ──────────────────────────────────────────────────

    public static class RetainedEarningsAccountRow implements Serializable {
        public UUID accountId;
        public String accountNumber;
        public String accountName;
        public Integer accountType;
        public double debit;
        public double credit;
        public double amount;
    }

    public static class RetainedEarningsPeriodRow implements Serializable {
        public String label;
        public Long from;
        public Long to;
        public double revenue;
        public double expenses;
        public double netIncome;
        public List<RetainedEarningsAccountRow> accounts = new ArrayList<>();
    }

    public static class RetainedEarningsReport extends Base {
        public double opening;
        public double netIncome;
        public double closing;
        public List<RetainedEarningsPeriodRow> periods = new ArrayList<>();
    }

    // ─── Statement of Changes in Equity ───────────────────────────────────────
    //
    // Mirrors ethiotrit's StatementOfChangesInEquityComponent: a 5-column,
    // 7-row statement (Description / Share Capital / Statutory Reserve /
    // Retained Earnings / Total Equity). Nullable numeric cells render as a
    // dash in the UI. `detail` selects the drill-down for a non-balance row:
    //   "share_capital"    -> share account ledger
    //   "statutory_reserve"-> reserve account ledger
    //   "net_surplus"      -> income statement accounts
    //   "dividends"        -> (no data in SACCO yet)

    public static class EquityStatementRow implements Serializable {
        public String description;
        public Double shareCapital;
        public Double statutoryReserve;
        public Double retainedEarnings;
        public Double totalEquity;
        public String detail;
    }

    public static class StatementOfChangesInEquityReport extends Base {
        public List<EquityStatementRow> rows = new ArrayList<>();
        // Account references used to build drill-down ledger links.
        public UUID shareAccountId;
        public String shareAccountNumber;
        public String shareAccountName;
        public UUID reserveAccountId;
        public String reserveAccountNumber;
        public String reserveAccountName;
    }

    // ─── Finance Summary (report hub) ─────────────────────────────────────────

    public static class SummaryReport extends Base {
        public double totalAssets;
        public double totalLiabilities;
        public double totalEquity;
        public double totalRevenue;
        public double totalExpenses;
        public double netIncome;
        public double netWorth;
        public double cashAndBankBalance;
        public double savingsTotal;
        public double loanPortfolio;
        public long activeLoans;
        public long totalAccounts;
        public long totalEntries;
    }

    // ─── Periodic Finance Report (Monthly & Daily) ────────────────────────────
    //
    // A generic, data-driven report rendered as a table where each COLUMN is a
    // period bucket (month of the year, or week within a month) and each ROW is a
    // category/aggregation. Rows are grouped by a section header for display.

    /** One column = one period bucket with its inclusive date window. */
    public static class PeriodColumn implements Serializable {
        public String label;
        public Long from;
        public Long to;
    }

    /** One row = a category with a value per period bucket. */
    public static class PeriodRow implements Serializable {
        public String group;
        public String label;
        public String key;
        public List<Double> values = new ArrayList<>();
    }

    public static class PeriodReport extends Base {
        public int year;
        public Integer month;
        public Integer week;
        public List<PeriodColumn> columns = new ArrayList<>();
        public List<PeriodRow> rows = new ArrayList<>();
    }

    /** Per-saving-type buckets exposing collections and withdrawals by member type. */
    public static class SavingTypeBucket implements Serializable {
        public java.util.UUID id;
        public String name;
        public List<Double> newMembers = new ArrayList<>();
        public List<Double> existingMembers = new ArrayList<>();
        public List<Double> total = new ArrayList<>();
        public List<Double> withdrawals = new ArrayList<>();
    }

    public static class DetailReport extends Base {
        public String category;
        public String key;
        public String title;
        public List<PeriodDetailRow> rows = new ArrayList<>();
        public double total;
    }

    public static class PeriodDetailRow implements Serializable {
        public Long date;
        public String memberName;
        public String memberId;
        public String reference;
        public String note;
        public double amount;
        public Long periodFrom;
        public Long periodTo;
    }

    // ─── Ethiotrit-style Finance Report ────────────────────────────────────────
    //
    // Mirrors ethiotrit's finance report exactly: a `monthlyData` array (12 rows,
    // one per month), per-account income/expense breakdowns, and a `weeklyData`
    // array (one row per week of the year). Field names are kept identical so the
    // frontend can be a near drop-in of ethiotrit's report component.

    /** One month (or week) of the finance report. */
    public static class FinancePeriodRow implements Serializable {
        public Integer period;          // month (1..12) or week (1..53)
        public double new_compulsory;
        public double old_compulsory;
        public double total_compulsory;
        public double new_voluntary;
        public double old_voluntary;
        public double total_voluntary;
        public double new_share;
        public double old_share;
        public double total_share;
        public double transfer_voluntary_to_mandatory;
        public double transfer_voluntary_to_voluntary;
        public double transfer_voluntary_to_share;
        public double transfer_share_to_share;
        public double transfer_total;
        public double withdrawal_mandatory;
        public double withdrawal_voluntary;
        public double withdrawal_total;
        public double disbursement_total;
        public double income_total;
        public double expense_total;
    }

    /** A single income/expense account aggregated per month or week. */
    public static class AccountPeriodRow implements Serializable {
        public String accountId;
        public String accountName;
        public String parentName;
        public Integer month;
        public Integer week;
        public double amount;
    }

    /** One transaction shown when drilling into a report cell. */
    public static class ReportDetailRow implements Serializable {
        public Long date;
        public String memberName;
        public String memberId;
        public String reference;
        public String accountName;
        public String description;
        public double amount;
    }

    public static class ReportDetail implements Serializable {
        public String title;
        public List<ReportDetailRow> rows = new ArrayList<>();
        public double total;
    }

    public static class MonthlyFinanceReport implements Serializable {
        public int year;
        public List<FinancePeriodRow> monthlyData = new ArrayList<>();
        public List<AccountPeriodRow> incomeAccounts = new ArrayList<>();
        public List<AccountPeriodRow> expenseAccounts = new ArrayList<>();
    }

    public static class WeeklyFinanceReport implements Serializable {
        public int year;
        public List<FinancePeriodRow> weeklyData = new ArrayList<>();
        public List<AccountPeriodRow> incomeAccounts = new ArrayList<>();
        public List<AccountPeriodRow> expenseAccounts = new ArrayList<>();
    }
}