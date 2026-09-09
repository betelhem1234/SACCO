import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, tap, switchMap } from 'rxjs/operators';
import { ShareTransfer } from '@sacco/shared-models';
import { ApiService } from '../../services/api.service';
import {
    loadShareTransfers, loadShareTransfersSuccess, loadShareTransfersFailure,
    addShareTransfer, addShareTransferSuccess, addShareTransferFailure,
    updateShareTransfer, updateShareTransferSuccess, updateShareTransferFailure,
    deleteShareTransfer, deleteShareTransferSuccess, deleteShareTransferFailure
} from './share-transfers.actions';

@Injectable({ providedIn: 'root' })
export class ShareTransfersEffects {
    private actions$ = inject(Actions);
    private apiService = inject(ApiService);

    loadShareTransfers$ = createEffect(() =>
        this.actions$.pipe(
            ofType(loadShareTransfers),
            switchMap(() =>
                this.apiService.getShareTransfers().pipe(
                    map(shareTransfers => loadShareTransfersSuccess({ shareTransfers })),
                    catchError(error => of(loadShareTransfersFailure({ error })))
                )
            )
        )
    );

    addShareTransfer$ = createEffect(() =>
        this.actions$.pipe(
            ofType(addShareTransfer),
            mergeMap(action =>
                this.apiService.addShareTransfer(action.shareTransfer).pipe(
                    map((shareTransfer: ShareTransfer) => addShareTransferSuccess({ shareTransfer })),
                    catchError(error => {
                        window.alert('Failed to record share transfer!');
                        return of(addShareTransferFailure({ error }));
                    })
                )
            )
        )
    );

    updateShareTransfer$ = createEffect(() =>
        this.actions$.pipe(
            ofType(updateShareTransfer),
            mergeMap(action => {
                const id = action.shareTransfer.id;
                if (!id) return of(updateShareTransferFailure({ error: new Error('Missing share transfer id') }));
                return this.apiService.updateShareTransfer(id, action.shareTransfer).pipe(
                    map((shareTransfer: ShareTransfer) => updateShareTransferSuccess({ shareTransfer })),
                    catchError(error => {
                        window.alert('Failed to update share transfer!');
                        return of(updateShareTransferFailure({ error }));
                    })
                );
            })
        )
    );

    deleteShareTransfer$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deleteShareTransfer),
            mergeMap(action =>
                this.apiService.deleteShareTransfer(action.id).pipe(
                    map(() => deleteShareTransferSuccess({ id: action.id })),
                    catchError(error => {
                        window.alert('Failed to delete share transfer!');
                        return of(deleteShareTransferFailure({ error }));
                    })
                )
            )
        )
    );
}
