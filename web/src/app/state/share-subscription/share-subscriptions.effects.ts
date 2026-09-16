import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, tap, switchMap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ShareSubscription } from '@sacco/shared-models';
import { ApiService } from '../../services/api.service';
import {
    loadShareSubscriptions, loadShareSubscriptionsSuccess, loadShareSubscriptionsFailure,
    addShareSubscription, addShareSubscriptionSuccess, addShareSubscriptionFailure,
    updateShareSubscription, updateShareSubscriptionSuccess, updateShareSubscriptionFailure,
    deleteShareSubscription, deleteShareSubscriptionSuccess, deleteShareSubscriptionFailure,
    approveShareSubscription, approveShareSubscriptionSuccess, approveShareSubscriptionFailure,
    rejectShareSubscription, rejectShareSubscriptionSuccess, rejectShareSubscriptionFailure,
    reverseShareSubscription, reverseShareSubscriptionSuccess, reverseShareSubscriptionFailure
} from './share-subscriptions.actions';

@Injectable({ providedIn: 'root' })
export class ShareSubscriptionsEffects {
    private actions$ = inject(Actions);
    private apiService = inject(ApiService);
    private snackBar = inject(MatSnackBar);

    private errorMessage(error: any, fallback: string): string {
        const msg = error?.error?.message || error?.message;
        return (msg && typeof msg === 'string' && !msg.includes('Http failure response')) ? msg : fallback;
    }

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
                    tap(({ shareSubscription }) => {
                        this.snackBar.open(shareSubscription.status === 'PENDING'
                            ? 'Share subscription submitted for approval'
                            : 'Share subscription saved', 'Close', { duration: 5000 });
                    }),
                    catchError(error => {
                        this.snackBar.open(this.errorMessage(error, 'Failed to save share subscription!'), 'Close', { duration: 5000 });
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
                        this.snackBar.open(this.errorMessage(error, 'Failed to update share subscription!'), 'Close', { duration: 5000 });
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
                        this.snackBar.open(this.errorMessage(error, 'Failed to delete share subscription!'), 'Close', { duration: 5000 });
                        return of(deleteShareSubscriptionFailure({ error }));
                    })
                )
            )
        )
    );

    approveShareSubscription$ = createEffect(() =>
        this.actions$.pipe(
            ofType(approveShareSubscription),
            mergeMap(action =>
                this.apiService.approveShareSubscription(action.id, action.approvedBy).pipe(
                    map((shareSubscription: ShareSubscription) => approveShareSubscriptionSuccess({ shareSubscription })),
                    tap(() => this.snackBar.open('Share subscription approved', 'Close', { duration: 5000 })),
                    catchError(error => {
                        this.snackBar.open(this.errorMessage(error, 'Failed to approve share subscription!'), 'Close', { duration: 5000 });
                        return of(approveShareSubscriptionFailure({ error }));
                    })
                )
            )
        )
    );

    rejectShareSubscription$ = createEffect(() =>
        this.actions$.pipe(
            ofType(rejectShareSubscription),
            mergeMap(action =>
                this.apiService.rejectShareSubscription(action.id).pipe(
                    map((shareSubscription: ShareSubscription) => rejectShareSubscriptionSuccess({ shareSubscription })),
                    tap(() => this.snackBar.open('Share subscription rejected', 'Close', { duration: 5000 })),
                    catchError(error => {
                        this.snackBar.open(this.errorMessage(error, 'Failed to reject share subscription!'), 'Close', { duration: 5000 });
                        return of(rejectShareSubscriptionFailure({ error }));
                    })
                )
            )
        )
    );

    reverseShareSubscription$ = createEffect(() =>
        this.actions$.pipe(
            ofType(reverseShareSubscription),
            mergeMap(action =>
                this.apiService.reverseShareSubscription(action.id).pipe(
                    map((shareSubscription: ShareSubscription) => reverseShareSubscriptionSuccess({ shareSubscription })),
                    tap(() => this.snackBar.open('Share subscription reversed to pending', 'Close', { duration: 5000 })),
                    catchError(error => {
                        this.snackBar.open(this.errorMessage(error, 'Failed to reverse share subscription!'), 'Close', { duration: 5000 });
                        return of(reverseShareSubscriptionFailure({ error }));
                    })
                )
            )
        )
    );
}
