import { createSelector, createFeatureSelector } from '@ngrx/store';
import { LoanState } from './loans.reducer';

export const selectLoanState = createFeatureSelector<LoanState>('loans');

export const selectAllRequests = createSelector(selectLoanState, (s) => s.requests);
export const selectPendingRequests = createSelector(selectLoanState, (s) => s.requests.filter(r => r.status === 'PENDING'));
export const selectAllLoans = createSelector(selectLoanState, (s) => s.loans);
export const selectActiveLoans = createSelector(selectLoanState, (s) => s.loans.filter(l => l.status === 'ACTIVE'));

export const selectScheduleForLoan = (loanId: string) =>
    createSelector(selectLoanState, (s) => s.schedulesByLoanId[loanId] ?? []);

export const selectLoanStatus = createSelector(selectLoanState, (s) => s.status);
