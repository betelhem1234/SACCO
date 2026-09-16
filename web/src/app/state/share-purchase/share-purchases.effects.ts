import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, tap, switchMap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SharePurchase } from '@sacco/shared-models';
import { ApiService } from '../../services/api.service';
import {
    loadSharePurchases, loadSharePurchasesSuccess, loadSharePurchasesFailure,
    addSharePurchase, addSharePurchaseSuccess, addSharePurchaseFailure,
    updateSharePurchase, updateSharePurchaseSuccess, updateSharePurchaseFailure,
    deleteSharePurchase, deleteSharePurchaseSuccess, deleteSharePurchaseFailure,
    approveSharePurchase, approveSharePurchaseSuccess, approveSharePurchaseFailure,
    rejectSharePurchase, rejectSharePurchaseSuccess, rejectSharePurchaseFailure,
    reverseSharePurchase, reverseSharePurchaseSuccess, reverseSharePurchaseFailure
} from './share-purchases.actions';

@Injectable({ providedIn: 'root' })
export class SharePurchasesEffects {
    private actions$ = inject(Actions);
    private apiService = inject(ApiService);
    private snackBar = inject(MatSnackBar);

    private errorMessage(error: any, fallback: string): string {
        const msg = error?.error?.message || error?.message;
        return (msg && typeof msg === 'string' && !msg.includes('Http failure response')) ? msg : fallback;
    }

    loadSharePurchases$ = createEffect(() =>
        this.actions$.pipe(
            ofType(loadSharePurchases),
            switchMap(() =>
                this.apiService.getSharePurchases().pipe(
                    map(sharePurchases => loadSharePurchasesSuccess({ sharePurchases })),
                    catchError(error => of(loadSharePurchasesFailure({ error })))
                )
            )
        )
    );

    addSharePurchase$ = createEffect(() =>
        this.actions$.pipe(
            ofType(addSharePurchase),
            mergeMap(action =>
                this.apiService.addSharePurchase(action.sharePurchase).pipe(
                    map((sharePurchase: SharePurchase) => addSharePurchaseSuccess({ sharePurchase })),
                    tap(({ sharePurchase }) => {
                        this.snackBar.open(sharePurchase.status === 'PENDING'
                            ? 'Share purchase submitted for approval'
                            : 'Share purchase saved and posted to ledger', 'Close', { duration: 5000 });
                    }),
                    catchError(error => {
                        this.snackBar.open(this.errorMessage(error, 'Failed to save share purchase!'), 'Close', { duration: 5000 });
                        return of(addSharePurchaseFailure({ error }));
                    })
                )
            )
        )
    );

    updateSharePurchase$ = createEffect(() =>
        this.actions$.pipe(
            ofType(updateSharePurchase),
            mergeMap(action => {
                const id = action.sharePurchase.id;
                if (!id) return of(updateSharePurchaseFailure({ error: new Error('Missing share purchase id') }));
                return this.apiService.updateSharePurchase(id, action.sharePurchase).pipe(
                    map((sharePurchase: SharePurchase) => updateSharePurchaseSuccess({ sharePurchase })),
                    catchError(error => {
                        this.snackBar.open(this.errorMessage(error, 'Failed to update share purchase!'), 'Close', { duration: 5000 });
                        return of(updateSharePurchaseFailure({ error }));
                    })
                );
            })
        )
    );

    deleteSharePurchase$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deleteSharePurchase),
            mergeMap(action =>
                this.apiService.deleteSharePurchase(action.id).pipe(
                    map(() => deleteSharePurchaseSuccess({ id: action.id })),
                    catchError(error => {
                        window.alert('Failed to delete share purchase!');
                        return of(deleteSharePurchaseFailure({ error }));
                    })
                )
            )
        )
    );

    approveSharePurchase$ = createEffect(() =>
        this.actions$.pipe(
            ofType(approveSharePurchase),
            mergeMap(action =>
                this.apiService.approveSharePurchase(action.id, action.approvedBy).pipe(
                    map((sharePurchase: SharePurchase) => approveSharePurchaseSuccess({ sharePurchase })),
                    tap(() => this.snackBar.open('Share purchase approved and posted to ledger', 'Close', { duration: 5000 })),
                    catchError(error => {
                        this.snackBar.open(this.errorMessage(error, 'Failed to approve share purchase!'), 'Close', { duration: 5000 });
                        return of(approveSharePurchaseFailure({ error }));
                    })
                )
            )
        )
    );

    rejectSharePurchase$ = createEffect(() =>
        this.actions$.pipe(
            ofType(rejectSharePurchase),
            mergeMap(action =>
                this.apiService.rejectSharePurchase(action.id).pipe(
                    map((sharePurchase: SharePurchase) => rejectSharePurchaseSuccess({ sharePurchase })),
                    tap(() => this.snackBar.open('Share purchase rejected', 'Close', { duration: 5000 })),
                    catchError(error => {
                        this.snackBar.open(this.errorMessage(error, 'Failed to reject share purchase!'), 'Close', { duration: 5000 });
                        return of(rejectSharePurchaseFailure({ error }));
                    })
                )
            )
        )
    );

    reverseSharePurchase$ = createEffect(() =>
        this.actions$.pipe(
            ofType(reverseSharePurchase),
            mergeMap(action =>
                this.apiService.reverseSharePurchase(action.id).pipe(
                    map((sharePurchase: SharePurchase) => reverseSharePurchaseSuccess({ sharePurchase })),
                    tap(() => this.snackBar.open('Share purchase reversed to pending', 'Close', { duration: 5000 })),
                    catchError(error => {
                        this.snackBar.open(this.errorMessage(error, 'Failed to reverse share purchase!'), 'Close', { duration: 5000 });
                        return of(reverseSharePurchaseFailure({ error }));
                    })
                )
            )
        )
    );
}
