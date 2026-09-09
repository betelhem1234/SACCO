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
    deleteTransfer, deleteTransferSuccess, deleteTransferFailure
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
}
