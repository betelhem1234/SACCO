import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, tap } from 'rxjs/operators';
import { ApiService } from '../../services/api.service';
import * as FinanceActions from './finance.actions';

@Injectable()
export class FinanceEffects {
  private actions$ = inject(Actions);
  private apiService = inject(ApiService);

  loadSummary$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FinanceActions.loadFinanceSummary),
      mergeMap(({ from, to }) =>
        this.apiService.getFinanceSummary(from, to).pipe(
          map((summary) => FinanceActions.loadFinanceSummarySuccess({ summary })),
          catchError((error) => of(FinanceActions.loadFinanceSummaryFailure({ error })))
        )
      )
    )
  );

  loadTrialBalance$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FinanceActions.loadTrialBalance),
      mergeMap(({ from, to }) =>
        this.apiService.getTrialBalance(from, to).pipe(
          map((report) => FinanceActions.loadTrialBalanceSuccess({ report })),
          catchError((error) => of(FinanceActions.loadTrialBalanceFailure({ error })))
        )
      )
    )
  );

  loadIncomeStatement$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FinanceActions.loadIncomeStatement),
      mergeMap(({ from, to }) =>
        this.apiService.getIncomeStatement(from, to).pipe(
          map((report) => FinanceActions.loadIncomeStatementSuccess({ report })),
          catchError((error) => of(FinanceActions.loadIncomeStatementFailure({ error })))
        )
      )
    )
  );

  loadBalanceSheet$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FinanceActions.loadBalanceSheet),
      mergeMap(({ from, to }) =>
        this.apiService.getBalanceSheet(from, to).pipe(
          map((report) => FinanceActions.loadBalanceSheetSuccess({ report })),
          catchError((error) => of(FinanceActions.loadBalanceSheetFailure({ error })))
        )
      )
    )
  );

  loadCashFlow$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FinanceActions.loadCashFlow),
      mergeMap(({ from, to }) =>
        this.apiService.getCashFlow(from, to).pipe(
          map((report) => FinanceActions.loadCashFlowSuccess({ report })),
          catchError((error) => of(FinanceActions.loadCashFlowFailure({ error })))
        )
      )
    )
  );

  loadCashFlowStatement$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FinanceActions.loadCashFlowStatement),
      mergeMap(({ from, to }) =>
        this.apiService.getCashFlowStatement(from, to).pipe(
          map((report) => FinanceActions.loadCashFlowStatementSuccess({ report })),
          catchError((error) => of(FinanceActions.loadCashFlowStatementFailure({ error })))
        )
      )
    )
  );

  loadGeneralLedger$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FinanceActions.loadGeneralLedger),
      mergeMap(({ from, to, accountId }) =>
        this.apiService.getGeneralLedger(from, to, accountId).pipe(
          map((report) => FinanceActions.loadGeneralLedgerSuccess({ report })),
          catchError((error) => of(FinanceActions.loadGeneralLedgerFailure({ error })))
        )
      )
    )
  );

  loadRetainedEarnings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FinanceActions.loadRetainedEarnings),
      mergeMap(({ from, to }) =>
        this.apiService.getRetainedEarnings(from, to).pipe(
          map((report) => FinanceActions.loadRetainedEarningsSuccess({ report })),
          catchError((error) => of(FinanceActions.loadRetainedEarningsFailure({ error })))
        )
      )
    )
  );

  loadStatementOfChangesInEquity$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FinanceActions.loadStatementOfChangesInEquity),
      mergeMap(({ from, to }) =>
        this.apiService.getStatementOfChangesInEquity(from, to).pipe(
          map((report) => FinanceActions.loadStatementOfChangesInEquitySuccess({ report })),
          catchError((error) => of(FinanceActions.loadStatementOfChangesInEquityFailure({ error })))
        )
      )
    )
  );

  loadMonthlyReport$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FinanceActions.loadMonthlyReport),
      mergeMap(({ params }) =>
        this.apiService.getMonthlyReport(params.year).pipe(
          map((report) => FinanceActions.loadMonthlyReportSuccess({ report })),
          catchError((error) => of(FinanceActions.loadMonthlyReportFailure({ error })))
        )
      )
    )
  );

  loadWeeklyReport$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FinanceActions.loadWeeklyReport),
      mergeMap(({ params }) =>
        this.apiService.getWeeklyReport(params.year).pipe(
          map((report) => FinanceActions.loadWeeklyReportSuccess({ report })),
          catchError((error) => of(FinanceActions.loadWeeklyReportFailure({ error })))
        )
      )
    )
  );
}