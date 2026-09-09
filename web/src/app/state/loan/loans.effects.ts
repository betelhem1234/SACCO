import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, tap } from 'rxjs/operators';
import { ApiService } from '../../services/api.service';
import { Loan } from '@sacco/shared-models';
import {
    loadLoanRequests, loadLoanRequestsSuccess, loadLoanRequestsFailure,
    submitLoanRequest, submitLoanRequestSuccess, submitLoanRequestFailure,
    approveLoanRequest, approveLoanRequestSuccess, approveLoanRequestFailure,
    loadLoans, loadLoansSuccess, loadLoansFailure,
    disburseLoan, disburseLoanSuccess, disburseLoanFailure,
    repayLoan, repayLoanSuccess, repayLoanFailure,
    loadLoanSchedule, loadLoanScheduleSuccess, loadLoanScheduleFailure,
} from '../loan/loans.actions';

@Injectable({ providedIn: 'root' })
export class LoansEffects {
    private actions$ = inject(Actions);
    private api = inject(ApiService);

    loadRequests$ = createEffect(() =>
        this.actions$.pipe(
            ofType(loadLoanRequests),
            mergeMap(() =>
                this.api.getLoanRequests().pipe(
                    map(requests => loadLoanRequestsSuccess({ requests })),
                    catchError(error => of(loadLoanRequestsFailure({ error })))
                )
            )
        )
    );

    submitRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(submitLoanRequest),
            mergeMap(({ request }) =>
                this.api.submitLoanRequest(request).pipe(
                    map(r => submitLoanRequestSuccess({ request: r })),
                    tap(() => window.alert('Loan request submitted successfully')),
                    catchError(error => {
                        window.alert('Failed to submit loan request');
                        return of(submitLoanRequestFailure({ error }));
                    })
                )
            )
        )
    );

    approveRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(approveLoanRequest),
            mergeMap(({ requestId, approvedBy }) =>
                this.api.approveLoanRequest(requestId, approvedBy).pipe(
                    map((loan: Loan) => approveLoanRequestSuccess({ loan })),
                    tap(() => window.alert('Loan approved and schedule generated')),
                    catchError(error => {
                        window.alert('Failed to approve loan request');
                        return of(approveLoanRequestFailure({ error }));
                    })
                )
            )
        )
    );

    loadLoans$ = createEffect(() =>
        this.actions$.pipe(
            ofType(loadLoans),
            mergeMap(() =>
                this.api.getLoans().pipe(
                    map(loans => loadLoansSuccess({ loans })),
                    catchError(error => of(loadLoansFailure({ error })))
                )
            )
        )
    );

    disburse$ = createEffect(() =>
        this.actions$.pipe(
            ofType(disburseLoan),
            mergeMap(({ loanId, payload }) =>
                this.api.disburseLoan(loanId, payload).pipe(
                    map((loan: Loan) => disburseLoanSuccess({ loan })),
                    tap(() => window.alert('Loan disbursed successfully')),
                    catchError(error => {
                        window.alert('Failed to disburse loan');
                        return of(disburseLoanFailure({ error }));
                    })
                )
            )
        )
    );

    repay$ = createEffect(() =>
        this.actions$.pipe(
            ofType(repayLoan),
            mergeMap(({ loanId, payload }) =>
                this.api.repayLoan(loanId, payload).pipe(
                    map((loan: Loan) => repayLoanSuccess({ loan })),
                    tap(() => window.alert('Repayment processed successfully')),
                    catchError(error => {
                        window.alert('Failed to process repayment');
                        return of(repayLoanFailure({ error }));
                    })
                )
            )
        )
    );

    loadSchedule$ = createEffect(() =>
        this.actions$.pipe(
            ofType(loadLoanSchedule),
            mergeMap(({ loanId }) =>
                this.api.getLoanSchedule(loanId).pipe(
                    map(schedule => loadLoanScheduleSuccess({ loanId, schedule })),
                    catchError(error => of(loadLoanScheduleFailure({ error })))
                )
            )
        )
    );
}
