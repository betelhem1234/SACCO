import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, tap, switchMap } from 'rxjs/operators';
import { ShareSubscription } from '@sacco/shared-models';
import { ApiService } from '../../services/api.service';
import {
    loadShareSubscriptions, loadShareSubscriptionsSuccess, loadShareSubscriptionsFailure,
    addShareSubscription, addShareSubscriptionSuccess, addShareSubscriptionFailure,
    updateShareSubscription, updateShareSubscriptionSuccess, updateShareSubscriptionFailure,
    deleteShareSubscription, deleteShareSubscriptionSuccess, deleteShareSubscriptionFailure
} from './share-subscriptions.actions';

@Injectable({ providedIn: 'root' })
export class ShareSubscriptionsEffects {
    private actions$ = inject(Actions);
    private apiService = inject(ApiService);

    loadShareSubscriptions$ = createEffect(() =>
        this.actions$.pipe(
            ofType(loadShareSubscriptions),
            switchMap(() =>
                this.apiService.getShareSubscriptions().pipe(
                    map(shareSubscriptions => loadShareSubscriptionsSuccess({ shareSubscriptions })),
                    catchError(error => of(loadShareSubscriptionsFailure({ error })))
                )
            )
        )
    );

    addShareSubscription$ = createEffect(() =>
        this.actions$.pipe(
            ofType(addShareSubscription),
            mergeMap(action =>
                this.apiService.addShareSubscription(action.shareSubscription).pipe(
                    map((shareSubscription: ShareSubscription) => addShareSubscriptionSuccess({ shareSubscription })),
                    catchError(error => {
                        window.alert('Failed to save share subscription!');
                        return of(addShareSubscriptionFailure({ error }));
                    })
                )
            )
        )
    );

    updateShareSubscription$ = createEffect(() =>
        this.actions$.pipe(
            ofType(updateShareSubscription),
            mergeMap(action => {
                const id = action.shareSubscription.id;
                if (!id) return of(updateShareSubscriptionFailure({ error: new Error('Missing share subscription id') }));
                return this.apiService.updateShareSubscription(id, action.shareSubscription).pipe(
                    map((shareSubscription: ShareSubscription) => updateShareSubscriptionSuccess({ shareSubscription })),
                    catchError(error => {
                        window.alert('Failed to update share subscription!');
                        return of(updateShareSubscriptionFailure({ error }));
                    })
                );
            })
        )
    );

    deleteShareSubscription$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deleteShareSubscription),
            mergeMap(action =>
                this.apiService.deleteShareSubscription(action.id).pipe(
                    map(() => deleteShareSubscriptionSuccess({ id: action.id })),
                    catchError(error => {
                        window.alert('Failed to delete share subscription!');
                        return of(deleteShareSubscriptionFailure({ error }));
                    })
                )
            )
        )
    );
}
