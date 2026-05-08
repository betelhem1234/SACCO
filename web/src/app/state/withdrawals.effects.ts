import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, tap, switchMap } from 'rxjs/operators';
import { Withdrawal } from '@sacco/shared-models';
import { ApiService } from '../services/api.service';
import {
    loadWithdrawals, loadWithdrawalsSuccess, loadWithdrawalsFailure,
    addWithdrawal, addWithdrawalSuccess, addWithdrawalFailure,
    updateWithdrawal, updateWithdrawalSuccess, updateWithdrawalFailure,
    deleteWithdrawal, deleteWithdrawalSuccess, deleteWithdrawalFailure
} from './withdrawals.actions';

@Injectable({ providedIn: 'root' })
export class WithdrawalsEffects {
    private actions$ = inject(Actions);
    private apiService = inject(ApiService);

    loadWithdrawals$ = createEffect(() =>
        this.actions$.pipe(
            ofType(loadWithdrawals),
            switchMap(() =>
                this.apiService.getWithdrawals().pipe(
                    map(withdrawals => loadWithdrawalsSuccess({ withdrawals })),
                    catchError(error => of(loadWithdrawalsFailure({ error })))
                )
            )
        )
    );

    addWithdrawal$ = createEffect(() =>
        this.actions$.pipe(
            ofType(addWithdrawal),
            mergeMap(action =>
                this.apiService.addWithdrawal(action.withdrawal).pipe(
                    map((withdrawal: Withdrawal) => addWithdrawalSuccess({ withdrawal })),
                    tap(() => window.alert('Withdrawal successfully recorded')),
                    catchError(error => {
                        window.alert('Failed to record withdrawal!');
                        return of(addWithdrawalFailure({ error }));
                    })
                )
            )
        )
    );

    updateWithdrawal$ = createEffect(() =>
        this.actions$.pipe(
            ofType(updateWithdrawal),
            mergeMap(action => {
                const id = action.withdrawal.id;
                if (!id) return of(updateWithdrawalFailure({ error: new Error('Missing withdrawal id') }));
                return this.apiService.updateWithdrawal(id, action.withdrawal).pipe(
                    map((withdrawal: Withdrawal) => updateWithdrawalSuccess({ withdrawal })),
                    tap(() => window.alert('Withdrawal updated successfully')),
                    catchError(error => {
                        window.alert('Failed to update withdrawal!');
                        return of(updateWithdrawalFailure({ error }));
                    })
                );
            })
        )
    );

    deleteWithdrawal$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deleteWithdrawal),
            mergeMap(action =>
                this.apiService.deleteWithdrawal(action.id).pipe(
                    map(() => deleteWithdrawalSuccess({ id: action.id })),
                    tap(() => window.alert('Withdrawal deleted successfully')),
                    catchError(error => {
                        window.alert('Failed to delete withdrawal!');
                        return of(deleteWithdrawalFailure({ error }));
                    })
                )
            )
        )
    );
}
