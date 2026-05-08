import { createReducer, on } from '@ngrx/store';
import { LoanRequest, Loan, LoanSchedule } from '@sacco/shared-models';
import {
    loadLoanRequests, loadLoanRequestsSuccess, loadLoanRequestsFailure,
    submitLoanRequest, submitLoanRequestSuccess, submitLoanRequestFailure,
    approveLoanRequest, approveLoanRequestSuccess, approveLoanRequestFailure,
    loadLoans, loadLoansSuccess, loadLoansFailure,
    disburseLoan, disburseLoanSuccess, disburseLoanFailure,
    repayLoan, repayLoanSuccess, repayLoanFailure,
    loadLoanSchedule, loadLoanScheduleSuccess, loadLoanScheduleFailure,
} from './loans.actions';

export interface LoanState {
    requests: LoanRequest[];
    loans: Loan[];
    schedulesByLoanId: Record<string, LoanSchedule[]>;
    status: 'idle' | 'loading' | 'success' | 'error';
    errorMessage?: string | null;
}

export const initialLoanState: LoanState = {
    requests: [],
    loans: [],
    schedulesByLoanId: {},
    status: 'idle',
    errorMessage: null,
};

export const loanReducer = createReducer(
    initialLoanState,

    // Load requests
    on(loadLoanRequests, (s) => ({ ...s, status: 'loading' as const })),
    on(loadLoanRequestsSuccess, (s, { requests }) => ({ ...s, requests, status: 'success' as const })),
    on(loadLoanRequestsFailure, (s, { error }) => ({ ...s, status: 'error' as const, errorMessage: error })),

    // Submit request
    on(submitLoanRequest, (s) => ({ ...s, status: 'loading' as const })),
    on(submitLoanRequestSuccess, (s, { request }) => ({ ...s, requests: [...s.requests, request], status: 'success' as const })),
    on(submitLoanRequestFailure, (s, { error }) => ({ ...s, status: 'error' as const, errorMessage: error })),

    // Approve request (replaces matching request with APPROVED, adds new loan)
    on(approveLoanRequest, (s) => ({ ...s, status: 'loading' as const })),
    on(approveLoanRequestSuccess, (s, { loan }) => ({
        ...s,
        loans: [...s.loans, loan],
        requests: s.requests.map(r => r.id === loan.loanRequestId ? { ...r, status: 'APPROVED' as const } : r),
        status: 'success' as const,
    })),
    on(approveLoanRequestFailure, (s, { error }) => ({ ...s, status: 'error' as const, errorMessage: error })),

    // Load loans
    on(loadLoans, (s) => ({ ...s, status: 'loading' as const })),
    on(loadLoansSuccess, (s, { loans }) => ({ ...s, loans, status: 'success' as const })),
    on(loadLoansFailure, (s, { error }) => ({ ...s, status: 'error' as const, errorMessage: error })),

    // Disburse
    on(disburseLoan, (s) => ({ ...s, status: 'loading' as const })),
    on(disburseLoanSuccess, (s, { loan }) => ({
        ...s,
        loans: s.loans.map(l => l.id === loan.id ? loan : l),
        status: 'success' as const,
    })),
    on(disburseLoanFailure, (s, { error }) => ({ ...s, status: 'error' as const, errorMessage: error })),

    // Repay
    on(repayLoan, (s) => ({ ...s, status: 'loading' as const })),
    on(repayLoanSuccess, (s, { loan }) => ({
        ...s,
        loans: s.loans.map(l => l.id === loan.id ? loan : l),
        status: 'success' as const,
    })),
    on(repayLoanFailure, (s, { error }) => ({ ...s, status: 'error' as const, errorMessage: error })),

    // Schedule
    on(loadLoanSchedule, (s) => ({ ...s, status: 'loading' as const })),
    on(loadLoanScheduleSuccess, (s, { loanId, schedule }) => ({
        ...s,
        schedulesByLoanId: { ...s.schedulesByLoanId, [loanId]: schedule },
        status: 'success' as const,
    })),
    on(loadLoanScheduleFailure, (s, { error }) => ({ ...s, status: 'error' as const, errorMessage: error })),
);
