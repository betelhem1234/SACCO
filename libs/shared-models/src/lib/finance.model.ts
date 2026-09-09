/**
 * Finance report payloads. These map 1:1 to the backend `FinanceReport` DTOs
 * exposed under `/api/finance`.
 */

export interface FinanceDateWindow {
  from?: number | null;
  to?: number | null;
}

// ─── Trial Balance ────────────────────────────────────────────────────────────

export interface TrialBalanceRow {
  accountId?: string;
  accountNumber?: string;
  accountName?: string;
  accountType?: number;
  debit: number;
  credit: number;
  balance: number;
}

export interface TrialBalanceGroup {
  name: string;
  accountType: number;
  debit: number;
  credit: number;
  balance: number;
  rows: TrialBalanceRow[];
}

export interface TrialBalanceReport extends FinanceDateWindow {
  groups: TrialBalanceGroup[];
  totalDebit: number;
  totalCredit: number;
  totalBalance: number;
}

// ─── Income Statement ─────────────────────────────────────────────────────────

export interface IncomeRow {
  accountId?: string;
  accountNumber?: string;
  accountName?: string;
  amount: number;
}

export interface IncomeStatementReport extends FinanceDateWindow {
  revenue: IncomeRow[];
  expenses: IncomeRow[];
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
}

// ─── Balance Sheet ────────────────────────────────────────────────────────────

export interface BalanceRow {
  accountId?: string;
  accountNumber?: string;
  accountName?: string;
  amount: number;
  isRetainedEarnings?: boolean;
}

export interface BalanceSheetReport extends FinanceDateWindow {
  assets: BalanceRow[];
  liabilities: BalanceRow[];
  equity: BalanceRow[];
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  totalLiabilitiesAndEquity: number;
  netIncome: number;
  balanced: boolean;
}

// ─── Cash Flow Statement ──────────────────────────────────────────────────────

export interface CashFlowRow {
  id?: string;
  date?: number | null;
  accountId?: string;
  accountNumber?: string;
  accountName?: string;
  description?: string;
  reference?: string;
  ftp?: string;
  amount: number;
}

export interface CashFlowReport extends FinanceDateWindow {
  inflows: CashFlowRow[];
  outflows: CashFlowRow[];
  totalInflows: number;
  totalOutflows: number;
  netCashFlow: number;
}

// ─── Cash Flow Statement (ethiotrit-style summary) ──────────────────────────

export interface CashFlowActivityRow {
  accountId?: string;
  accountNumber?: string;
  accountName?: string;
  accountType?: number;
  debit: number;
  credit: number;
  balance: number;
}

export interface CashFlowStatementReport extends FinanceDateWindow {
  operating: CashFlowActivityRow[];
  investing: CashFlowActivityRow[];
  financing: CashFlowActivityRow[];
  operatingNet: number;
  investingNet: number;
  financingNet: number;
  netCashFlow: number;
  startingAmount: number;
  endingAmount: number;
  netChange: number;
}

// ─── General Ledger ───────────────────────────────────────────────────────────

export interface LedgerRow {
  id?: string;
  date?: number | null;
  createdAt?: number | null;
  accountId?: string;
  accountNumber?: string;
  accountName?: string;
  accountType?: number;
  description?: string;
  reference?: string;
  ftp?: string;
  credit: boolean;
  debit: number;
  creditAmount: number;
  runningBalance?: number;
}

export interface GeneralLedgerReport extends FinanceDateWindow {
  entries: LedgerRow[];
  totalDebit: number;
  totalCredit: number;
  balance: number;
  openingBalance?: number;
}

// ─── Retained Earnings ────────────────────────────────────────────────────────

export interface RetainedEarningsAccountRow {
  accountId?: string;
  accountNumber?: string;
  accountName?: string;
  accountType?: number;
  debit: number;
  credit: number;
  amount: number;
}

export interface RetainedEarningsPeriodRow {
  label: string;
  from?: number | null;
  to?: number | null;
  revenue: number;
  expenses: number;
  netIncome: number;
  accounts: RetainedEarningsAccountRow[];
}

export interface RetainedEarningsReport extends FinanceDateWindow {
  opening: number;
  netIncome: number;
  closing: number;
  periods: RetainedEarningsPeriodRow[];
}

// ─── Statement of Changes in Equity ──────────────────────────────────────────

export interface EquityStatementRow {
  description: string;
  shareCapital?: number | null;
  statutoryReserve?: number | null;
  retainedEarnings?: number | null;
  totalEquity?: number | null;
  detail?: string | null;
}

export interface StatementOfChangesInEquityReport extends FinanceDateWindow {
  rows: EquityStatementRow[];
  shareAccountId?: string | null;
  shareAccountNumber?: string | null;
  shareAccountName?: string | null;
  reserveAccountId?: string | null;
  reserveAccountNumber?: string | null;
  reserveAccountName?: string | null;
}

// ─── Finance Summary (report hub) ─────────────────────────────────────────────

export interface FinanceSummaryReport extends FinanceDateWindow {
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  netWorth: number;
  cashAndBankBalance: number;
  savingsTotal: number;
  loanPortfolio: number;
  activeLoans: number;
  totalAccounts: number;
  totalEntries: number;
}

// ─── Periodic Finance Report (Monthly & Daily) ────────────────────────────────

export interface PeriodColumn {
  label: string;
  from?: number | null;
  to?: number | null;
}

export interface PeriodRow {
  group: string;
  label: string;
  key: string;
  values: number[];
}

export interface PeriodReport extends FinanceDateWindow {
  year: number;
  month?: number | null;
  week?: number | null;
  columns: PeriodColumn[];
  rows: PeriodRow[];
}

// ─── Ethiotrit-style Finance Report (Monthly & Weekly) ────────────────────────

/** One month (or week) of the ethiotrit-style finance report. */
export interface FinancePeriodRow {
  period: number;
  new_compulsory: number;
  old_compulsory: number;
  total_compulsory: number;
  new_voluntary: number;
  old_voluntary: number;
  total_voluntary: number;
  new_share: number;
  old_share: number;
  total_share: number;
  transfer_voluntary_to_mandatory: number;
  transfer_voluntary_to_voluntary: number;
  transfer_voluntary_to_share: number;
  transfer_share_to_share: number;
  transfer_total: number;
  withdrawal_mandatory: number;
  withdrawal_voluntary: number;
  withdrawal_total: number;
  disbursement_total: number;
  income_total: number;
  expense_total: number;
}

/** A single income/expense account aggregated per month or week. */
export interface FinanceAccountPeriodRow {
  accountId?: string;
  accountName?: string;
  parentName?: string;
  month?: number;
  week?: number;
  amount: number;
}

export interface MonthlyFinanceReport {
  year: number;
  monthlyData: FinancePeriodRow[];
  incomeAccounts: FinanceAccountPeriodRow[];
  expenseAccounts: FinanceAccountPeriodRow[];
}

export interface WeeklyFinanceReport {
  year: number;
  weeklyData: FinancePeriodRow[];
  incomeAccounts: FinanceAccountPeriodRow[];
  expenseAccounts: FinanceAccountPeriodRow[];
}

// ─── Finance Report Drill-down Detail ─────────────────────────────────────────

/** One underlying transaction behind a finance report cell. */
export interface ReportDetailRow {
  date?: number | null;
  memberName?: string;
  memberId?: string;
  accountName?: string;
  description?: string;
  reference?: string;
  amount: number;
}

export interface ReportDetail {
  title: string;
  rows: ReportDetailRow[];
  total: number;
}

export interface PeriodDetailParams {
  from: number;
  to: number;
  category: string;
  accountName?: string;
}