import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, tap, switchMap } from 'rxjs/operators';
import { Transfer } from '@sacco/shared-models';
import { ApiService } from '../../services/api.service';
import {
    loadTransfers, loadTransfersSuccess, loadTransfersFailure,
    addTransfer, addTransferSuccess, addTransferFailure,
    updateTransfer, updateTransferSuccess, updateTransferFailure,
    deleteTransfer, deleteTransferSuccess, deleteTransferFailure,
    approveTransfer, approveTransferSuccess, approveTransferFailure,
    rejectTransfer, rejectTransferSuccess, rejectTransferFailure,
    executeTransfer, executeTransferSuccess, executeTransferFailure,
    payTransferFee, payTransferFeeSuccess, payTransferFeeFailure
} from './transfers.actions';

@Injectable({ providedIn: 'root' })
export class TransfersEffects {
    private actions$ = inject(Actions);
    private apiService = inject(ApiService);

    loadTransfers$ = createEffect(() =>
        this.actions$.pipe(
            ofType(loadTransfers),
            switchMap(() =>
                this.apiService.getTransfers().pipe(
                    map(transfers => loadTransfersSuccess({ transfers })),
                    catchError(error => of(loadTransfersFailure({ error })))
                )
            )
        )
    );

    addTransfer$ = createEffect(() =>
        this.actions$.pipe(
            ofType(addTransfer),
            mergeMap(action =>
                this.apiService.addTransfer(action.transfer).pipe(
                    map((transfer: Transfer) => addTransferSuccess({ transfer })),
                    tap(() => window.alert('Transfer successfully recorded')),
                    catchError(error => {
                        window.alert('Failed to record transfer!');
                        return of(addTransferFailure({ error }));
                    })
                )
            )
        )
    );

    updateTransfer$ = createEffect(() =>
        this.actions$.pipe(
            ofType(updateTransfer),
            mergeMap(action => {
                const id = action.transfer.id;
                if (!id) return of(updateTransferFailure({ error: new Error('Missing transfer id') }));
                return this.apiService.updateTransfer(id, action.transfer).pipe(
                    map((transfer: Transfer) => updateTransferSuccess({ transfer })),
                    tap(() => window.alert('Transfer updated successfully')),
                    catchError(error => {
                        window.alert('Failed to update transfer!');
                        return of(updateTransferFailure({ error }));
                    })
                );
            })
        )
    );

    deleteTransfer$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deleteTransfer),
            mergeMap(action =>
                this.apiService.deleteTransfer(action.id).pipe(
                    map(() => deleteTransferSuccess({ id: action.id })),
                    tap(() => window.alert('Transfer deleted successfully')),
                    catchError(error => {
                        window.alert('Failed to delete transfer!');
                        return of(deleteTransferFailure({ error }));
                    })
                )
            )
        )
    );

    approveTransfer$ = createEffect(() =>
        this.actions$.pipe(
            ofType(approveTransfer),
            mergeMap(action =>
                this.apiService.approveTransfer(action.id, action.approvedBy).pipe(
                    map((transfer: Transfer) => approveTransferSuccess({ transfer })),
                    tap(() => window.alert('Transfer approved')),
                    catchError(error => {
                        window.alert('Failed to approve transfer!');
                        return of(approveTransferFailure({ error }));
                    })
                )
            )
        )
    );

    rejectTransfer$ = createEffect(() =>
        this.actions$.pipe(
            ofType(rejectTransfer),
            mergeMap(action =>
                this.apiService.rejectTransfer(action.id).pipe(
                    map((transfer: Transfer) => rejectTransferSuccess({ transfer })),
                    tap(() => window.alert('Transfer rejected')),
                    catchError(error => {
                        window.alert('Failed to reject transfer!');
                        return of(rejectTransferFailure({ error }));
                    })
                )
            )
        )
    );

    executeTransfer$ = createEffect(() =>
        this.actions$.pipe(
            ofType(executeTransfer),
            mergeMap(action =>
                this.apiService.executeTransfer(action.id, action.executedBy).pipe(
                    map((transfer: Transfer) => executeTransferSuccess({ transfer })),
                    tap(() => window.alert('Transfer executed and posted to ledger')),
                    catchError(error => {
                        window.alert('Failed to execute transfer!');
                        return of(executeTransferFailure({ error }));
                    })
                )
            )
        )
    );

    payTransferFee$ = createEffect(() =>
        this.actions$.pipe(
            ofType(payTransferFee),
            mergeMap(action =>
                this.apiService.payTransferFee(action.id, {
                    feePaidBy: action.feePaidBy,
                    feeReference: action.feeReference
                }).pipe(
                    map((transfer: Transfer) => payTransferFeeSuccess({ transfer })),
                    tap(() => window.alert('Transfer service fee recorded')),
                    catchError(error => {
                        window.alert('Failed to record transfer service fee!');
                        return of(payTransferFeeFailure({ error }));
                    })
                )
            )
        )
    );
}
