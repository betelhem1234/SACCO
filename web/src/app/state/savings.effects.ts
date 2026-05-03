import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, tap, switchMap } from 'rxjs/operators';
import { Saving } from '@sacco/shared-models';
import { ApiService } from '../services/api.service';
import {
    loadSavings, loadSavingsSuccess, loadSavingsFailure,
    addSaving, addSavingSuccess, addSavingFailure,
    deleteSaving, deleteSavingSuccess, deleteSavingFailure
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
}
