import { createAction, props } from '@ngrx/store';
import { LoanRequest, Loan, LoanSchedule, DisburseRequest, RepaymentRequest } from '@sacco/shared-models';

// ─── Loan Requests ────────────────────────────────────────────────────────────
export const loadLoanRequests = createAction('[LOAN] Load Loan Requests');
export const loadLoanRequestsSuccess = createAction('[LOAN] Load Loan Requests Success', props<{ requests: LoanRequest[] }>());
export const loadLoanRequestsFailure = createAction('[LOAN] Load Loan Requests Failure', props<{ error: any }>());

export const submitLoanRequest = createAction('[LOAN] Submit Loan Request', props<{ request: LoanRequest }>());
export const submitLoanRequestSuccess = createAction('[LOAN] Submit Loan Request Success', props<{ request: LoanRequest }>());
export const submitLoanRequestFailure = createAction('[LOAN] Submit Loan Request Failure', props<{ error: any }>());

export const approveLoanRequest = createAction('[LOAN] Approve Loan Request', props<{ requestId: string; approvedBy?: string }>());
export const approveLoanRequestSuccess = createAction('[LOAN] Approve Loan Request Success', props<{ loan: Loan }>());
export const approveLoanRequestFailure = createAction('[LOAN] Approve Loan Request Failure', props<{ error: any }>());

// ─── Loans ────────────────────────────────────────────────────────────────────
export const loadLoans = createAction('[LOAN] Load Loans');
export const loadLoansSuccess = createAction('[LOAN] Load Loans Success', props<{ loans: Loan[] }>());
export const loadLoansFailure = createAction('[LOAN] Load Loans Failure', props<{ error: any }>());

export const disburseLoan = createAction('[LOAN] Disburse Loan', props<{ loanId: string; payload: DisburseRequest }>());
export const disburseLoanSuccess = createAction('[LOAN] Disburse Loan Success', props<{ loan: Loan }>());
export const disburseLoanFailure = createAction('[LOAN] Disburse Loan Failure', props<{ error: any }>());

export const repayLoan = createAction('[LOAN] Repay Loan', props<{ loanId: string; payload: RepaymentRequest }>());
export const repayLoanSuccess = createAction('[LOAN] Repay Loan Success', props<{ loan: Loan }>());
export const repayLoanFailure = createAction('[LOAN] Repay Loan Failure', props<{ error: any }>());

// ─── Schedule ─────────────────────────────────────────────────────────────────
export const loadLoanSchedule = createAction('[LOAN] Load Schedule', props<{ loanId: string }>());
export const loadLoanScheduleSuccess = createAction('[LOAN] Load Schedule Success', props<{ loanId: string; schedule: LoanSchedule[] }>());
export const loadLoanScheduleFailure = createAction('[LOAN] Load Schedule Failure', props<{ error: any }>());
