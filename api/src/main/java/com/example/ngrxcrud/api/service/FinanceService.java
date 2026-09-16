package com.example.ngrxcrud.api.service;

import com.example.ngrxcrud.api.dto.FinanceReport;
import com.example.ngrxcrud.api.model.Account;
import com.example.ngrxcrud.api.model.AccountCategory;
import com.example.ngrxcrud.api.model.AccountType;
import com.example.ngrxcrud.api.model.JournalEntry;
import com.example.ngrxcrud.api.model.Loan;
import com.example.ngrxcrud.api.model.Member;
import com.example.ngrxcrud.api.model.MemberSavingPeriod;
import com.example.ngrxcrud.api.model.Saving;
import com.example.ngrxcrud.api.model.SavingPeriodStatus;
import com.example.ngrxcrud.api.model.SavingStatus;
import com.example.ngrxcrud.api.model.SavingType;
import com.example.ngrxcrud.api.model.SharePurchase;
import com.example.ngrxcrud.api.model.ShareStatus;
import com.example.ngrxcrud.api.model.ShareSubscription;
import com.example.ngrxcrud.api.model.ShareTransfer;
import com.example.ngrxcrud.api.model.Transfer;
import com.example.ngrxcrud.api.model.TransferStatus;
import com.example.ngrxcrud.api.model.Withdrawal;
import com.example.ngrxcrud.api.model.WithdrawalStatus;
import com.example.ngrxcrud.api.repository.AccountRepository;
import com.example.ngrxcrud.api.repository.JournalEntryRepository;
import com.example.ngrxcrud.api.repository.LoanRepository;
import com.example.ngrxcrud.api.repository.MemberRepository;
import com.example.ngrxcrud.api.repository.MemberSavingPeriodRepository;
import com.example.ngrxcrud.api.repository.SavingRepository;
import com.example.ngrxcrud.api.repository.SavingTypeRepository;
import com.example.ngrxcrud.api.repository.SettingRepository;
import com.example.ngrxcrud.api.repository.ShareTransferRepository;
import com.example.ngrxcrud.api.repository.ShareSubscriptionRepository;
import com.example.ngrxcrud.api.repository.SharePurchaseRepository;
import com.example.ngrxcrud.api.repository.TransferRepository;
import com.example.ngrxcrud.api.repository.WithdrawalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import java.time.Instant;
import java.time.LocalDate;
import java.time.Month;
import java.time.ZoneId;
import java.time.format.TextStyle;
import java.time.temporal.WeekFields;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.TreeMap;

@Service
public class FinanceService {

    @Autowired
    private JournalEntryRepository journalEntryRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private SavingRepository savingRepository;

    @Autowired
    private SavingTypeRepository savingTypeRepository;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private TransferRepository transferRepository;

    @Autowired
    private WithdrawalRepository withdrawalRepository;

    @Autowired
    private SharePurchaseRepository sharePurchaseRepository;

    @Autowired
    private ShareTransferRepository shareTransferRepository;

    @Autowired
    private ShareSubscriptionRepository shareSubscriptionRepository;

    @Autowired
    private SettingRepository settingRepository;

    @Autowired
    private LoanRepository loanRepository;

    @Autowired
    private MemberSavingPeriodRepository memberSavingPeriodRepository;

    /**
     * Journals filtered by an optional date window (inclusive epoch millis).
     */
    public List<JournalEntry> journalsInRange(Long from, Long to) {
        List<JournalEntry> all = journalEntryRepository.findAll();
        if (from == null && to == null) {
            return all;
        }
        List<JournalEntry> filtered = new ArrayList<>();
        for (JournalEntry e : all) {
            long d = e.getDate() != null ? e.getDate() : 0L;
            if (from != null && d < from) {
                continue;
            }
            if (to != null && d > to) {
                continue;
            }
            filtered.add(e);
        }
        filtered.sort(Comparator.comparing(JournalEntry::getDate,
                        Comparator.nullsLast(Long::compareTo))
                .thenComparing(JournalEntry::getCreatedAt,
                        Comparator.nullsFirst(Long::compareTo)));
        return filtered;
    }

    /**
     * Aggregates debit/credit amounts per account over the date window.
     * Returns map accountId -> double[0]=debit, double[1]=credit.
     */
    public Map<UUID, double[]> aggregateByAccount(Long from, Long to) {
        Map<UUID, double[]> totals = new LinkedHashMap<>();
        for (JournalEntry e : journalsInRange(from, to)) {
            if (e.getAccountId() == null) {
                continue;
            }
            double[] acc = totals.computeIfAbsent(e.getAccountId(), k -> new double[2]);
            if (Boolean.TRUE.equals(e.getIsCredit())) {
                acc[1] += e.getAmount() != null ? e.getAmount() : 0.0;
            } else {
                acc[0] += e.getAmount() != null ? e.getAmount() : 0.0;
            }
        }
        return totals;
    }

    public List<Account> accountsInOrder() {
        return accountRepository.findAll();
    }

    // ─── Trial Balance ────────────────────────────────────────────────────────

    public FinanceReport.TrialBalanceReport trialBalance(Long from, Long to) {
        FinanceReport.TrialBalanceReport report = new FinanceReport.TrialBalanceReport();
        report.from = from;
        report.to = to;

        Map<UUID, double[]> totals = aggregateByAccount(from, to);
        List<Account> accounts = accountsInOrder();
        accounts.sort(Comparator.comparing(Account::getAccountNumber,
                Comparator.nullsLast(String::compareTo)));

        List<FinanceReport.TrialGroup> groups = new ArrayList<>();
        for (AccountType type : AccountType.values()) {
            groups.add(makeGroup(type, accounts, totals));
        }
        groups.sort(Comparator.comparing(g -> g.accountType));

        report.groups = groups;
        for (FinanceReport.TrialGroup group : groups) {
            report.totalDebit += group.debit;
            report.totalCredit += group.credit;
            report.totalBalance += group.balance;
        }
        report.totalDebit = round(report.totalDebit);
        report.totalCredit = round(report.totalCredit);
        report.totalBalance = round(report.totalBalance);
        return report;
    }

    private FinanceReport.TrialGroup makeGroup(AccountType type, List<Account> accounts,
                                               Map<UUID, double[]> totals) {
        FinanceReport.TrialGroup group = new FinanceReport.TrialGroup();
        group.name = type.name();
        group.accountType = type.getCode();
        List<FinanceReport.TrialRow> rows = new ArrayList<>();
        for (Account account : accounts) {
            if (account.getAccountType() != type) {
                continue;
            }
            double[] t = totals.getOrDefault(account.getId(), new double[2]);
            double debit = round(t[0]);
            double credit = round(t[1]);
            double balance = round(balanceFor(account, debit, credit));
            if (debit == 0 && credit == 0 && !includeZeroAccounts()) {
                continue;
            }
            FinanceReport.TrialRow row = new FinanceReport.TrialRow();
            row.accountId = account.getId();
            row.accountNumber = account.getAccountNumber();
            row.accountName = account.getName();
            row.accountType = type.getCode();
            row.debit = debit;
            row.credit = credit;
            row.balance = balance;
            rows.add(row);
            group.debit += debit;
            group.credit += credit;
            group.balance += balance;
        }
        group.debit = round(group.debit);
        group.credit = round(group.credit);
        group.balance = round(group.balance);
        group.rows = rows;
        return group;
    }

    private boolean includeZeroAccounts() {
        return false;
    }

    private double balanceFor(Account account, double debit, double credit) {
        switch (account.getAccountType()) {
            case LIABILITY:
            case EQUITY:
            case REVENUE:
                return credit - debit;
            default:
                return debit - credit;
        }
    }

    // ─── Income Statement ─────────────────────────────────────────────────────

    public FinanceReport.IncomeStatementReport incomeStatement(Long from, Long to) {
        FinanceReport.IncomeStatementReport report = new FinanceReport.IncomeStatementReport();
        report.from = from;
        report.to = to;

        Map<UUID, double[]> totals = aggregateByAccount(from, to);
        List<Account> accounts = accountsInOrder();
        accounts.sort(Comparator.comparing(Account::getAccountNumber,
                Comparator.nullsLast(String::compareTo)));

        for (Account account : accounts) {
            double[] t = totals.getOrDefault(account.getId(), new double[2]);
            double debit = round(t[0]);
            double credit = round(t[1]);
            if (debit == 0 && credit == 0) {
                continue;
            }
            if (account.getAccountType() == AccountType.REVENUE) {
                double amount = round(credit - debit);
                report.revenue.add(row(account, amount));
                report.totalRevenue += amount;
            } else if (account.getAccountType() == AccountType.EXPENSE) {
                double amount = round(debit - credit);
                report.expenses.add(row(account, amount));
                report.totalExpenses += amount;
            }
        }
        report.totalRevenue = round(report.totalRevenue);
        report.totalExpenses = round(report.totalExpenses);
        report.netIncome = round(report.totalRevenue - report.totalExpenses);
        return report;
    }

    private FinanceReport.IncomeRow row(Account account, double amount) {
        FinanceReport.IncomeRow r = new FinanceReport.IncomeRow();
        r.accountId = account.getId();
        r.accountNumber = account.getAccountNumber();
        r.accountName = account.getName();
        r.amount = round(amount);
        return r;
    }

    // ─── Balance Sheet ────────────────────────────────────────────────────────

    public FinanceReport.BalanceSheetReport balanceSheet(Long from, Long to) {
        FinanceReport.BalanceSheetReport report = new FinanceReport.BalanceSheetReport();
        report.from = from;
        report.to = to;

        Map<UUID, double[]> totals = aggregateByAccount(from, to);
        List<Account> accounts = accountsInOrder();
        accounts.sort(Comparator.comparing(Account::getAccountNumber,
                Comparator.nullsLast(String::compareTo)));

        for (Account account : accounts) {
            double[] t = totals.getOrDefault(account.getId(), new double[2]);
            double debit = round(t[0]);
            double credit = round(t[1]);
            if (debit == 0 && credit == 0) {
                continue;
            }
            AccountType type = account.getAccountType();
            if (type == AccountType.ASSET) {
                double amount = round(debit - credit);
                report.assets.add(balanceRow(account, amount));
                report.totalAssets += amount;
            } else if (type == AccountType.LIABILITY) {
                double amount = round(credit - debit);
                report.liabilities.add(balanceRow(account, amount));
                report.totalLiabilities += amount;
            } else if (type == AccountType.EQUITY) {
                double amount = round(credit - debit);
                report.equity.add(balanceRow(account, amount));
                report.totalEquity += amount;
            }
        }

        // Retained earnings for this window: net income flows into equity.
        FinanceReport.IncomeStatementReport pnl = incomeStatement(from, to);
        double retainedEarnings = pnl.netIncome;
        if (retainedEarnings != 0) {
            FinanceReport.BalanceRow retained = new FinanceReport.BalanceRow();
            retained.accountName = "Retained earnings (net income)";
            retained.isRetainedEarnings = true;
            retained.amount = round(retainedEarnings);
            report.equity.add(retained);
            report.totalEquity += retainedEarnings;
        }

        report.totalAssets = round(report.totalAssets);
        report.totalLiabilities = round(report.totalLiabilities);
        report.totalEquity = round(report.totalEquity);
        report.totalLiabilitiesAndEquity = round(report.totalLiabilities + report.totalEquity);
        report.netIncome = round(retainedEarnings);
        report.balanced = Math.abs(report.totalAssets - report.totalLiabilitiesAndEquity) < 0.01;
        return report;
    }

    private FinanceReport.BalanceRow balanceRow(Account account, double amount) {
        FinanceReport.BalanceRow b = new FinanceReport.BalanceRow();
        b.accountId = account.getId();
        b.accountNumber = account.getAccountNumber();
        b.accountName = account.getName();
        b.amount = round(amount);
        return b;
    }

    // ─── Cash Flow Statement ──────────────────────────────────────────────────

    public FinanceReport.CashFlowReport cashFlow(Long from, Long to) {
        FinanceReport.CashFlowReport report = new FinanceReport.CashFlowReport();
        report.from = from;
        report.to = to;

        List<Account> cashAccounts = accountRepository.findByAccountCategory(AccountCategory.CASH_ACCOUNT);
        cashAccounts.addAll(accountRepository.findByAccountCategory(AccountCategory.BANK_ACCOUNT));

        for (JournalEntry e : journalsInRange(from, to)) {
            if (e.getAccountId() == null || e.getAmount() == null) {
                continue;
            }
            boolean isCashAccount = cashAccounts.stream()
                    .anyMatch(a -> a.getId().equals(e.getAccountId()));
            if (!isCashAccount) {
                continue;
            }
            Account account = accountRepository.findById(e.getAccountId()).orElse(null);
            FinanceReport.CashFlowRow row = new FinanceReport.CashFlowRow();
            row.id = e.getId();
            row.date = e.getDate();
            row.accountId = e.getAccountId();
            row.accountNumber = account != null ? account.getAccountNumber() : null;
            row.accountName = account != null ? account.getName() : "(deleted account)";
            row.description = e.getDescription();
            row.reference = e.getFtp();
            row.ftp = e.getFtp();
            row.amount = round(e.getAmount());

            if (Boolean.TRUE.equals(e.getIsCredit())) {
                report.outflows.add(row);
                report.totalOutflows += e.getAmount();
            } else {
                report.inflows.add(row);
                report.totalInflows += e.getAmount();
            }
        }
        report.inflows.sort(Comparator.comparing(FinanceReport.CashFlowRow::getDateValue));
        report.outflows.sort(Comparator.comparing(FinanceReport.CashFlowRow::getDateValue));
        report.totalInflows = round(report.totalInflows);
        report.totalOutflows = round(report.totalOutflows);
        report.netCashFlow = round(report.totalInflows - report.totalOutflows);
        return report;
    }

    // ─── Cash Flow Statement (ethiotrit-style summary) ────────────────────────
    //
    // Groups journal accounts into Operating / Investing / Financing activities
    // by account type (journal-account based). Balance is each account's net
    // cash effect for the window; the section nets roll up into netCashFlow and
    // reconcile with net income for operating activities.

    public FinanceReport.CashFlowStatementReport cashFlowStatement(Long from, Long to) {
        FinanceReport.CashFlowStatementReport report = new FinanceReport.CashFlowStatementReport();
        report.from = from;
        report.to = to;

        Map<UUID, double[]> totals = aggregateByAccount(from, to);
        List<Account> accounts = accountsInOrder();
        accounts.sort(Comparator.comparing(Account::getAccountNumber,
                Comparator.nullsLast(String::compareTo)));

        Set<UUID> cashBank = new HashSet<>();
        for (Account a : accountRepository.findByAccountCategory(AccountCategory.CASH_ACCOUNT)) {
            cashBank.add(a.getId());
        }
        for (Account a : accountRepository.findByAccountCategory(AccountCategory.BANK_ACCOUNT)) {
            cashBank.add(a.getId());
        }

        double opNet = 0;
        double invNet = 0;
        double finNet = 0;

        for (Account account : accounts) {
            double[] t = totals.getOrDefault(account.getId(), new double[2]);
            double debit = round(t[0]);
            double credit = round(t[1]);
            if (debit == 0 && credit == 0) {
                continue;
            }
            AccountType type = account.getAccountType();
            if (type == AccountType.ASSET && cashBank.contains(account.getId())) {
                continue;
            }

            double balance;
            if (type == AccountType.REVENUE) {
                balance = credit - debit;
            } else if (type == AccountType.EXPENSE) {
                balance = debit - credit;
            } else if (type == AccountType.ASSET) {
                balance = debit - credit;
            } else {
                balance = credit - debit;
            }
            balance = round(balance);

            FinanceReport.CashFlowActivityRow row = new FinanceReport.CashFlowActivityRow();
            row.accountId = account.getId();
            row.accountNumber = account.getAccountNumber();
            row.accountName = account.getName();
            row.accountType = type.getCode();
            row.debit = debit;
            row.credit = credit;
            row.balance = balance;

            if (type == AccountType.REVENUE || type == AccountType.EXPENSE) {
                report.operating.add(row);
                opNet += balance;
            } else if (type == AccountType.ASSET) {
                report.investing.add(row);
                invNet += balance;
            } else {
                report.financing.add(row);
                finNet += balance;
            }
        }

        report.operatingNet = round(opNet);
        report.investingNet = round(invNet);
        report.financingNet = round(finNet);
        report.netCashFlow = round(opNet + invNet + finNet);

        // Total Year Cash Flow: cash & bank balances at the start and end of the window.
        Map<UUID, double[]> startingTotals = aggregateByAccount(null, from != null ? from - 1 : null);
        Map<UUID, double[]> endingTotals = aggregateByAccount(null, to);
        report.startingAmount = round(cashBankNetAmount(startingTotals, cashBank));
        report.endingAmount = round(cashBankNetAmount(endingTotals, cashBank));
        report.netChange = round(report.endingAmount - report.startingAmount);
        return report;
    }

    /** Net cash & bank balance (debit - credit) restricted to the cash/bank account set. */
    private double cashBankNetAmount(Map<UUID, double[]> totals, Set<UUID> cashBank) {
        double sum = 0.0;
        for (Map.Entry<UUID, double[]> e : totals.entrySet()) {
            if (!cashBank.contains(e.getKey())) {
                continue;
            }
            sum += (e.getValue()[0] - e.getValue()[1]);
        }
        return round(sum);
    }

    // ─── General Ledger ───────────────────────────────────────────────────────

    public FinanceReport.GeneralLedgerReport generalLedger(Long from, Long to, UUID accountId) {
        FinanceReport.GeneralLedgerReport report = new FinanceReport.GeneralLedgerReport();
        report.from = from;
        report.to = to;

        Account headerAccount = accountId != null
                ? accountRepository.findById(accountId).orElse(null)
                : null;

        // Opening balance before the window (single-account drill-down only).
        double opening = 0;
        boolean debitNormal = false;
        if (headerAccount != null) {
            AccountType type = headerAccount.getAccountType();
            debitNormal = (type == AccountType.ASSET || type == AccountType.EXPENSE);
            if (from != null) {
                double[] prior = aggregateByAccount(null, from - 1)
                        .getOrDefault(accountId, new double[2]);
                double d = prior[0];
                double c = prior[1];
                opening = debitNormal ? (d - c) : (c - d);
            }
        }
        report.openingBalance = round(opening);

        double running = opening;
        Map<UUID, Account> accountsById = new HashMap<>();
        for (Account a : accountRepository.findAll()) {
            accountsById.put(a.getId(), a);
        }
        for (JournalEntry e : journalsInRange(from, to)) {
            if (accountId != null && !accountId.equals(e.getAccountId())) {
                continue;
            }
            Account account = e.getAccountId() != null
                    ? accountsById.get(e.getAccountId())
                    : null;
            boolean creditEntry = Boolean.TRUE.equals(e.getIsCredit());
            double amount = round(e.getAmount() != null ? e.getAmount() : 0.0);

            FinanceReport.LedgerRow row = new FinanceReport.LedgerRow();
            row.id = e.getId();
            row.date = e.getDate();
            row.createdAt = e.getCreatedAt();
            row.accountId = e.getAccountId();
            row.accountNumber = account != null ? account.getAccountNumber() : null;
            row.accountName = account != null ? account.getName() : "(deleted account)";
            row.accountType = account != null ? account.getAccountType().getCode() : null;
            row.description = e.getDescription();
            row.reference = e.getFtp();
            row.ftp = e.getFtp();
            row.credit = creditEntry;
            row.debit = creditEntry ? 0.0 : amount;
            row.creditAmount = creditEntry ? amount : 0.0;

            if (accountId != null && account != null) {
                // Single-account drill-down: accumulate on the account's normal side.
                boolean entryDebitNormal =
                        account.getAccountType() == AccountType.ASSET
                                || account.getAccountType() == AccountType.EXPENSE;
                running += entryDebitNormal
                        ? (creditEntry ? -amount : amount)
                        : (creditEntry ? amount : -amount);
            } else {
                // Full ledger: running balance is a simple cumulative (debit +, credit -),
                // so the last row equals the ending balance (ethiotrit-style).
                running += creditEntry ? -amount : amount;
            }
            row.runningBalance = round(running);

            report.entries.add(row);
            report.totalDebit += row.debit;
            report.totalCredit += row.creditAmount;
        }
        report.totalDebit = round(report.totalDebit);
        report.totalCredit = round(report.totalCredit);
        report.balance = round(report.totalDebit - report.totalCredit);
        return report;
    }

    // ─── Retained Earnings ────────────────────────────────────────────────────

    public FinanceReport.RetainedEarningsReport retainedEarnings(Long from, Long to) {
        FinanceReport.RetainedEarningsReport report = new FinanceReport.RetainedEarningsReport();
        report.from = from;
        report.to = to;

        // Opening retained earnings = net income accumulated before the window start.
        double opening = 0;
        if (from != null) {
            Map<UUID, double[]> priorTotals = aggregateByAccount(null, from - 1);
            for (Account account : accountsInOrder()) {
                double[] t = priorTotals.getOrDefault(account.getId(), new double[2]);
                if (account.getAccountType() == AccountType.REVENUE) {
                    opening += t[1] - t[0];
                } else if (account.getAccountType() == AccountType.EXPENSE) {
                    opening -= (t[0] - t[1]);
                }
            }
        }
        opening = round(opening);

        FinanceReport.IncomeStatementReport pnl = incomeStatement(from, to);
        double netIncome = pnl.netIncome;
        report.opening = opening;
        report.netIncome = netIncome;
        report.closing = round(opening + netIncome);

        // Roll-forward by calendar month.
        Map<Integer, Map<UUID, double[]>> perMonth = new LinkedHashMap<>();
        for (JournalEntry e : journalsInRange(from, to)) {
            if (e.getAccountId() == null || e.getDate() == null || e.getAmount() == null) {
                continue;
            }
            int bucket = yearMonth(e.getDate());
            Map<UUID, double[]> monthTotals = perMonth.computeIfAbsent(bucket, k -> new HashMap<>());
            double[] acc = monthTotals.computeIfAbsent(e.getAccountId(), k -> new double[2]);
            if (Boolean.TRUE.equals(e.getIsCredit())) {
                acc[1] += e.getAmount();
            } else {
                acc[0] += e.getAmount();
            }
        }

        Map<Integer, FinanceReport.RetainedEarningsPeriodRow> rowsByMonth = new TreeMap<>();
        for (Map.Entry<Integer, Map<UUID, double[]>> entry : perMonth.entrySet()) {
            int bucket = entry.getKey();
            Map<UUID, double[]> monthTotals = entry.getValue();
            double revenue = 0;
            double expenses = 0;
            FinanceReport.RetainedEarningsPeriodRow row = new FinanceReport.RetainedEarningsPeriodRow();
            row.label = monthLabel(bucket);
            row.from = monthStartMillis(bucket);
            row.to = monthEndMillis(bucket);
            for (Account account : accountsInOrder()) {
                double[] t = monthTotals.getOrDefault(account.getId(), new double[2]);
                AccountType type = account.getAccountType();
                if (type == AccountType.REVENUE) {
                    double net = t[1] - t[0];
                    revenue += net;
                    row.accounts.add(retainedAccountRow(account, 0.0, Math.max(net, 0.0), net));
                } else if (type == AccountType.EXPENSE) {
                    double net = t[0] - t[1];
                    expenses += net;
                    row.accounts.add(retainedAccountRow(account, Math.max(net, 0.0), 0.0, -net));
                }
            }
            row.revenue = round(revenue);
            row.expenses = round(expenses);
            row.netIncome = round(revenue - expenses);
            rowsByMonth.put(bucket, row);
        }
        report.periods = new ArrayList<>(rowsByMonth.values());
        return report;
    }

    // ─── Statement of Changes in Equity (ethiotrit-style) ─────────────────────
    //
    // Builds the 5-column / 7-row statement that mirrors ethiotrit's
    // StatementOfChangesInEquityComponent, computed from the SACCO journal
    // ledger. Share Capital comes from the configured share-purchase equity
    // account plus share_purchases; statutory reserve (if any) from equity
    // accounts whose names mention "reserve"; retained earnings = cumulative
    // net income net of reserve transfers; net surplus = period P&L.

    public FinanceReport.StatementOfChangesInEquityReport statementOfChangesInEquity(Long from, Long to) {
        FinanceReport.StatementOfChangesInEquityReport report = new FinanceReport.StatementOfChangesInEquityReport();
        report.from = from;
        report.to = to;

        UUID shareAccountId = settingUuid("share_purchase_account_id");
        Account shareAccount = shareAccountId != null ? accountRepository.findById(shareAccountId).orElse(null) : null;
        List<Account> reserveAccounts = reserveAccounts();

        report.shareAccountId = shareAccount != null ? shareAccount.getId() : null;
        report.shareAccountNumber = shareAccount != null ? shareAccount.getAccountNumber() : null;
        report.shareAccountName = shareAccount != null ? shareAccount.getName() : null;
        report.reserveAccountId = reserveAccounts.isEmpty() ? null : reserveAccounts.get(0).getId();
        report.reserveAccountNumber = reserveAccounts.isEmpty() ? null : reserveAccounts.get(0).getAccountNumber();
        report.reserveAccountName = reserveAccounts.isEmpty() ? null : reserveAccounts.get(0).getName();

        // Opening balances: everything accumulated before the window start.
        // With no `from` (all-time) there is no prior window, so opening is zero.
        Map<UUID, double[]> openingTotals = from != null
                ? aggregateByAccount(null, from - 1)
                : new HashMap<>();
        double openingShare = equityBalance(openingTotals, shareAccountId);
        double openingReserve = equityBalances(openingTotals, reserveAccounts);
        double priorNetIncome = netIncomeFromTotals(openingTotals);
        double openingRetained = round(priorNetIncome - openingReserve);

        // Period movements (journal-account based so it reconciles with the balance sheet).
        Map<UUID, double[]> periodTotals = aggregateByAccount(from, to);
        double[] shareT = shareAccountId != null
                ? periodTotals.getOrDefault(shareAccountId, new double[2])
                : new double[2];
        double shareCredits = round(shareT[1]); // additional share contributions
        double shareDebits = round(shareT[0]); // shares redeemed / withdrawn
        double netSurplus = incomeStatement(from, to).netIncome;
        double reserveTransfer = equityBalances(periodTotals, reserveAccounts);
        double dividends = 0;

        List<FinanceReport.EquityStatementRow> rows = report.rows;

        // 1. Opening balance
        rows.add(row("Balance as at " + balanceDate(from), openingShare, openingReserve, openingRetained,
                openingShare + openingReserve + openingRetained, null));

        // 2. Net surplus for the period
        rows.add(row("Net Surplus for the Period", 0.0, 0.0, netSurplus, netSurplus, "net_surplus"));

        // 3. Transfer to Statutory Reserve
        Double reserveCell = dashIfZero(reserveTransfer);
        Double retainedCell = dashIfZero(-reserveTransfer);
        rows.add(row("Transfer to Statutory Reserve", 0.0, reserveCell, retainedCell, 0.0,
                reserveAccounts.isEmpty() ? null : "statutory_reserve"));

        // 4. Additional share contributions
        rows.add(row("Additional Share Contributions", shareCredits, 0.0, 0.0, shareCredits,
                shareAccountId != null ? "share_capital" : null));

        // 5. Shares redeemed / withdrawn
        Double redeemedCell = dashIfZero(shareDebits);
        Double redeemedCellNeg = redeemedCell == null ? null : -redeemedCell;
        rows.add(row("Shares Redeemed/Withdrawn", redeemedCellNeg, 0.0, 0.0, redeemedCellNeg,
                shareAccountId != null ? "share_capital" : null));

        // 6. Dividends paid to members
        rows.add(row("Dividends Paid to Members", null, null, null, null, "dividends"));

        // 7. Closing balance
        double closingShare = round(openingShare + shareCredits - shareDebits);
        double closingReserve = round(openingReserve + reserveTransfer);
        double closingRetained = round(openingRetained + netSurplus - reserveTransfer - dividends);
        rows.add(row("Balance as at " + balanceDate(to), closingShare, closingReserve, closingRetained,
                closingShare + closingReserve + closingRetained, null));

        return report;
    }

    private FinanceReport.EquityStatementRow row(String description, Double share, Double reserve,
                                                 Double retained, Double total, String detail) {
        FinanceReport.EquityStatementRow r = new FinanceReport.EquityStatementRow();
        r.description = description;
        r.shareCapital = share;
        r.statutoryReserve = reserve;
        r.retainedEarnings = retained;
        r.totalEquity = total;
        r.detail = detail;
        return r;
    }

    private String balanceDate(Long millis) {
        LocalDate d = millis != null
                ? Instant.ofEpochMilli(millis).atZone(ZoneId.systemDefault()).toLocalDate()
                : LocalDate.now();
        return d.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH) + " " + d.getDayOfMonth() + ", "
                + d.getYear();
    }

    private Double dashIfZero(double value) {
        return round(value) == 0.0 ? null : round(value);
    }

    private List<Account> reserveAccounts() {
        List<Account> result = new ArrayList<>();
        for (Account a : accountRepository.findAll()) {
            if (a.getAccountType() == AccountType.EQUITY && a.getName() != null
                    && a.getName().toLowerCase(Locale.ROOT).contains("reserve")) {
                result.add(a);
            }
        }
        return result;
    }

    private double equityBalance(Map<UUID, double[]> totals, UUID accountId) {
        if (accountId == null) {
            return 0;
        }
        double[] t = totals.getOrDefault(accountId, new double[2]);
        return round(t[1] - t[0]);
    }

    private double equityBalances(Map<UUID, double[]> totals, List<Account> accounts) {
        double sum = 0;
        for (Account a : accounts) {
            sum += equityBalance(totals, a.getId());
        }
        return round(sum);
    }

    private double netIncomeFromTotals(Map<UUID, double[]> totals) {
        double revenue = 0;
        double expenses = 0;
        for (Account account : accountsInOrder()) {
            double[] t = totals.getOrDefault(account.getId(), new double[2]);
            AccountType type = account.getAccountType();
            if (type == AccountType.REVENUE) {
                revenue += t[1] - t[0];
            } else if (type == AccountType.EXPENSE) {
                expenses += t[0] - t[1];
            }
        }
        return round(revenue - expenses);
    }

    private double settingDouble(String key) {
        try {
            return settingRepository.findByKey(key)
                    .map(s -> Double.parseDouble(s.getValue()))
                    .orElse(0.0);
        } catch (Exception e) {
            return 0.0;
        }
    }

    private UUID settingUuid(String key) {
        try {
            return settingRepository.findByKey(key)
                    .map(s -> UUID.fromString(s.getValue()))
                    .orElse(null);
        } catch (Exception e) {
            return null;
        }
    }

    private FinanceReport.RetainedEarningsAccountRow retainedAccountRow(Account account, double debit,
                                                                       double credit, double amount) {
        FinanceReport.RetainedEarningsAccountRow r = new FinanceReport.RetainedEarningsAccountRow();
        r.accountId = account.getId();
        r.accountNumber = account.getAccountNumber();
        r.accountName = account.getName();
        r.accountType = account.getAccountType().getCode();
        r.debit = round(debit);
        r.credit = round(credit);
        r.amount = round(amount);
        return r;
    }

    private long monthStartMillis(int yyyyMM) {
        int year = yyyyMM / 100;
        int month = yyyyMM % 100;
        return LocalDate.of(year, month, 1)
                .atStartOfDay(ZoneId.systemDefault())
                .toInstant().toEpochMilli();
    }

    private long monthEndMillis(int yyyyMM) {
        int year = yyyyMM / 100;
        int month = yyyyMM % 100;
        return LocalDate.of(year, month, 1)
                .plusMonths(1)
                .atStartOfDay(ZoneId.systemDefault())
                .toInstant().toEpochMilli() - 1;
    }

    private int yearMonth(long epochMillis) {
        LocalDate d = Instant.ofEpochMilli(epochMillis)
                .atZone(ZoneId.systemDefault())
                .toLocalDate();
        return d.getYear() * 100 + d.getMonthValue();
    }

    private String monthLabel(int yyyyMM) {
        int year = yyyyMM / 100;
        int month = yyyyMM % 100;
        return Month.of(month).getDisplayName(TextStyle.SHORT, Locale.ENGLISH) + " " + year;
    }

    // ─── Finance Summary (hub) ────────────────────────────────────────────────

    public FinanceReport.SummaryReport summary(Long from, Long to) {
        FinanceReport.SummaryReport report = new FinanceReport.SummaryReport();
        report.from = from;
        report.to = to;

        FinanceReport.TrialBalanceReport tb = trialBalance(from, to);
        for (FinanceReport.TrialGroup group : tb.groups) {
            switch (group.name) {
                case "ASSET":
                    report.totalAssets = group.balance;
                    break;
                case "LIABILITY":
                    report.totalLiabilities = group.balance;
                    break;
                case "EQUITY":
                    report.totalEquity = group.balance;
                    break;
                default:
                    break;
            }
        }
        FinanceReport.IncomeStatementReport pnl = incomeStatement(from, to);
        report.totalRevenue = pnl.totalRevenue;
        report.totalExpenses = pnl.totalExpenses;
        report.netIncome = pnl.netIncome;

        report.netWorth = round(report.totalEquity + report.netIncome);
        report.cashAndBankBalance = cashAndBankBalance(from, to);
        report.savingsTotal = savingsTotal();
        report.loanPortfolio = loanPortfolio();
        report.activeLoans = activeLoanCount();
        report.totalAccounts = accountRepository.count();
        report.totalEntries = journalEntryRepository.count();

        report.totalAssets = round(report.totalAssets);
        report.totalLiabilities = round(report.totalLiabilities);
        report.totalEquity = round(report.totalEquity);
        return report;
    }

    private double cashAndBankBalance(Long from, Long to) {
        List<Account> cashAccounts = accountRepository.findByAccountCategory(AccountCategory.CASH_ACCOUNT);
        cashAccounts.addAll(accountRepository.findByAccountCategory(AccountCategory.BANK_ACCOUNT));
        Map<UUID, double[]> totals = aggregateByAccount(from, to);
        double balance = 0;
        for (Account account : cashAccounts) {
            double[] t = totals.getOrDefault(account.getId(), new double[2]);
            balance += t[0] - t[1];
        }
        return round(balance);
    }

    private double savingsTotal() {
        double total = 0;
        for (Saving saving : savingRepository.findAll()) {
            if (saving.getSavingAmount() != null) {
                total += saving.getSavingAmount();
            }
        }
        return round(total);
    }

    private double loanPortfolio() {
        double total = 0;
        for (Loan loan : loanRepository.findAll()) {
            if (Boolean.TRUE.equals(loan.getIsDisbursed())
                    && loan.getApprovedAmount() != null) {
                total += loan.getApprovedAmount().doubleValue();
            }
        }
        return round(total);
    }

    private long activeLoanCount() {
        long count = 0;
        for (Loan loan : loanRepository.findAll()) {
            if ("ACTIVE".equals(loan.getStatus())) {
                count++;
            }
        }
        return count;
    }

    // ─── Ethiotrit-style Finance Report (Monthly & Weekly) ────────────────────
    //
    // Reproduces ethiotrit's finance report structure exactly. The monthly report
    // returns `monthlyData` (12 rows), plus per-account `incomeAccounts` /
    // `expenseAccounts`; the weekly report returns `weeklyData` (one row per ISO
    // week of the year, W1..W53) plus weekly income/expense account rows. Field
    // names mirror ethiotrit so the frontend can be a near drop-in.

    private boolean isVoluntaryType(String name) {
        return name != null && name.toLowerCase(Locale.ROOT).contains("voluntary");
    }

    /** Earliest positive collection date per member for a given type bucket. */
    private Map<UUID, Long> firstSavingDate(boolean voluntary) {
        Map<UUID, Long> first = new HashMap<>();
        for (Saving s : savingRepository.findAll()) {
            if (s.getSavingAmount() == null || s.getSavingAmount() <= 0
                    || s.getSavingDate() == null) {
                continue;
            }
            if (SavingStatus.REJECTED.equals(s.getStatus())) {
                continue;
            }
            if (s.getWithdrawalId() != null || s.getTransferId() != null) {
                continue;
            }
            SavingType type = typeById(s.getSavingType());
            if (type == null) {
                continue;
            }
            if (isVoluntaryType(type.getName()) != voluntary) {
                continue;
            }
            first.merge(s.getMemberId(), s.getSavingDate(), Long::min);
        }
        return first;
    }

    private Map<UUID, Long> firstShareDate() {
        Map<UUID, Long> first = new HashMap<>();
        for (SharePurchase p : sharePurchaseRepository.findAll()) {
            if (p.getPurchaseDate() == null || p.getTotalAmount() == null
                    || p.getTotalAmount() <= 0 || !ShareStatus.resolve(p.getStatus()).postsToLedger()) {
                continue;
            }
            first.merge(p.getMemberId(), p.getPurchaseDate(), Long::min);
        }
        return first;
    }

    private SavingType typeById(UUID id) {
        if (id == null) {
            return null;
        }
        return savingTypeRepository.findById(id).orElse(null);
    }

    private Map<UUID, Member> memberById() {
        Map<UUID, Member> map = new HashMap<>();
        for (Member m : memberRepository.findAll()) {
            map.put(m.getId(), m);
        }
        return map;
    }

    private String memberName(Map<UUID, Member> members, UUID id) {
        Member m = members.get(id);
        if (m == null) {
            return "";
        }
        if (m.getFullName() != null && !m.getFullName().isBlank()) {
            return m.getFullName();
        }
        return m.getIdNumbe() != null ? m.getIdNumbe() : "";
    }

    private String memberNumber(Map<UUID, Member> members, UUID id) {
        Member m = members.get(id);
        return m != null && m.getIdNumbe() != null ? m.getIdNumbe() : "";
    }

    /** Computes all finance aggregates for one period window. */
    private void accumulateRow(FinanceReport.FinancePeriodRow row,
                               long from, long to,
                               Map<UUID, Long> firstCompulsory,
                               Map<UUID, Long> firstVoluntary,
                               Map<UUID, Long> firstShare,
                               Map<UUID, Member> members) {
        // Collections (positive deposits, not withdrawal/transfer mirror rows)
        for (Saving s : savingRepository.findAll()) {
            if (s.getSavingAmount() == null || s.getSavingAmount() <= 0
                    || s.getSavingDate() == null) {
                continue;
            }
            if (SavingStatus.REJECTED.equals(s.getStatus())) {
                continue;
            }
            if (s.getWithdrawalId() != null || s.getTransferId() != null) {
                continue;
            }
            long d = s.getSavingDate();
            if (d < from || d > to) {
                continue;
            }
            SavingType type = typeById(s.getSavingType());
            if (type == null) {
                continue;
            }
            double amt = s.getSavingAmount();
            if (isVoluntaryType(type.getName())) {
                Long first = firstVoluntary.get(s.getMemberId());
                if (first != null && d == first) {
                    row.new_voluntary += amt;
                } else {
                    row.old_voluntary += amt;
                }
                row.total_voluntary += amt;
            } else {
                Long first = firstCompulsory.get(s.getMemberId());
                if (first != null && d == first) {
                    row.new_compulsory += amt;
                } else {
                    row.old_compulsory += amt;
                }
                row.total_compulsory += amt;
            }
        }

        // Shares (new = member's first purchase, else old)
        for (SharePurchase p : sharePurchaseRepository.findAll()) {
            if (p.getPurchaseDate() == null || p.getTotalAmount() == null
                    || p.getTotalAmount() <= 0 || !ShareStatus.resolve(p.getStatus()).postsToLedger()) {
                continue;
            }
            long d = p.getPurchaseDate();
            if (d < from || d > to) {
                continue;
            }
            double amt = p.getTotalAmount();
            Long first = firstShare.get(p.getMemberId());
            if (first != null && d == first) {
                row.new_share += amt;
            } else {
                row.old_share += amt;
            }
            row.total_share += amt;
        }

        // Withdrawals (only posted/disbursed affect finance)
        for (Withdrawal w : withdrawalRepository.findAll()) {
            if (w.getAmount() == null || w.getDate() == null) {
                continue;
            }
            if (w.getDate() < from || w.getDate() > to) {
                continue;
            }
            if (!WithdrawalStatus.resolve(w.getStatus()).postsToLedger()) {
                continue;
            }
            double amt = w.getAmount();
            SavingType type = typeById(w.getSavingTypeId());
            if (type != null && isVoluntaryType(type.getName())) {
                row.withdrawal_voluntary += amt;
            } else {
                row.withdrawal_mandatory += amt;
            }
            row.withdrawal_total += amt;
        }

        // Transfers (voluntary<->mandatory; SACCO has no share saving type)
        for (Transfer t : transferRepository.findAll()) {
            if (!TransferStatus.resolve(t.getStatus()).postsToLedger()) continue;
            if (t.getAmount() == null || t.getDate() == null) {
                continue;
            }
            long d = t.getDate();
            if (d < from || d > to) {
                continue;
            }
            double amt = t.getAmount();
            SavingType src = typeById(t.getSourceSavingTypeId());
            SavingType dst = typeById(t.getDestinationSavingTypeId());
            boolean srcVol = src != null && isVoluntaryType(src.getName());
            boolean dstVol = dst != null && isVoluntaryType(dst.getName());
            if (srcVol && !dstVol) {
                row.transfer_voluntary_to_mandatory += amt;
            } else if (srcVol && dstVol) {
                row.transfer_voluntary_to_voluntary += amt;
            } else if (srcVol) {
                row.transfer_voluntary_to_share += amt;
            } else if (!srcVol && !dstVol) {
                row.transfer_share_to_share += amt;
            }
        }

        // Loan disbursements
        for (Loan loan : loanRepository.findAll()) {
            if (Boolean.TRUE.equals(loan.getIsDisbursed())
                    && loan.getApprovedAmount() != null
                    && loan.getDisbursementDate() != null) {
                long d = loan.getDisbursementDate();
                if (d >= from && d <= to) {
                    row.disbursement_total += loan.getApprovedAmount().doubleValue();
                }
            }
        }

        // Income & expense (revenue credit-debit, expense debit-credit)
        for (JournalEntry e : journalsInRange(from, to)) {
            if (e.getAccountId() == null || e.getAmount() == null) {
                continue;
            }
            Account acct = accountRepository.findById(e.getAccountId()).orElse(null);
            if (acct == null) {
                continue;
            }
            double amount = e.getAmount();
            if (acct.getAccountType() == AccountType.REVENUE) {
                row.income_total += Boolean.TRUE.equals(e.getIsCredit()) ? amount : -amount;
            } else if (acct.getAccountType() == AccountType.EXPENSE) {
                row.expense_total += Boolean.TRUE.equals(e.getIsCredit()) ? -amount : amount;
            }
        }

        roundRow(row);
    }

    private void roundRow(FinanceReport.FinancePeriodRow row) {
        row.transfer_total = row.transfer_voluntary_to_mandatory
                + row.transfer_voluntary_to_voluntary
                + row.transfer_voluntary_to_share
                + row.transfer_share_to_share;
        row.new_compulsory = round(row.new_compulsory);
        row.old_compulsory = round(row.old_compulsory);
        row.total_compulsory = round(row.total_compulsory);
        row.new_voluntary = round(row.new_voluntary);
        row.old_voluntary = round(row.old_voluntary);
        row.total_voluntary = round(row.total_voluntary);
        row.new_share = round(row.new_share);
        row.old_share = round(row.old_share);
        row.total_share = round(row.total_share);
        row.transfer_voluntary_to_mandatory = round(row.transfer_voluntary_to_mandatory);
        row.transfer_voluntary_to_voluntary = round(row.transfer_voluntary_to_voluntary);
        row.transfer_voluntary_to_share = round(row.transfer_voluntary_to_share);
        row.transfer_share_to_share = round(row.transfer_share_to_share);
        row.transfer_total = round(row.transfer_total);
        row.withdrawal_mandatory = round(row.withdrawal_mandatory);
        row.withdrawal_voluntary = round(row.withdrawal_voluntary);
        row.withdrawal_total = round(row.withdrawal_total);
        row.disbursement_total = round(row.disbursement_total);
        row.income_total = round(row.income_total);
        row.expense_total = round(row.expense_total);
    }

    /**
     * Returns the underlying transactions that make up a single finance report
     * cell. `category` is a report row key (e.g. `new_compulsory`,
     * `income_account`, `transfer_voluntary_to_mandatory`, ...); `accountName`
     * further narrows income/expense account rows. Rows are scoped to the given
     * [from, to] window (the clicked month or week).
     */
    public FinanceReport.ReportDetail periodDetail(long from, long to,
                                                   String category, String accountName) {
        FinanceReport.ReportDetail detail = new FinanceReport.ReportDetail();
        Map<UUID, Member> members = memberById();
        boolean inc = "income_account".equals(category) || "income_total".equals(category);
        boolean exp = "expense_account".equals(category) || "expense_total".equals(category);

        if (inc || exp) {
            detail.title = inc ? "Income" : "Expense";
            if (accountName != null && !accountName.isBlank()) {
                detail.title += " \u2013 " + accountName;
            }
            for (JournalEntry e : journalsInRange(from, to)) {
                if (e.getAccountId() == null || e.getAmount() == null) {
                    continue;
                }
                Account acct = accountRepository.findById(e.getAccountId()).orElse(null);
                if (acct == null) {
                    continue;
                }
                boolean isIncome = acct.getAccountType() == AccountType.REVENUE;
                boolean isExpense = acct.getAccountType() == AccountType.EXPENSE;
                if (inc && !isIncome) {
                    continue;
                }
                if (exp && !isExpense) {
                    continue;
                }
                String name = acct.getName();
                if (accountName != null && !accountName.isBlank() && !accountName.equals(name)) {
                    continue;
                }
                double amount = e.getAmount();
                FinanceReport.ReportDetailRow r = new FinanceReport.ReportDetailRow();
                r.date = e.getDate();
                r.memberName = "";
                r.memberId = "";
                r.accountName = name;
                r.description = e.getDescription();
                r.reference = e.getFtp();
                if (isIncome) {
                    r.amount = round(Boolean.TRUE.equals(e.getIsCredit()) ? amount : -amount);
                } else {
                    r.amount = round(Boolean.TRUE.equals(e.getIsCredit()) ? -amount : amount);
                }
                detail.rows.add(r);
            }
        } else if ("new_compulsory".equals(category) || "old_compulsory".equals(category)
                || "total_compulsory".equals(category)) {
            detail.title = "Compulsory Saving";
            Map<UUID, Long> first = firstSavingDate(false);
            for (Saving s : savingRepository.findAll()) {
                if (s.getSavingAmount() == null || s.getSavingAmount() <= 0
                        || s.getSavingDate() == null) {
                    continue;
                }
                if (SavingStatus.REJECTED.equals(s.getStatus())
                        || s.getWithdrawalId() != null || s.getTransferId() != null) {
                    continue;
                }
                if (s.getSavingDate() < from || s.getSavingDate() > to) {
                    continue;
                }
                SavingType type = typeById(s.getSavingType());
                if (type == null || isVoluntaryType(type.getName())) {
                    continue;
                }
                Long f = first.get(s.getMemberId());
                if ("total_compulsory".equals(category)
                        || ("new_compulsory".equals(category) && f != null && s.getSavingDate() == f)
                        || ("old_compulsory".equals(category) && (f == null || s.getSavingDate() != f))) {
                    detail.rows.add(mkSavingRow(members, s, type));
                }
            }
        } else if ("new_voluntary".equals(category) || "old_voluntary".equals(category)
                || "total_voluntary".equals(category)) {
            detail.title = "Voluntary Saving";
            Map<UUID, Long> first = firstSavingDate(true);
            for (Saving s : savingRepository.findAll()) {
                if (s.getSavingAmount() == null || s.getSavingAmount() <= 0
                        || s.getSavingDate() == null) {
                    continue;
                }
                if (SavingStatus.REJECTED.equals(s.getStatus())
                        || s.getWithdrawalId() != null || s.getTransferId() != null) {
                    continue;
                }
                if (s.getSavingDate() < from || s.getSavingDate() > to) {
                    continue;
                }
                SavingType type = typeById(s.getSavingType());
                if (type == null || !isVoluntaryType(type.getName())) {
                    continue;
                }
                Long f = first.get(s.getMemberId());
                if ("total_voluntary".equals(category)
                        || ("new_voluntary".equals(category) && f != null && s.getSavingDate() == f)
                        || ("old_voluntary".equals(category) && (f == null || s.getSavingDate() != f))) {
                    detail.rows.add(mkSavingRow(members, s, type));
                }
            }
        } else if ("new_share".equals(category) || "old_share".equals(category)
                || "total_share".equals(category)) {
            detail.title = "Share Sold";
            Map<UUID, Long> first = firstShareDate();
            for (SharePurchase p : sharePurchaseRepository.findAll()) {
                if (p.getPurchaseDate() == null || p.getTotalAmount() == null
                        || p.getTotalAmount() <= 0 || !ShareStatus.resolve(p.getStatus()).postsToLedger()) {
                    continue;
                }
                if (p.getPurchaseDate() < from || p.getPurchaseDate() > to) {
                    continue;
                }
                Long f = first.get(p.getMemberId());
                if ("total_share".equals(category)
                        || ("new_share".equals(category) && f != null && p.getPurchaseDate() == f)
                        || ("old_share".equals(category) && (f == null || p.getPurchaseDate() != f))) {
                    FinanceReport.ReportDetailRow r = new FinanceReport.ReportDetailRow();
                    r.date = p.getPurchaseDate();
                    r.memberName = memberName(members, p.getMemberId());
                    r.memberId = p.getMemberId() != null ? p.getMemberId().toString() : "";
                    r.description = "Share Purchase";
                    r.reference = p.getTransactionReference();
                    r.amount = round(p.getTotalAmount());
                    detail.rows.add(r);
                }
            }
        } else if ("withdrawal_mandatory".equals(category)
                || "withdrawal_voluntary".equals(category)
                || "withdrawal_total".equals(category)) {
            detail.title = "Saving Withdrawal";
            boolean vol = "withdrawal_voluntary".equals(category);
            boolean mad = "withdrawal_mandatory".equals(category);
            for (Withdrawal w : withdrawalRepository.findAll()) {
                if (w.getAmount() == null || w.getDate() == null || w.getDate() < from
                        || w.getDate() > to) {
                    continue;
                }
                if (!WithdrawalStatus.resolve(w.getStatus()).postsToLedger()) {
                    continue;
                }
                boolean isVol = false;
                SavingType type = typeById(w.getSavingTypeId());
                if (type != null && isVoluntaryType(type.getName())) {
                    isVol = true;
                }
                if ("withdrawal_total".equals(category)
                        || (vol && isVol) || (mad && !isVol)) {
                    FinanceReport.ReportDetailRow r = new FinanceReport.ReportDetailRow();
                    r.date = w.getDate();
                    r.memberName = memberName(members, w.getMemberId());
                    r.memberId = w.getMemberId() != null ? w.getMemberId().toString() : "";
                    r.description = type != null ? type.getName() : "Withdrawal";
                    r.reference = w.getFtp();
                    r.amount = round(w.getAmount());
                    detail.rows.add(r);
                }
            }
        } else if ("disbursement_total".equals(category)) {
            detail.title = "Loan Disbursement";
            for (Loan loan : loanRepository.findAll()) {
                if (!Boolean.TRUE.equals(loan.getIsDisbursed())
                        || loan.getApprovedAmount() == null
                        || loan.getDisbursementDate() == null) {
                    continue;
                }
                long d = loan.getDisbursementDate();
                if (d < from || d > to) {
                    continue;
                }
                FinanceReport.ReportDetailRow r = new FinanceReport.ReportDetailRow();
                r.date = d;
                r.memberName = memberName(members, loan.getMemberId());
                r.memberId = loan.getMemberId() != null ? loan.getMemberId().toString() : "";
                r.description = "Disbursement";
                r.reference = loan.getStatus();
                r.amount = round(loan.getApprovedAmount().doubleValue());
                detail.rows.add(r);
            }
        } else if (category != null && category.startsWith("transfer_")) {
            detail.title = "Saving Transfer";
            for (Transfer t : transferRepository.findAll()) {
                if (!TransferStatus.resolve(t.getStatus()).postsToLedger()) continue;
                if (t.getAmount() == null || t.getDate() == null || t.getDate() < from
                        || t.getDate() > to) {
                    continue;
                }
                SavingType src = typeById(t.getSourceSavingTypeId());
                SavingType dst = typeById(t.getDestinationSavingTypeId());
                boolean srcVol = src != null && isVoluntaryType(src.getName());
                boolean dstVol = dst != null && isVoluntaryType(dst.getName());
                boolean match;
                if ("transfer_voluntary_to_mandatory".equals(category)) {
                    match = srcVol && !dstVol;
                } else if ("transfer_voluntary_to_voluntary".equals(category)) {
                    match = srcVol && dstVol;
                } else if ("transfer_share_to_share".equals(category)) {
                    match = !srcVol && !dstVol;
                } else if ("transfer_voluntary_to_share".equals(category)) {
                    match = srcVol && dst == null;
                } else {
                    match = true; // transfer_total
                }
                if (!match) {
                    continue;
                }
                FinanceReport.ReportDetailRow r = new FinanceReport.ReportDetailRow();
                r.date = t.getDate();
                r.memberName = memberName(members, t.getSourceMemberId() != null
                        ? t.getSourceMemberId() : t.getDestinationMemberId());
                r.memberId = t.getSourceMemberId() != null
                        ? t.getSourceMemberId().toString() : t.getDestinationMemberId().toString();
                r.description = (src != null ? src.getName() : "Share")
                        + " \u2192 " + (dst != null ? dst.getName() : "Share");
                r.reference = t.getFtp();
                r.amount = round(t.getAmount());
                detail.rows.add(r);
            }
        } else {
            detail.title = category != null ? category : "Detail";
        }

        detail.rows.sort(Comparator.comparing(r -> r.date, Comparator.nullsLast(Long::compareTo)));
        double total = 0;
        for (FinanceReport.ReportDetailRow r : detail.rows) {
            total += r.amount;
        }
        detail.total = round(total);
        return detail;
    }

    private FinanceReport.ReportDetailRow mkSavingRow(Map<UUID, Member> members,
                                                      Saving s, SavingType type) {
        FinanceReport.ReportDetailRow r = new FinanceReport.ReportDetailRow();
        r.date = s.getSavingDate();
        r.memberName = memberName(members, s.getMemberId());
        r.memberId = s.getMemberId() != null ? s.getMemberId().toString() : "";
        r.description = type != null ? type.getName() : "Saving";
        r.reference = s.getFtp();
        r.amount = round(s.getSavingAmount());
        return r;
    }

    /**
     * Savings report for an arbitrary date window. Reconciles the savings records
     * against the finance (journal) system:
     * <ul>
     *   <li>{@code byMember} – one row per (member, saving type) covering all
     *       non-rejected collections in the window.</li>
     *   <li>{@code transactions} – a flat register of POSTED transactions, the
     *       ledger-confirmed subset.</li>
     *   <li>{@code types} – per saving type, POSTED collections vs the credit
     *       journal entries posted to that type's ledger account. A
     *       {@code difference} of ~0 proves the records match the finance system.</li>
     * </ul>
     */
    public FinanceReport.SavingsReport savingsReport(Long from, Long to) {
        FinanceReport.SavingsReport report = new FinanceReport.SavingsReport();
        report.from = from;
        report.to = to;
        long lo = from != null ? from : Long.MIN_VALUE;
        long hi = to != null ? to : Long.MAX_VALUE;
        Map<UUID, Member> members = memberById();
        Map<UUID, SavingType> types = new HashMap<>();
        for (SavingType t : savingTypeRepository.findAll()) {
            types.put(t.getId(), t);
        }
        Map<UUID, String> accountNames = new HashMap<>();
        for (Account a : accountRepository.findAll()) {
            if (a.getId() != null && a.getName() != null) {
                accountNames.put(a.getId(), a.getName());
            }
        }

        Map<UUID, Double> creditPerTarget = new HashMap<>();
        for (JournalEntry e : journalEntryRepository.findAll()) {
            if (e.getTargetId() == null || e.getAmount() == null || !Boolean.TRUE.equals(e.getIsCredit())) {
                continue;
            }
            creditPerTarget.merge(e.getTargetId(), e.getAmount(), Double::sum);
        }

        List<FinanceReport.SavingsTransactionRow> transactions = new ArrayList<>();
        Map<String, FinanceReport.SavingsMemberRow> grouped = new LinkedHashMap<>();
        Map<UUID, Double> postedPerType = new HashMap<>();
        Map<UUID, Double> ledgerPerType = new HashMap<>();
        Map<UUID, Long> countPerType = new HashMap<>();
        Map<UUID, Double> totalPerType = new HashMap<>();
        Map<UUID, Set<UUID>> membersPerType = new HashMap<>();

        for (Saving s : savingRepository.findAll()) {
            if (s.getSavingAmount() == null || s.getSavingAmount() <= 0 || s.getSavingDate() == null) {
                continue;
            }
            if (SavingStatus.REJECTED.equals(s.getStatus())
                    || s.getWithdrawalId() != null || s.getTransferId() != null) {
                continue;
            }
            if (s.getSavingDate() < lo || s.getSavingDate() > hi) {
                continue;
            }
            SavingType type = types.get(s.getSavingType());
            if (type == null) {
                continue;
            }
            boolean mandatory = type.getIsMandatory();
            double amount = round(s.getSavingAmount());
            boolean posted = SavingStatus.POSTED.equals(s.getStatus());

            // per-type rollups
            countPerType.merge(type.getId(), 1L, Long::sum);
            totalPerType.merge(type.getId(), amount, Double::sum);
            membersPerType.computeIfAbsent(type.getId(), k -> new HashSet<>()).add(s.getMemberId());
            if (posted) {
                postedPerType.merge(type.getId(), amount, Double::sum);
                double credit = creditPerTarget.getOrDefault(s.getId(), 0.0);
                ledgerPerType.merge(type.getId(), credit, Double::sum);
                report.grandTotal = round(report.grandTotal + amount);
                report.ledgerTotal = round(report.ledgerTotal + credit);
            } else {
                report.pendingTotal = round(report.pendingTotal + amount);
            }

            // per-(member, type) aggregation
            String key = s.getMemberId() + "|" + type.getId();
            FinanceReport.SavingsMemberRow row = grouped.get(key);
            if (row == null) {
                row = new FinanceReport.SavingsMemberRow();
                row.memberId = s.getMemberId();
                row.memberName = memberName(members, s.getMemberId());
                row.memberNumber = memberNumber(members, s.getMemberId());
                row.savingTypeId = type.getId();
                row.savingTypeName = type.getName();
                row.mandatory = mandatory;
                grouped.put(key, row);
            }
            row.count++;
            row.amount = round(row.amount + amount);
            if (posted) {
                row.postedAmount = round(row.postedAmount + amount);
            }

            // flat register (POSTED only – the ledger-confirmed transactions)
            if (posted) {
                FinanceReport.SavingsTransactionRow tx = new FinanceReport.SavingsTransactionRow();
                tx.id = s.getId();
                tx.date = s.getSavingDate();
                tx.memberId = s.getMemberId();
                tx.memberName = memberName(members, s.getMemberId());
                tx.memberNumber = memberNumber(members, s.getMemberId());
                tx.savingTypeId = type.getId();
                tx.savingTypeName = type.getName();
                tx.mandatory = mandatory;
                tx.ftp = s.getFtp();
                tx.accountName = accountNames.get(s.getAccountId());
                tx.amount = amount;
                tx.status = s.getStatus().name();
                transactions.add(tx);
            }
        }

        report.byMember = new ArrayList<>(grouped.values());
        report.byMember.sort(Comparator.comparing((FinanceReport.SavingsMemberRow r) -> r.memberName,
                        Comparator.nullsLast(String::compareTo))
                .thenComparing(r -> r.savingTypeName, Comparator.nullsLast(String::compareTo)));

        report.transactions = transactions;
        report.transactions.sort(Comparator
                .comparingLong((FinanceReport.SavingsTransactionRow r) -> r.date != null ? r.date : 0L)
                .thenComparing(r -> r.memberName, Comparator.nullsLast(String::compareTo)));
        report.transactionCount = report.transactions.size();

        for (SavingType type : types.values()) {
            UUID id = type.getId();
            double posted = round(postedPerType.getOrDefault(id, 0.0));
            double ledger = round(ledgerPerType.getOrDefault(id, 0.0));
            if (countPerType.getOrDefault(id, 0L) == 0 && posted == 0 && ledger == 0) {
                continue; // only report types that actually moved money in the window
            }
            FinanceReport.SavingsTypeBreakdown b = new FinanceReport.SavingsTypeBreakdown();
            b.savingTypeId = id;
            b.name = type.getName();
            b.mandatory = type.getIsMandatory();
            b.memberCount = membersPerType.getOrDefault(id, Set.of()).size();
            b.count = countPerType.getOrDefault(id, 0L);
            b.totalAmount = round(totalPerType.getOrDefault(id, 0.0));
            b.postedAmount = posted;
            b.ledgerCredits = ledger;
            b.difference = round(posted - ledger);
            report.types.add(b);
        }
        report.types.sort(Comparator.comparing((FinanceReport.SavingsTypeBreakdown b) -> b.name,
                Comparator.nullsLast(String::compareTo)));

        report.grandTotal = round(report.grandTotal);
        report.pendingTotal = round(report.pendingTotal);
        report.ledgerTotal = round(report.ledgerTotal);
        report.difference = round(report.grandTotal - report.ledgerTotal);
        return report;
    }

    public FinanceReport.WithdrawalReport withdrawalReport(Long from, Long to) {
        FinanceReport.WithdrawalReport report = new FinanceReport.WithdrawalReport();
        report.from = from;
        report.to = to;
        long lo = from != null ? from : Long.MIN_VALUE;
        long hi = to != null ? to : Long.MAX_VALUE;
        Map<UUID, Member> members = memberById();
        Map<UUID, SavingType> types = new HashMap<>();
        for (SavingType t : savingTypeRepository.findAll()) {
            types.put(t.getId(), t);
        }
        Map<UUID, String> accountNames = new HashMap<>();
        for (Account a : accountRepository.findAll()) {
            if (a.getId() != null && a.getName() != null) {
                accountNames.put(a.getId(), a.getName());
            }
        }

        Map<UUID, Double> debitPerTarget = new HashMap<>();
        for (JournalEntry e : journalEntryRepository.findAll()) {
            if (e.getTargetId() == null || e.getAmount() == null || Boolean.TRUE.equals(e.getIsCredit())) {
                continue;
            }
            debitPerTarget.merge(e.getTargetId(), e.getAmount(), Double::sum);
        }

        List<FinanceReport.WithdrawalTransactionRow> transactions = new ArrayList<>();
        Map<String, FinanceReport.WithdrawalMemberRow> grouped = new LinkedHashMap<>();
        Map<UUID, Double> postedPerType = new HashMap<>();
        Map<UUID, Double> ledgerPerType = new HashMap<>();
        Map<UUID, Long> countPerType = new HashMap<>();
        Map<UUID, Double> totalPerType = new HashMap<>();
        Map<UUID, Set<UUID>> membersPerType = new HashMap<>();

        for (Withdrawal w : withdrawalRepository.findAll()) {
            if (w.getAmount() == null || w.getAmount() <= 0 || w.getDate() == null) {
                continue;
            }
            if (WithdrawalStatus.REJECTED.equals(w.getStatus())) {
                continue;
            }
            if (w.getDate() < lo || w.getDate() > hi) {
                continue;
            }
            SavingType type = types.get(w.getSavingTypeId());
            if (type == null) {
                continue;
            }
            boolean mandatory = type.getIsMandatory();
            double amount = round(w.getAmount());
            WithdrawalStatus wStatus = WithdrawalStatus.resolve(w.getStatus());
            boolean posted = wStatus.postsToLedger();

            countPerType.merge(type.getId(), 1L, Long::sum);
            totalPerType.merge(type.getId(), amount, Double::sum);
            membersPerType.computeIfAbsent(type.getId(), k -> new HashSet<>()).add(w.getMemberId());
            if (posted) {
                postedPerType.merge(type.getId(), amount, Double::sum);
                double debit = debitPerTarget.getOrDefault(w.getId(), 0.0);
                ledgerPerType.merge(type.getId(), debit, Double::sum);
                report.grandTotal = round(report.grandTotal + amount);
                report.ledgerTotal = round(report.ledgerTotal + debit);
            } else {
                report.pendingTotal = round(report.pendingTotal + amount);
            }

            String key = w.getMemberId() + "|" + type.getId();
            FinanceReport.WithdrawalMemberRow row = grouped.get(key);
            if (row == null) {
                row = new FinanceReport.WithdrawalMemberRow();
                row.memberId = w.getMemberId();
                row.memberName = memberName(members, w.getMemberId());
                row.memberNumber = memberNumber(members, w.getMemberId());
                row.savingTypeId = type.getId();
                row.savingTypeName = type.getName();
                row.mandatory = mandatory;
                grouped.put(key, row);
            }
            row.count++;
            row.amount = round(row.amount + amount);
            if (posted) {
                row.postedAmount = round(row.postedAmount + amount);
            }

            if (posted) {
                FinanceReport.WithdrawalTransactionRow tx = new FinanceReport.WithdrawalTransactionRow();
                tx.id = w.getId();
                tx.date = w.getDate();
                tx.memberId = w.getMemberId();
                tx.memberName = memberName(members, w.getMemberId());
                tx.memberNumber = memberNumber(members, w.getMemberId());
                tx.savingTypeId = type.getId();
                tx.savingTypeName = type.getName();
                tx.mandatory = mandatory;
                tx.ftp = w.getFtp();
                tx.bankName = accountNames.get(w.getBankId());
                tx.amount = amount;
                tx.status = w.getStatus().name();
                transactions.add(tx);
            }
        }

        report.byMember = new ArrayList<>(grouped.values());
        report.byMember.sort(Comparator.comparing((FinanceReport.WithdrawalMemberRow r) -> r.memberName,
                        Comparator.nullsLast(String::compareTo))
                .thenComparing(r -> r.savingTypeName, Comparator.nullsLast(String::compareTo)));

        report.transactions = transactions;
        report.transactions.sort(Comparator
                .comparingLong((FinanceReport.WithdrawalTransactionRow r) -> r.date != null ? r.date : 0L)
                .thenComparing(r -> r.memberName, Comparator.nullsLast(String::compareTo)));
        report.transactionCount = report.transactions.size();

        for (SavingType type : types.values()) {
            UUID id = type.getId();
            double posted = round(postedPerType.getOrDefault(id, 0.0));
            double ledger = round(ledgerPerType.getOrDefault(id, 0.0));
            if (countPerType.getOrDefault(id, 0L) == 0 && posted == 0 && ledger == 0) {
                continue;
            }
            FinanceReport.WithdrawalTypeBreakdown b = new FinanceReport.WithdrawalTypeBreakdown();
            b.savingTypeId = id;
            b.name = type.getName();
            b.mandatory = type.getIsMandatory();
            b.memberCount = membersPerType.getOrDefault(id, Set.of()).size();
            b.count = countPerType.getOrDefault(id, 0L);
            b.totalAmount = round(totalPerType.getOrDefault(id, 0.0));
            b.postedAmount = posted;
            b.ledgerDebits = ledger;
            b.difference = round(posted - ledger);
            report.types.add(b);
        }
        report.types.sort(Comparator.comparing((FinanceReport.WithdrawalTypeBreakdown b) -> b.name,
                Comparator.nullsLast(String::compareTo)));

        report.grandTotal = round(report.grandTotal);
        report.pendingTotal = round(report.pendingTotal);
        report.ledgerTotal = round(report.ledgerTotal);
        report.difference = round(report.grandTotal - report.ledgerTotal);
        return report;
    }

    private void addTransferMemberRow(Map<UUID, FinanceReport.TransferMemberRow> grouped,
                                  Map<UUID, Member> members, UUID memberId,
                                  boolean isSource, double amount) {
    FinanceReport.TransferMemberRow row = grouped.computeIfAbsent(memberId, id -> {
        FinanceReport.TransferMemberRow r = new FinanceReport.TransferMemberRow();
        r.memberId = id;
        r.memberName = memberName(members, id);
        r.memberNumber = memberNumber(members, id);
        return r;
    });
    if (isSource) {
        row.sourceCount++;
        row.sourceAmount = round(row.sourceAmount + amount);
    } else {
        row.destinationCount++;
        row.destinationAmount = round(row.destinationAmount + amount);
    }
}

    public FinanceReport.TransferReport transferReport(Long from, Long to) {
        FinanceReport.TransferReport report = new FinanceReport.TransferReport();
        report.from = from;
        report.to = to;
        long lo = from != null ? from : Long.MIN_VALUE;
        long hi = to != null ? to : Long.MAX_VALUE;
        Map<UUID, Member> members = memberById();
        Map<UUID, SavingType> types = new HashMap<>();
        for (SavingType t : savingTypeRepository.findAll()) {
            types.put(t.getId(), t);
        }

        Map<UUID, Double> debitPerTarget = new HashMap<>();
        Map<UUID, Double> creditPerTarget = new HashMap<>();
        for (JournalEntry e : journalEntryRepository.findAll()) {
            if (e.getTargetId() == null || e.getAmount() == null) {
                continue;
            }
            if (Boolean.TRUE.equals(e.getIsCredit())) {
                creditPerTarget.merge(e.getTargetId(), e.getAmount(), Double::sum);
            } else {
                debitPerTarget.merge(e.getTargetId(), e.getAmount(), Double::sum);
            }
        }

        // For SHARE transfers, reconciliation is against the share-purchase rows
        // they generate: a negative "Transfer out" (source) and a positive
        // "Transfer in" (destination), both keyed by the share transfer id.
        Map<UUID, List<SharePurchase>> purchasesByShareTransfer = new HashMap<>();
        for (SharePurchase p : sharePurchaseRepository.findAll()) {
            if (p.getTransferId() != null
                    && ShareStatus.resolve(p.getStatus()).postsToLedger()) {
                purchasesByShareTransfer
                        .computeIfAbsent(p.getTransferId(), k -> new ArrayList<>())
                        .add(p);
            }
        }

        List<FinanceReport.TransferTransactionRow> transactions = new ArrayList<>();
        Map<UUID, FinanceReport.TransferMemberRow> grouped = new LinkedHashMap<>();

        for (Transfer t : transferRepository.findAll()) {
            if (!TransferStatus.resolve(t.getStatus()).postsToLedger()) continue;
            if (t.getAmount() == null || t.getAmount() <= 0 || t.getDate() == null) {
                continue;
            }
            if (t.getDate() < lo || t.getDate() > hi) {
                continue;
            }
            double amount = round(t.getAmount());
            double debit = round(debitPerTarget.getOrDefault(t.getId(), 0.0));
            double credit = round(creditPerTarget.getOrDefault(t.getId(), 0.0));
            boolean reconciled = Math.abs(debit - amount) < 0.01;

            SavingType srcType = types.get(t.getSourceSavingTypeId());
            SavingType dstType = types.get(t.getDestinationSavingTypeId());

            addTransferMemberRow(grouped, members, t.getSourceMemberId(), true, amount);
            addTransferMemberRow(grouped, members, t.getDestinationMemberId(), false, amount);

            FinanceReport.TransferTransactionRow tx = new FinanceReport.TransferTransactionRow();
            tx.id = t.getId();
            tx.date = t.getDate();
            tx.type = "SAVING";
            tx.units = 0.0;
            tx.sourceMemberId = t.getSourceMemberId();
            tx.sourceMemberName = memberName(members, t.getSourceMemberId());
            tx.sourceMemberNumber = memberNumber(members, t.getSourceMemberId());
            tx.sourceSavingTypeName = srcType != null ? srcType.getName() : null;
            tx.destinationMemberId = t.getDestinationMemberId();
            tx.destinationMemberName = memberName(members, t.getDestinationMemberId());
            tx.destinationMemberNumber = memberNumber(members, t.getDestinationMemberId());
            tx.destinationSavingTypeName = dstType != null ? dstType.getName() : null;
            tx.amount = amount;
            tx.ftp = t.getFtp();
            tx.sourceLedger = debit;
            tx.destinationLedger = credit;
            tx.reconciled = reconciled;
            transactions.add(tx);

            report.grandTotal = round(report.grandTotal + amount);
            report.savingCount++;
            report.savingTotal = round(report.savingTotal + amount);
            report.sourceLedgerTotal = round(report.sourceLedgerTotal + debit);
            report.destinationLedgerTotal = round(report.destinationLedgerTotal + credit);
        }

        for (ShareTransfer st : shareTransferRepository.findAll()) {
            if (st.getTotalAmount() == null || st.getTotalAmount() <= 0 || st.getTransferDate() == null) {
                continue;
            }
            if (st.getTransferDate() < lo || st.getTransferDate() > hi) {
                continue;
            }
            double amount = round(st.getTotalAmount());
            double units = round(st.getUnits() != null ? st.getUnits() : 0);

            double srcOut = 0.0;
            double dstIn = 0.0;
            for (SharePurchase p : purchasesByShareTransfer.getOrDefault(st.getId(), List.of())) {
                if (p.getTotalAmount() == null) {
                    continue;
                }
                if (p.getTotalAmount() < 0) {
                    srcOut = round(srcOut + Math.abs(p.getTotalAmount()));
                } else {
                    dstIn = round(dstIn + p.getTotalAmount());
                }
            }
            boolean reconciled = Math.abs(srcOut - amount) < 0.01 && Math.abs(dstIn - amount) < 0.01;

            addTransferMemberRow(grouped, members, st.getSourceMemberId(), true, amount);
            addTransferMemberRow(grouped, members, st.getDestinationMemberId(), false, amount);

            FinanceReport.TransferTransactionRow tx = new FinanceReport.TransferTransactionRow();
            tx.id = st.getId();
            tx.date = st.getTransferDate();
            tx.type = "SHARE";
            tx.units = units;
            tx.sourceMemberId = st.getSourceMemberId();
            tx.sourceMemberName = memberName(members, st.getSourceMemberId());
            tx.sourceMemberNumber = memberNumber(members, st.getSourceMemberId());
            tx.destinationMemberId = st.getDestinationMemberId();
            tx.destinationMemberName = memberName(members, st.getDestinationMemberId());
            tx.destinationMemberNumber = memberNumber(members, st.getDestinationMemberId());
            tx.amount = amount;
            tx.ftp = st.getFtp();
            tx.sourceLedger = srcOut;
            tx.destinationLedger = dstIn;
            tx.reconciled = reconciled;
            transactions.add(tx);

            report.grandTotal = round(report.grandTotal + amount);
            report.shareUnitsTotal = round(report.shareUnitsTotal + units);
            report.shareCount++;
            report.shareTotal = round(report.shareTotal + amount);
            report.sourceLedgerTotal = round(report.sourceLedgerTotal + srcOut);
            report.destinationLedgerTotal = round(report.destinationLedgerTotal + dstIn);
        }

        report.byMember = new ArrayList<>(grouped.values());
        report.byMember.sort(Comparator.comparing((FinanceReport.TransferMemberRow r) -> r.memberName,
                Comparator.nullsLast(String::compareTo)));
        for (FinanceReport.TransferMemberRow r : report.byMember) {
            r.netAmount = round(r.destinationAmount - r.sourceAmount);
        }

        report.transactions = transactions;
        report.transactions.sort(Comparator
                .comparingLong((FinanceReport.TransferTransactionRow r) -> r.date != null ? r.date : 0L)
                .thenComparing(r -> r.sourceMemberName, Comparator.nullsLast(String::compareTo)));
        report.transactionCount = report.transactions.size();

        report.grandTotal = round(report.grandTotal);
        report.savingTotal = round(report.savingTotal);
        report.shareTotal = round(report.shareTotal);
        report.shareUnitsTotal = round(report.shareUnitsTotal);
        report.sourceLedgerTotal = round(report.sourceLedgerTotal);
        report.destinationLedgerTotal = round(report.destinationLedgerTotal);
        report.difference = round(report.grandTotal - report.sourceLedgerTotal);
        return report;
    }

    /**
     * Mandatory saving tracker report for a full calendar year, built from the
     * {@code member_saving_period} rows. The member matrix shows one row per
     * member with a cell per month (required / paid / remaining / status) and a
     * per-month totals section: members count, how many are fully paid, partial,
     * or in arrears, plus required vs collected.
     */
    public FinanceReport.MandatoryTrackerReport mandatoryTrackerReport(int year) {
        FinanceReport.MandatoryTrackerReport report = new FinanceReport.MandatoryTrackerReport();
        report.year = year;

        int fromYm = year * 100 + 1;
        int toYm = year * 100 + 12;
        UUID typeId = settingRepository.findByKey("mandatory_saving_type_id")
                .map(s -> s.getValue())
                .filter(v -> v != null && !v.isBlank())
                .map(UUID::fromString)
                .orElse(null);

        SavingType type = typeId != null ? typeById(typeId) : null;
        if (type == null) {
            report.savingTypeName = "Mandatory Saving";
            return report;
        }
        report.savingTypeName = type.getName();

        Map<UUID, Member> members = memberById();
        List<MemberSavingPeriod> rows = memberSavingPeriodRepository
                .findBySavingTypeIdAndYearMonthBetweenOrderByYearMonthAsc(typeId, fromYm, toYm);

        Map<UUID, TrackerMemberAccumulator> accs = new LinkedHashMap<>();
        for (MemberSavingPeriod p : rows) {
            TrackerMemberAccumulator acc = accs.computeIfAbsent(p.getMemberId(),
                    id -> new TrackerMemberAccumulator(members, id));
            acc.apply(p);
        }

        // one row per member who has any obligation in the year
        report.members = new ArrayList<>();
        for (TrackerMemberAccumulator acc : accs.values()) {
            report.members.add(acc.toRow(typeId, year));
        }
        report.members.sort(Comparator.comparing((FinanceReport.TrackerMemberRow r) -> r.memberName,
                Comparator.nullsLast(String::compareTo)));

        // per-month totals across all members
        for (int m = 1; m <= 12; m++) {
            int ym = year * 100 + m;
            FinanceReport.TrackerMonthTotal t = new FinanceReport.TrackerMonthTotal();
            t.yearMonth = ym;
            t.label = Month.of(m).getDisplayName(TextStyle.SHORT, Locale.ENGLISH) + " " + year;
            for (TrackerMemberAccumulator acc : accs.values()) {
                FinanceReport.TrackerMonthCell cell = acc.cells[m - 1];
                if (cell == null) {
                    continue;
                }
                t.memberCount++;
                t.required = round(t.required + cell.required);
                t.paid = round(t.paid + cell.paid);
                t.remaining = round(t.remaining + cell.remaining);
                if ("PAID".equals(cell.status)) {
                    t.paidCount++;
                } else if ("PARTIAL".equals(cell.status)) {
                    t.partialCount++;
                } else {
                    t.unpaidCount++;
                }
            }
            report.months.add(t);
        }

        report.totalMembers = report.members.size();
        for (FinanceReport.TrackerMemberRow r : report.members) {
            report.totalRequired = round(report.totalRequired + r.requiredTotal);
            report.totalPaid = round(report.totalPaid + r.paidTotal);
            report.totalArrears = round(report.totalArrears + r.arrearsTotal);
        }
        return report;
    }

    /**
     * Share purchase report for an arbitrary date window. Reconciles the share
     * purchase records against the finance (journal) system: for each purchase
     * the ledger holds a DEBIT to the bank/cash account equal to `totalAmount`
     * and CREDITS (share capital net of service fee + registration fee). A
     * purchase is `reconciled` when its recorded debit matches the amount.
     */
    public FinanceReport.SharePurchaseReport sharePurchaseReport(Long from, Long to) {
        FinanceReport.SharePurchaseReport report = new FinanceReport.SharePurchaseReport();
        report.from = from;
        report.to = to;
        long lo = from != null ? from : Long.MIN_VALUE;
        long hi = to != null ? to : Long.MAX_VALUE;

        Map<UUID, Member> members = memberById();
        Map<UUID, String> accountNames = new HashMap<>();
        for (Account a : accountRepository.findAll()) {
            if (a.getId() != null && a.getName() != null) {
                accountNames.put(a.getId(), a.getName());
            }
        }

        Map<UUID, Double> debitPerTarget = new HashMap<>();
        Map<UUID, Double> creditPerTarget = new HashMap<>();
        for (JournalEntry e : journalEntryRepository.findAll()) {
            if (e.getTargetId() == null || e.getAmount() == null) {
                continue;
            }
            if (Boolean.TRUE.equals(e.getIsCredit())) {
                creditPerTarget.merge(e.getTargetId(), e.getAmount(), Double::sum);
            } else {
                debitPerTarget.merge(e.getTargetId(), e.getAmount(), Double::sum);
            }
        }

        List<FinanceReport.SharePurchaseTransactionRow> transactions = new ArrayList<>();
        List<FinanceReport.SharePurchaseMemberRow> grouped = new ArrayList<>();

        for (SharePurchase p : sharePurchaseRepository.findAll()) {
            if (p.getTotalAmount() == null || p.getTotalAmount() <= 0 || p.getPurchaseDate() == null) {
                continue;
            }
            if (!ShareStatus.resolve(p.getStatus()).postsToLedger()) {
                continue;
            }
            if (p.getPurchaseDate() < lo || p.getPurchaseDate() > hi) {
                continue;
            }
            double amount = round(p.getTotalAmount());
            double fee = round(p.getServiceFee() != null ? Math.min(p.getServiceFee(), amount) : 0);
            double shareAmount = round(amount - fee);
            double debit = round(debitPerTarget.getOrDefault(p.getId(), 0.0));
            double credit = round(creditPerTarget.getOrDefault(p.getId(), 0.0));
            boolean reconciled = Math.abs(debit - amount) < 0.01;

            FinanceReport.SharePurchaseMemberRow row = grouped.stream()
                    .filter(r -> r.memberId.equals(p.getMemberId()))
                    .findFirst()
                    .orElse(null);
            if (row == null) {
                row = new FinanceReport.SharePurchaseMemberRow();
                row.memberId = p.getMemberId();
                row.memberName = memberName(members, p.getMemberId());
                row.memberNumber = memberNumber(members, p.getMemberId());
                grouped.add(row);
            }
            row.count++;
            row.units = round(row.units + (p.getUnits() != null ? p.getUnits() : 0));
            row.amount = round(row.amount + amount);
            row.purchaseAmount = round(row.purchaseAmount + shareAmount);
            row.ledgerDebit = round(row.ledgerDebit + debit);
            row.difference = round(row.amount - row.ledgerDebit);

            FinanceReport.SharePurchaseTransactionRow tx = new FinanceReport.SharePurchaseTransactionRow();
            tx.id = p.getId();
            tx.date = p.getPurchaseDate();
            tx.memberId = p.getMemberId();
            tx.memberName = memberName(members, p.getMemberId());
            tx.memberNumber = memberNumber(members, p.getMemberId());
            tx.units = round(p.getUnits() != null ? p.getUnits() : 0);
            tx.amount = amount;
            tx.serviceFee = fee;
            tx.shareAmount = shareAmount;
            tx.bankName = p.getBankId() != null ? accountNames.get(p.getBankId()) : null;
            tx.transactionReference = p.getTransactionReference();
            tx.reconciled = reconciled;
            transactions.add(tx);

            report.grandTotal = round(report.grandTotal + amount);
            report.unitsTotal = round(report.unitsTotal + tx.units);
            report.serviceFeeTotal = round(report.serviceFeeTotal + fee);
            report.shareCapitalTotal = round(report.shareCapitalTotal + shareAmount);
            report.ledgerDebitTotal = round(report.ledgerDebitTotal + debit);
            report.ledgerCreditTotal = round(report.ledgerCreditTotal + credit);
            if (reconciled) {
                report.reconciledCount++;
            }
        }

        for (ShareSubscription sub : shareSubscriptionRepository.findAll()) {
            if (sub.getTotalAmount() == null || sub.getTotalAmount() <= 0 || sub.getSubscriptionDate() == null) {
                continue;
            }
            if (!ShareStatus.resolve(sub.getStatus()).postsToLedger()) {
                continue;
            }
            if (sub.getSubscriptionDate() < lo || sub.getSubscriptionDate() > hi) {
                continue;
            }
            double subAmount = round(sub.getTotalAmount());
            double subUnits = round(sub.getUnits() != null ? sub.getUnits() : 0);
            FinanceReport.SharePurchaseMemberRow row = grouped.stream()
                    .filter(r -> r.memberId.equals(sub.getMemberId()))
                    .findFirst()
                    .orElseGet(() -> {
                        FinanceReport.SharePurchaseMemberRow r = new FinanceReport.SharePurchaseMemberRow();
                        r.memberId = sub.getMemberId();
                        r.memberName = memberName(members, sub.getMemberId());
                        r.memberNumber = memberNumber(members, sub.getMemberId());
                        return r;
                    });
            row.subscriptionCount++;
            row.subscribedUnits = round(row.subscribedUnits + subUnits);
            row.subscribedAmount = round(row.subscribedAmount + subAmount);
            if (!grouped.contains(row)) {
                grouped.add(row);
            }
        }

        for (FinanceReport.SharePurchaseMemberRow row : grouped) {
            row.outstandingUnits = round(row.subscribedUnits - row.units);
            row.outstandingAmount = round(row.subscribedAmount - row.purchaseAmount);
        }

        report.byMember = new ArrayList<>(grouped);
        report.byMember.sort(Comparator.comparing((FinanceReport.SharePurchaseMemberRow r) -> r.memberName,
                Comparator.nullsLast(String::compareTo)));

        report.transactions = transactions;
        report.transactions.sort(Comparator
                .comparingLong((FinanceReport.SharePurchaseTransactionRow r) -> r.date != null ? r.date : 0L)
                .thenComparing(r -> r.memberName, Comparator.nullsLast(String::compareTo)));
        report.transactionCount = report.transactions.size();

        for (FinanceReport.SharePurchaseMemberRow row : report.byMember) {
            report.subscriptionCount += row.subscriptionCount;
            report.subscribedUnitsTotal = round(report.subscribedUnitsTotal + row.subscribedUnits);
            report.subscribedAmountTotal = round(report.subscribedAmountTotal + row.subscribedAmount);
            report.outstandingUnitsTotal = round(report.outstandingUnitsTotal + row.outstandingUnits);
            report.outstandingAmountTotal = round(report.outstandingAmountTotal + row.outstandingAmount);
        }

        report.grandTotal = round(report.grandTotal);
        report.unitsTotal = round(report.unitsTotal);
        report.serviceFeeTotal = round(report.serviceFeeTotal);
        report.shareCapitalTotal = round(report.shareCapitalTotal);
        report.ledgerDebitTotal = round(report.ledgerDebitTotal);
        report.ledgerCreditTotal = round(report.ledgerCreditTotal);
        report.subscribedUnitsTotal = round(report.subscribedUnitsTotal);
        report.subscribedAmountTotal = round(report.subscribedAmountTotal);
        report.outstandingUnitsTotal = round(report.outstandingUnitsTotal);
        report.outstandingAmountTotal = round(report.outstandingAmountTotal);
        report.difference = round(report.grandTotal - report.ledgerDebitTotal);

        report.authorizedCapital = settingDouble("authorized_capital");
        double issuedCapital = 0;
        double purchasedCapitalAll = 0;
        for (ShareSubscription s : shareSubscriptionRepository.findAll()) {
            if (s.getTotalAmount() != null && s.getTotalAmount() > 0
                    && ShareStatus.resolve(s.getStatus()).postsToLedger()) {
                issuedCapital = round(issuedCapital + s.getTotalAmount());
            }
        }
        for (SharePurchase p : sharePurchaseRepository.findAll()) {
            if (!ShareStatus.resolve(p.getStatus()).postsToLedger()) {
                continue;
            }
            double amt = p.getTotalAmount() != null ? p.getTotalAmount() : 0;
            double fee = p.getServiceFee() != null ? Math.min(p.getServiceFee(), amt) : 0;
            if (amt > 0) {
                purchasedCapitalAll = round(purchasedCapitalAll + (amt - fee));
            }
        }
        report.subscribedCapitalTotal = round(issuedCapital);
        report.purchasedCapitalTotal = round(purchasedCapitalAll);
        report.outstandingCapitalTotal = round(issuedCapital - purchasedCapitalAll);
        return report;
    }

    /** Mutable accumulator used while rolling tracker rows into the report. */
    private final class TrackerMemberAccumulator {
        final FinanceReport.TrackerMemberRow row;
        final FinanceReport.TrackerMonthCell[] cells = new FinanceReport.TrackerMonthCell[12];

        TrackerMemberAccumulator(Map<UUID, Member> members, UUID memberId) {
            row = new FinanceReport.TrackerMemberRow();
            row.memberId = memberId;
            row.memberName = memberName(members, memberId);
            row.memberNumber = memberNumber(members, memberId);
        }

        void apply(MemberSavingPeriod p) {
            int idx = (p.getYearMonth() % 100) - 1;
            FinanceReport.TrackerMonthCell cell = cells[idx];
            if (cell == null) {
                cell = new FinanceReport.TrackerMonthCell();
                cell.month = p.getYearMonth() % 100;
                cell.yearMonth = p.getYearMonth();
                cell.status = p.getStatus().name();
                cells[idx] = cell;
            }
            double req = round(p.getRequiredAmount());
            double paid = round(p.getPaidAmount());
            cell.required = round(cell.required + req);
            cell.paid = round(cell.paid + paid);
            cell.remaining = round(cell.remaining + Math.max(0, cell.required - cell.paid));
        }

        FinanceReport.TrackerMemberRow toRow(UUID typeId, int year) {
            double requiredTotal = 0;
            double paidTotal = 0;
            double arrearsTotal = 0;
            int fullyPaid = 0;
            int partial = 0;
            int unpaid = 0;
            for (FinanceReport.TrackerMonthCell cell : cells) {
                if (cell == null) {
                    continue;
                }
                requiredTotal = round(requiredTotal + cell.required);
                paidTotal = round(paidTotal + cell.paid);
                arrearsTotal = round(arrearsTotal + cell.remaining);
                if ("PAID".equals(cell.status)) {
                    fullyPaid++;
                } else if ("PARTIAL".equals(cell.status)) {
                    partial++;
                } else {
                    unpaid++;
                }
            }
            row.months.clear();
            for (FinanceReport.TrackerMonthCell cell : cells) {
                if (cell != null) {
                    row.months.add(cell);
                }
            }
            row.requiredTotal = round(requiredTotal);
            row.paidTotal = round(paidTotal);
            row.arrearsTotal = round(arrearsTotal);
            row.fullyPaidMonths = fullyPaid;
            row.partialMonths = partial;
            row.unpaidMonths = unpaid;
            if (partial > 0 || unpaid > 0) {
                row.status = partial > 0 ? "PARTIAL" : "UNPAID";
            } else {
                row.status = fullyPaid > 0 ? "PAID" : "";
            }
            return row;
        }
    }

    public FinanceReport.MonthlyFinanceReport monthlyFinanceReport(int year) {
        FinanceReport.MonthlyFinanceReport report = new FinanceReport.MonthlyFinanceReport();
        report.year = year;

        Map<UUID, Long> firstCompulsory = firstSavingDate(false);
        Map<UUID, Long> firstVoluntary = firstSavingDate(true);
        Map<UUID, Long> firstShare = firstShareDate();
        Map<UUID, Member> members = memberById();

        for (int m = 1; m <= 12; m++) {
            FinanceReport.FinancePeriodRow row = new FinanceReport.FinancePeriodRow();
            row.period = m;
            long from = monthStartMillis(year * 100 + m);
            long to = monthEndMillis(year * 100 + m);
            accumulateRow(row, from, to, firstCompulsory, firstVoluntary, firstShare, members);
            report.monthlyData.add(row);
        }

        fillAccountRows(report.incomeAccounts, report.expenseAccounts, year, 0);
        return report;
    }

    public FinanceReport.WeeklyFinanceReport weeklyFinanceReport(int year) {
        FinanceReport.WeeklyFinanceReport report = new FinanceReport.WeeklyFinanceReport();
        report.year = year;

        Map<UUID, Long> firstCompulsory = firstSavingDate(false);
        Map<UUID, Long> firstVoluntary = firstSavingDate(true);
        Map<UUID, Long> firstShare = firstShareDate();
        Map<UUID, Member> members = memberById();

        int weekCount = isoWeekCount(year);
        for (int w = 1; w <= weekCount; w++) {
            LocalDate start = isoWeekStart(year, w);
            long from = start.atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli();
            long to = start.plusDays(6).atTime(23, 59, 59)
                    .atZone(ZoneId.systemDefault()).toInstant().toEpochMilli();
            FinanceReport.FinancePeriodRow row = new FinanceReport.FinancePeriodRow();
            row.period = w;
            accumulateRow(row, from, to, firstCompulsory, firstVoluntary, firstShare, members);
            report.weeklyData.add(row);
        }

        fillAccountRows(report.incomeAccounts, report.expenseAccounts, year, 1);
        return report;
    }

    /** Number of ISO weeks in a year (52 or 53). */
    private int isoWeekCount(int year) {
        LocalDate dec28 = LocalDate.of(year, 12, 28);
        return dec28.get(java.time.temporal.IsoFields.WEEK_OF_WEEK_BASED_YEAR);
    }

    /** Monday of the given ISO week of the year. */
    private LocalDate isoWeekStart(int year, int week) {
        return LocalDate.of(year, 1, 1)
                .with(java.time.temporal.IsoFields.WEEK_OF_WEEK_BASED_YEAR, week)
                .with(java.time.temporal.ChronoField.DAY_OF_WEEK, 1);
    }

    private void fillAccountRows(List<FinanceReport.AccountPeriodRow> incomeRows,
                                 List<FinanceReport.AccountPeriodRow> expenseRows,
                                 int year, int weekly) {
        Map<UUID, Long> first = firstSavingDate(false);
        for (JournalEntry e : journalEntryRepository.findAll()) {
            if (e.getAccountId() == null || e.getAmount() == null || e.getDate() == null) {
                continue;
            }
            LocalDate d = Instant.ofEpochMilli(e.getDate()).atZone(ZoneId.systemDefault()).toLocalDate();
            if (d.getYear() != year) {
                continue;
            }
            Account acct = accountRepository.findById(e.getAccountId()).orElse(null);
            if (acct == null) {
                continue;
            }
            double value;
            boolean isIncome;
            if (acct.getAccountType() == AccountType.REVENUE) {
                isIncome = true;
                value = Boolean.TRUE.equals(e.getIsCredit()) ? e.getAmount() : -e.getAmount();
            } else if (acct.getAccountType() == AccountType.EXPENSE) {
                isIncome = false;
                value = Boolean.TRUE.equals(e.getIsCredit()) ? -e.getAmount() : e.getAmount();
            } else {
                continue;
            }
            if (value == 0) {
                continue;
            }
            FinanceReport.AccountPeriodRow r = new FinanceReport.AccountPeriodRow();
            r.accountId = acct.getId() != null ? acct.getId().toString() : null;
            r.accountName = acct.getName();
            r.parentName = acct.getName();
            if (weekly == 1) {
                r.week = d.get(java.time.temporal.IsoFields.WEEK_OF_WEEK_BASED_YEAR);
            } else {
                r.month = d.getMonthValue();
            }
            r.amount = round(value);
            if (isIncome) {
                incomeRows.add(r);
            } else {
                expenseRows.add(r);
            }
        }
        incomeRows.sort(Comparator.comparing((FinanceReport.AccountPeriodRow a) -> a.parentName,
                Comparator.nullsLast(String::compareTo))
                .thenComparing(a -> a.accountName, Comparator.nullsLast(String::compareTo))
                .thenComparingInt(a -> a.month != null ? a.month : (a.week != null ? a.week : 0)));
        expenseRows.sort(Comparator.comparing((FinanceReport.AccountPeriodRow a) -> a.parentName,
                Comparator.nullsLast(String::compareTo))
                .thenComparing(a -> a.accountName, Comparator.nullsLast(String::compareTo))
                .thenComparingInt(a -> a.month != null ? a.month : (a.week != null ? a.week : 0)));
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}