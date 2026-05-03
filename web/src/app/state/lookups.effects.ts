import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { ApiService } from '../services/api.service';
import * as LookupsActions from './lookups.actions';

@Injectable()
export class LookupsEffects {
    private actions$ = inject(Actions);
    private apiService = inject(ApiService);

    loadBanks$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(LookupsActions.loadBanks),
            mergeMap(() => this.apiService.getBanks()
                .pipe(
                    map(banks => LookupsActions.loadBanksSuccess({ banks })),
                    catchError(error => of(LookupsActions.loadBanksFailure({ error })))
                )
            )
        );
    });

    addBank$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(LookupsActions.addBank),
            mergeMap(({ bank }) => this.apiService.addBank(bank)
                .pipe(
                    map(newBank => LookupsActions.addBankSuccess({ bank: newBank })),
                    catchError(error => of(LookupsActions.addBankFailure({ error })))
                )
            )
        );
    });

    loadSavingTypes$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(LookupsActions.loadSavingTypes),
            mergeMap(() => this.apiService.getSavingTypes()
                .pipe(
                    map(savingTypes => LookupsActions.loadSavingTypesSuccess({ savingTypes })),
                    catchError(error => of(LookupsActions.loadSavingTypesFailure({ error })))
                )
            )
        );
    });

    addSavingType$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(LookupsActions.addSavingType),
            mergeMap(({ savingType }) => this.apiService.addSavingType(savingType)
                .pipe(
                    map(newSavingType => LookupsActions.addSavingTypeSuccess({ savingType: newSavingType })),
                    catchError(error => of(LookupsActions.addSavingTypeFailure({ error })))
                )
            )
        );
    });
}
