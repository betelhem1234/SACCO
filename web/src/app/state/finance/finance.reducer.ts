import { createReducer, on } from '@ngrx/store';
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
  MonthlyFinanceReport,
  WeeklyFinanceReport,
  SavingsReport,
  MandatoryTrackerReport,
  SharePurchaseReport,
  WithdrawalReport,
  TransferReport,
} from '@sacco/shared-models';
import * as FinanceActions from './finance.actions';

export interface FinanceState {
  from?: number | null;
  to?: number | null;
  summary: FinanceSummaryReport | null;
  trialBalance: TrialBalanceReport | null;
  incomeStatement: IncomeStatementReport | null;
  balanceSheet: BalanceSheetReport | null;
  cashFlow: CashFlowReport | null;
  cashFlowStatement: CashFlowStatementReport | null;
  generalLedger: GeneralLedgerReport | null;
  retainedEarnings: RetainedEarningsReport | null;
  statementOfChangesInEquity: StatementOfChangesInEquityReport | null;
  monthlyReport: MonthlyFinanceReport | null;
  weeklyReport: WeeklyFinanceReport | null;
  savingsReport: SavingsReport | null;
  mandatoryTrackerReport: MandatoryTrackerReport | null;
  sharePurchaseReport: SharePurchaseReport | null;
  withdrawalReport: WithdrawalReport | null;
  transferReport: TransferReport | null;
  loadingSummary: boolean;
  loadingTrialBalance: boolean;
  loadingIncomeStatement: boolean;
  loadingBalanceSheet: boolean;
  loadingCashFlow: boolean;
  loadingCashFlowStatement: boolean;
  loadingGeneralLedger: boolean;
  loadingRetainedEarnings: boolean;
  loadingStatementOfChangesInEquity: boolean;
  loadingMonthlyReport: boolean;
  loadingWeeklyReport: boolean;
  loadingSavingsReport: boolean;
  loadingMandatoryTrackerReport: boolean;
  loadingSharePurchaseReport: boolean;
  loadingWithdrawalReport: boolean;
  loadingTransferReport: boolean;
  error: any;
}

export const initialFinanceState: FinanceState = {
  from: null,
  to: null,
  summary: null,
  trialBalance: null,
  incomeStatement: null,
  balanceSheet: null,
  cashFlow: null,
  cashFlowStatement: null,
  generalLedger: null,
  retainedEarnings: null,
  statementOfChangesInEquity: null,
  monthlyReport: null,
  weeklyReport: null,
  savingsReport: null,
  mandatoryTrackerReport: null,
  sharePurchaseReport: null,
  withdrawalReport: null,
  transferReport: null,
  loadingSummary: false,
  loadingTrialBalance: false,
  loadingIncomeStatement: false,
  loadingBalanceSheet: false,
  loadingCashFlow: false,
  loadingCashFlowStatement: false,
  loadingGeneralLedger: false,
  loadingRetainedEarnings: false,
  loadingStatementOfChangesInEquity: false,
  loadingMonthlyReport: false,
  loadingWeeklyReport: false,
  loadingSavingsReport: false,
  loadingMandatoryTrackerReport: false,
  loadingSharePurchaseReport: false,
  loadingWithdrawalReport: false,
  loadingTransferReport: false,
  error: null,
};

export const financeReducer = createReducer(
  initialFinanceState,
  on(FinanceActions.setFinancePeriod, (state, { from, to }) => ({ ...state, from, to })),

  on(FinanceActions.clearFinanceData, () => initialFinanceState),

  on(FinanceActions.loadFinanceSummary, (state) => ({ ...state, loadingSummary: true })),
  on(FinanceActions.loadFinanceSummarySuccess, (state, { summary }) => ({
    ...state,
    summary,
    loadingSummary: false,
  })),
  on(FinanceActions.loadFinanceSummaryFailure, (state, { error }) => ({
    ...state,
    error,
    loadingSummary: false,
  })),

  on(FinanceActions.loadTrialBalance, (state) => ({ ...state, loadingTrialBalance: true })),
  on(FinanceActions.loadTrialBalanceSuccess, (state, { report }) => ({
    ...state,
    trialBalance: report,
    loadingTrialBalance: false,
  })),
  on(FinanceActions.loadTrialBalanceFailure, (state, { error }) => ({
    ...state,
    error,
    loadingTrialBalance: false,
  })),

  on(FinanceActions.loadIncomeStatement, (state) => ({ ...state, loadingIncomeStatement: true })),
  on(FinanceActions.loadIncomeStatementSuccess, (state, { report }) => ({
    ...state,
    incomeStatement: report,
    loadingIncomeStatement: false,
  })),
  on(FinanceActions.loadIncomeStatementFailure, (state, { error }) => ({
    ...state,
    error,
    loadingIncomeStatement: false,
  })),

  on(FinanceActions.loadBalanceSheet, (state) => ({ ...state, loadingBalanceSheet: true })),
  on(FinanceActions.loadBalanceSheetSuccess, (state, { report }) => ({
    ...state,
    balanceSheet: report,
    loadingBalanceSheet: false,
  })),
  on(FinanceActions.loadBalanceSheetFailure, (state, { error }) => ({
    ...state,
    error,
    loadingBalanceSheet: false,
  })),

  on(FinanceActions.loadCashFlow, (state) => ({ ...state, loadingCashFlow: true })),
  on(FinanceActions.loadCashFlowSuccess, (state, { report }) => ({
    ...state,
    cashFlow: report,
    loadingCashFlow: false,
  })),
  on(FinanceActions.loadCashFlowFailure, (state, { error }) => ({
    ...state,
    error,
    loadingCashFlow: false,
  })),

  on(FinanceActions.loadCashFlowStatement, (state) => ({ ...state, loadingCashFlowStatement: true })),
  on(FinanceActions.loadCashFlowStatementSuccess, (state, { report }) => ({
    ...state,
    cashFlowStatement: report,
    loadingCashFlowStatement: false,
  })),
  on(FinanceActions.loadCashFlowStatementFailure, (state, { error }) => ({
    ...state,
    error,
    loadingCashFlowStatement: false,
  })),

  on(FinanceActions.loadGeneralLedger, (state) => ({ ...state, loadingGeneralLedger: true })),
  on(FinanceActions.loadGeneralLedgerSuccess, (state, { report }) => ({
    ...state,
    generalLedger: report,
    loadingGeneralLedger: false,
  })),
  on(FinanceActions.loadGeneralLedgerFailure, (state, { error }) => ({
    ...state,
    error,
    loadingGeneralLedger: false,
  })),

  on(FinanceActions.loadRetainedEarnings, (state) => ({ ...state, loadingRetainedEarnings: true })),
  on(FinanceActions.loadRetainedEarningsSuccess, (state, { report }) => ({
    ...state,
    retainedEarnings: report,
    loadingRetainedEarnings: false,
  })),
  on(FinanceActions.loadRetainedEarningsFailure, (state, { error }) => ({
    ...state,
    error,
    loadingRetainedEarnings: false,
  })),

  on(FinanceActions.loadStatementOfChangesInEquity, (state) => ({ ...state, loadingStatementOfChangesInEquity: true })),
  on(FinanceActions.loadStatementOfChangesInEquitySuccess, (state, { report }) => ({
    ...state,
    statementOfChangesInEquity: report,
    loadingStatementOfChangesInEquity: false,
  })),
  on(FinanceActions.loadStatementOfChangesInEquityFailure, (state, { error }) => ({
    ...state,
    error,
    loadingStatementOfChangesInEquity: false,
  })),

  on(FinanceActions.loadMonthlyReport, (state) => ({ ...state, loadingMonthlyReport: true })),
  on(FinanceActions.loadMonthlyReportSuccess, (state, { report }) => ({
    ...state,
    monthlyReport: report,
    loadingMonthlyReport: false,
  })),
  on(FinanceActions.loadMonthlyReportFailure, (state, { error }) => ({
    ...state,
    error,
    loadingMonthlyReport: false,
  })),

  on(FinanceActions.loadWeeklyReport, (state) => ({ ...state, loadingWeeklyReport: true })),
  on(FinanceActions.loadWeeklyReportSuccess, (state, { report }) => ({
    ...state,
    weeklyReport: report,
    loadingWeeklyReport: false,
  })),
  on(FinanceActions.loadWeeklyReportFailure, (state, { error }) => ({
    ...state,
    error,
    loadingWeeklyReport: false,
  })),

  on(FinanceActions.loadSavingsReport, (state) => ({ ...state, loadingSavingsReport: true })),
  on(FinanceActions.loadSavingsReportSuccess, (state, { report }) => ({
    ...state,
    savingsReport: report,
    loadingSavingsReport: false,
  })),
  on(FinanceActions.loadSavingsReportFailure, (state, { error }) => ({
    ...state,
    error,
    loadingSavingsReport: false,
  })),

  on(FinanceActions.loadMandatoryTrackerReport, (state) => ({ ...state, loadingMandatoryTrackerReport: true })),
  on(FinanceActions.loadMandatoryTrackerReportSuccess, (state, { report }) => ({
    ...state,
    mandatoryTrackerReport: report,
    loadingMandatoryTrackerReport: false,
  })),
  on(FinanceActions.loadMandatoryTrackerReportFailure, (state, { error }) => ({
    ...state,
    error,
    loadingMandatoryTrackerReport: false,
  })),

  on(FinanceActions.loadSharePurchaseReport, (state) => ({ ...state, loadingSharePurchaseReport: true })),
  on(FinanceActions.loadSharePurchaseReportSuccess, (state, { report }) => ({
    ...state,
    sharePurchaseReport: report,
    loadingSharePurchaseReport: false,
  })),
  on(FinanceActions.loadSharePurchaseReportFailure, (state, { error }) => ({
    ...state,
    error,
    loadingSharePurchaseReport: false,
  })),

  on(FinanceActions.loadWithdrawalReport, (state) => ({ ...state, loadingWithdrawalReport: true })),
  on(FinanceActions.loadWithdrawalReportSuccess, (state, { report }) => ({
    ...state,
    withdrawalReport: report,
    loadingWithdrawalReport: false,
  })),
  on(FinanceActions.loadWithdrawalReportFailure, (state, { error }) => ({
    ...state,
    error,
    loadingWithdrawalReport: false,
  })),

  on(FinanceActions.loadTransferReport, (state) => ({ ...state, loadingTransferReport: true })),
  on(FinanceActions.loadTransferReportSuccess, (state, { report }) => ({
    ...state,
    transferReport: report,
    loadingTransferReport: false,
  })),
  on(FinanceActions.loadTransferReportFailure, (state, { error }) => ({
    ...state,
    error,
    loadingTransferReport: false,
  }))
);