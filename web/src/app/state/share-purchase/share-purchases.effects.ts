import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, tap, switchMap } from 'rxjs/operators';
import { SharePurchase } from '@sacco/shared-models';
import { ApiService } from '../../services/api.service';
import {
    loadSharePurchases, loadSharePurchasesSuccess, loadSharePurchasesFailure,
    addSharePurchase, addSharePurchaseSuccess, addSharePurchaseFailure,
    updateSharePurchase, updateSharePurchaseSuccess, updateSharePurchaseFailure,
    deleteSharePurchase, deleteSharePurchaseSuccess, deleteSharePurchaseFailure
} from './share-purchases.actions';

@Injectable({ providedIn: 'root' })
export class SharePurchasesEffects {
    private actions$ = inject(Actions);
    private apiService = inject(ApiService);

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
                    catchError(error => {
                        window.alert('Failed to save share purchase!');
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
                        window.alert('Failed to update share purchase!');
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
}
