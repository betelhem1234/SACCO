import { createSelector } from '@ngrx/store';
import { AppState } from '../../models/state.model';
import { FinanceState } from './finance.reducer';

export const selectFinanceState = (state: AppState) => state?.finance;

export const selectFinancePeriod = createSelector(
  selectFinanceState,
  (state: FinanceState) => ({ from: state?.from ?? null, to: state?.to ?? null })
);

export const selectFinanceSummary = createSelector(
  selectFinanceState,
  (state: FinanceState) => state?.summary ?? null
);

export const selectTrialBalance = createSelector(
  selectFinanceState,
  (state: FinanceState) => state?.trialBalance ?? null
);

export const selectIncomeStatement = createSelector(
  selectFinanceState,
  (state: FinanceState) => state?.incomeStatement ?? null
);

export const selectBalanceSheet = createSelector(
  selectFinanceState,
  (state: FinanceState) => state?.balanceSheet ?? null
);

export const selectCashFlow = createSelector(
  selectFinanceState,
  (state: FinanceState) => state?.cashFlow ?? null
);

export const selectCashFlowStatement = createSelector(
  selectFinanceState,
  (state: FinanceState) => state?.cashFlowStatement ?? null
);

export const selectCashFlowStatementLoading = createSelector(
  selectFinanceState,
  (state: FinanceState) => state?.loadingCashFlowStatement ?? false
);

export const selectGeneralLedger = createSelector(
  selectFinanceState,
  (state: FinanceState) => state?.generalLedger ?? null
);

export const selectGeneralLedgerLoading = createSelector(
  selectFinanceState,
  (state: FinanceState) => state?.loadingGeneralLedger ?? false
);

export const selectRetainedEarnings = createSelector(
  selectFinanceState,
  (state: FinanceState) => state?.retainedEarnings ?? null
);

export const selectStatementOfChangesInEquity = createSelector(
  selectFinanceState,
  (state: FinanceState) => state?.statementOfChangesInEquity ?? null
);

export const selectStatementOfChangesInEquityLoading = createSelector(
  selectFinanceState,
  (state: FinanceState) => state?.loadingStatementOfChangesInEquity ?? false
);

export const selectMonthlyReport = createSelector(
  selectFinanceState,
  (state: FinanceState) => state?.monthlyReport ?? null
);

export const selectWeeklyReport = createSelector(
  selectFinanceState,
  (state: FinanceState) => state?.weeklyReport ?? null
);

export const selectSavingsReport = createSelector(
  selectFinanceState,
  (state: FinanceState) => state?.savingsReport ?? null
);

export const selectSavingsReportLoading = createSelector(
  selectFinanceState,
  (state: FinanceState) => state?.loadingSavingsReport ?? false
);

export const selectMandatoryTrackerReport = createSelector(
  selectFinanceState,
  (state: FinanceState) => state?.mandatoryTrackerReport ?? null
);

export const selectMandatoryTrackerReportLoading = createSelector(
  selectFinanceState,
  (state: FinanceState) => state?.loadingMandatoryTrackerReport ?? false
);

export const selectSharePurchaseReport = createSelector(
  selectFinanceState,
  (state: FinanceState) => state?.sharePurchaseReport ?? null
);

export const selectSharePurchaseReportLoading = createSelector(
  selectFinanceState,
  (state: FinanceState) => state?.loadingSharePurchaseReport ?? false
);

export const selectWithdrawalReport = createSelector(
  selectFinanceState,
  (state: FinanceState) => state?.withdrawalReport ?? null
);

export const selectWithdrawalReportLoading = createSelector(
  selectFinanceState,
  (state: FinanceState) => state?.loadingWithdrawalReport ?? false
);

export const selectTransferReport = createSelector(
  selectFinanceState,
  (state: FinanceState) => state?.transferReport ?? null
);

export const selectTransferReportLoading = createSelector(
  selectFinanceState,
  (state: FinanceState) => state?.loadingTransferReport ?? false
);

export const selectMonthlyReportLoading = createSelector(
  selectFinanceState,
  (state: FinanceState) => state?.loadingMonthlyReport ?? false
);

export const selectWeeklyReportLoading = createSelector(
  selectFinanceState,
  (state: FinanceState) => state?.loadingWeeklyReport ?? false
);

export const selectFinanceLoading = createSelector(
  selectFinanceState,
  (state: FinanceState) =>
    state?.loadingSummary ||
    state?.loadingTrialBalance ||
    state?.loadingIncomeStatement ||
    state?.loadingBalanceSheet ||
    state?.loadingCashFlow ||
    state?.loadingCashFlowStatement ||
    state?.loadingGeneralLedger ||
    state?.loadingRetainedEarnings ||
    state?.loadingStatementOfChangesInEquity || false
);

export const selectFinanceError = createSelector(
  selectFinanceState,
  (state: FinanceState) => state?.error ?? null
);