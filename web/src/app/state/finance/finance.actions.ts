import { createAction, props } from '@ngrx/store';
import {
  TrialBalanceReport,
  IncomeStatementReport,
  BalanceSheetReport,
  CashFlowReport,
  CashFlowStatementReport,
  GeneralLedgerReport,
  RetainedEarningsReport,
  StatementOfChangesInEquityReport,
  FinanceSummaryReport,
  PeriodReport,
  MonthlyFinanceReport,
  WeeklyFinanceReport,
  SavingsReport,
  MandatoryTrackerReport,
  SharePurchaseReport,
  WithdrawalReport,
  TransferReport,
} from '@sacco/shared-models';

export interface FinancePeriod {
  from?: number | null;
  to?: number | null;
  accountId?: string;
}

export interface FinanceReportParams {
  year: number;
  month?: number | null;
}

/** Remember the active reporting period in the store. */
export const setFinancePeriod = createAction('[FINANCE] Set Period', props<FinancePeriod>());

export const clearFinanceData = createAction('[FINANCE] Clear Data');

// ─── Finance Summary (hub) ────────────────────────────────────────────────────

export const loadFinanceSummary = createAction('[FINANCE] Load Summary', props<FinancePeriod>());
export const loadFinanceSummarySuccess = createAction(
  '[FINANCE] Load Summary Success',
  props<{ summary: FinanceSummaryReport }>()
);
export const loadFinanceSummaryFailure = createAction('[FINANCE] Load Summary Failure', props<{ error: any }>());

// ─── Trial Balance ────────────────────────────────────────────────────────────

export const loadTrialBalance = createAction('[FINANCE] Load Trial Balance', props<FinancePeriod>());
export const loadTrialBalanceSuccess = createAction(
  '[FINANCE] Load Trial Balance Success',
  props<{ report: TrialBalanceReport }>()
);
export const loadTrialBalanceFailure = createAction('[FINANCE] Load Trial Balance Failure', props<{ error: any }>());

// ─── Income Statement ─────────────────────────────────────────────────────────

export const loadIncomeStatement = createAction('[FINANCE] Load Income Statement', props<FinancePeriod>());
export const loadIncomeStatementSuccess = createAction(
  '[FINANCE] Load Income Statement Success',
  props<{ report: IncomeStatementReport }>()
);
export const loadIncomeStatementFailure = createAction('[FINANCE] Load Income Statement Failure', props<{ error: any }>());

// ─── Balance Sheet ────────────────────────────────────────────────────────────

export const loadBalanceSheet = createAction('[FINANCE] Load Balance Sheet', props<FinancePeriod>());
export const loadBalanceSheetSuccess = createAction(
  '[FINANCE] Load Balance Sheet Success',
  props<{ report: BalanceSheetReport }>()
);
export const loadBalanceSheetFailure = createAction('[FINANCE] Load Balance Sheet Failure', props<{ error: any }>());

// ─── Cash Flow Statement ──────────────────────────────────────────────────────

export const loadCashFlow = createAction('[FINANCE] Load Cash Flow', props<FinancePeriod>());
export const loadCashFlowSuccess = createAction(
  '[FINANCE] Load Cash Flow Success',
  props<{ report: CashFlowReport }>()
);
export const loadCashFlowFailure = createAction('[FINANCE] Load Cash Flow Failure', props<{ error: any }>());

export const loadCashFlowStatement = createAction('[FINANCE] Load Cash Flow Statement', props<FinancePeriod>());
export const loadCashFlowStatementSuccess = createAction(
  '[FINANCE] Load Cash Flow Statement Success',
  props<{ report: CashFlowStatementReport }>()
);
export const loadCashFlowStatementFailure = createAction('[FINANCE] Load Cash Flow Statement Failure', props<{ error: any }>());

// ─── General Ledger ───────────────────────────────────────────────────────────

export const loadGeneralLedger = createAction('[FINANCE] Load General Ledger', props<FinancePeriod>());
export const loadGeneralLedgerSuccess = createAction(
  '[FINANCE] Load General Ledger Success',
  props<{ report: GeneralLedgerReport }>()
);
export const loadGeneralLedgerFailure = createAction('[FINANCE] Load General Ledger Failure', props<{ error: any }>());

// ─── Retained Earnings ────────────────────────────────────────────────────────

export const loadRetainedEarnings = createAction('[FINANCE] Load Retained Earnings', props<FinancePeriod>());
export const loadRetainedEarningsSuccess = createAction(
  '[FINANCE] Load Retained Earnings Success',
  props<{ report: RetainedEarningsReport }>()
);
export const loadRetainedEarningsFailure = createAction('[FINANCE] Load Retained Earnings Failure', props<{ error: any }>());

// ─── Statement of Changes in Equity ──────────────────────────────────────────

export const loadStatementOfChangesInEquity = createAction('[FINANCE] Load Statement of Changes in Equity', props<FinancePeriod>());
export const loadStatementOfChangesInEquitySuccess = createAction(
  '[FINANCE] Load Statement of Changes in Equity Success',
  props<{ report: StatementOfChangesInEquityReport }>()
);
export const loadStatementOfChangesInEquityFailure = createAction(
  '[FINANCE] Load Statement of Changes in Equity Failure',
  props<{ error: any }>()
);


// ─── Monthly & Weekly Finance Report ─────────────────────────────────────────

export const loadMonthlyReport = createAction('[FINANCE] Load Monthly Report', props<{ params: FinanceReportParams }>());
export const loadMonthlyReportSuccess = createAction(
  '[FINANCE] Load Monthly Report Success',
  props<{ report: MonthlyFinanceReport }>()
);
export const loadMonthlyReportFailure = createAction('[FINANCE] Load Monthly Report Failure', props<{ error: any }>());

export const loadWeeklyReport = createAction('[FINANCE] Load Weekly Report', props<{ params: FinanceReportParams }>());
export const loadWeeklyReportSuccess = createAction(
  '[FINANCE] Load Weekly Report Success',
  props<{ report: WeeklyFinanceReport }>()
);
export const loadWeeklyReportFailure = createAction('[FINANCE] Load Weekly Report Failure', props<{ error: any }>());

// ─── Savings Report ───────────────────────────────────────────────────────────

export const loadSavingsReport = createAction('[FINANCE] Load Savings Report', props<FinancePeriod>());
export const loadSavingsReportSuccess = createAction(
  '[FINANCE] Load Savings Report Success',
  props<{ report: SavingsReport }>()
);
export const loadSavingsReportFailure = createAction('[FINANCE] Load Savings Report Failure', props<{ error: any }>());

// ─── Mandatory Tracker Report ─────────────────────────────────────────────────

export const loadMandatoryTrackerReport = createAction('[FINANCE] Load Mandatory Tracker Report', props<{ params: FinanceReportParams }>());
export const loadMandatoryTrackerReportSuccess = createAction(
  '[FINANCE] Load Mandatory Tracker Report Success',
  props<{ report: MandatoryTrackerReport }>()
);
export const loadMandatoryTrackerReportFailure = createAction('[FINANCE] Load Mandatory Tracker Report Failure', props<{ error: any }>());

// ─── Share Purchase Report ────────────────────────────────────────────────────

export const loadSharePurchaseReport = createAction('[FINANCE] Load Share Purchase Report', props<FinancePeriod>());
export const loadSharePurchaseReportSuccess = createAction(
  '[FINANCE] Load Share Purchase Report Success',
  props<{ report: SharePurchaseReport }>()
);
export const loadSharePurchaseReportFailure = createAction('[FINANCE] Load Share Purchase Report Failure', props<{ error: any }>());

// ─── Withdrawal Report ────────────────────────────────────────────────────

export const loadWithdrawalReport = createAction('[FINANCE] Load Withdrawal Report', props<FinancePeriod>());
export const loadWithdrawalReportSuccess = createAction(
  '[FINANCE] Load Withdrawal Report Success',
  props<{ report: WithdrawalReport }>()
);
export const loadWithdrawalReportFailure = createAction('[FINANCE] Load Withdrawal Report Failure', props<{ error: any }>());

// ─── Transfer Report ──────────────────────────────────────────────────────

export const loadTransferReport = createAction('[FINANCE] Load Transfer Report', props<FinancePeriod>());
export const loadTransferReportSuccess = createAction(
  '[FINANCE] Load Transfer Report Success',
  props<{ report: TransferReport }>()
);
export const loadTransferReportFailure = createAction('[FINANCE] Load Transfer Report Failure', props<{ error: any }>());