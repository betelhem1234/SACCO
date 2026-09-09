import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, tap, switchMap } from 'rxjs/operators';
import { Saving } from '@sacco/shared-models';
import { ApiService } from '../../services/api.service';
import { httpErrorMessage } from '../../utils/http-error-message';
import {
    loadSavings, loadSavingsSuccess, loadSavingsFailure,
    addSaving, addSavingSuccess, addSavingFailure,
    updateSaving, updateSavingSuccess, updateSavingFailure,
    deleteSaving, deleteSavingSuccess, deleteSavingFailure,
    approveSaving, approveSavingSuccess, approveSavingFailure,
    rejectSaving, rejectSavingSuccess, rejectSavingFailure
} from './savings.actions';

@Injectable({ providedIn: 'root' })
export class SavingsEffects {
    private actions$ = inject(Actions);
    private apiService = inject(ApiService);

    loadSavings$ = createEffect(() =>
        this.actions$.pipe(
            ofType(loadSavings),
            switchMap(() =>
                this.apiService.getSavings().pipe(
                    map(savings => loadSavingsSuccess({ savings })),
                    catchError(error => of(loadSavingsFailure({ error })))
                )
            )
        )
    );

    addSaving$ = createEffect(() =>
        this.actions$.pipe(
            ofType(addSaving),
            mergeMap(action =>
                this.apiService.addSaving(action.saving).pipe(
                    map((saving: Saving) => addSavingSuccess({ saving })),
                    tap(() => {
                        window.alert("Saving successfully recorded");
                    }),
                    catchError(error => {
                        window.alert("Failed to record saving!");
                        return of(addSavingFailure({ error }));
                    })
                )
            )
        )
    );

    updateSaving$ = createEffect(() =>
        this.actions$.pipe(
            ofType(updateSaving),
            mergeMap((action) => {
                const id = action.saving.id;
                if (!id) {
                    return of(updateSavingFailure({ error: new Error('Missing saving id') }));
                }
                return this.apiService.updateSaving(id, action.saving).pipe(
                    map((saving: Saving) => updateSavingSuccess({ saving })),
                    tap(() => window.alert('Saving updated successfully')),
                    catchError((error) => {
                        window.alert(httpErrorMessage(error, 'Failed to update saving.'));
                        return of(updateSavingFailure({ error }));
                    })
                );
            })
        )
    );

    deleteSaving$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deleteSaving),
            mergeMap(action =>
                this.apiService.deleteSaving(action.id).pipe(
                    map(() => deleteSavingSuccess({ id: action.id })),
                    tap(() => {
                        window.alert("Saving successfully deleted");
                    }),
                    catchError(error => {
                        window.alert("Failed to delete saving!");
                        return of(deleteSavingFailure({ error }));
                    })
                )
            )
        )
    );

    approveSaving$ = createEffect(() =>
        this.actions$.pipe(
            ofType(approveSaving),
            mergeMap(action =>
                this.apiService.approveSaving(action.id).pipe(
                    map((saving: Saving) => approveSavingSuccess({ saving })),
                    tap(() => {
                        window.alert("Saving approved and posted to ledger");
                    }),
                    catchError(error => {
                        window.alert(httpErrorMessage(error, "Failed to approve saving."));
                        return of(approveSavingFailure({ error }));
                    })
                )
            )
        )
    );

    rejectSaving$ = createEffect(() =>
        this.actions$.pipe(
            ofType(rejectSaving),
            mergeMap(action =>
                this.apiService.rejectSaving(action.id).pipe(
                    map((saving: Saving) => rejectSavingSuccess({ saving })),
                    tap(() => {
                        window.alert("Saving rejected");
                    }),
                    catchError(error => {
                        window.alert(httpErrorMessage(error, "Failed to reject saving."));
                        return of(rejectSavingFailure({ error }));
                    })
                )
            )
        )
    );
}
