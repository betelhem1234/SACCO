import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, map, mergeMap, of } from 'rxjs';
import { ApiService } from '../services/api.service';
import { httpErrorMessage } from '../utils/http-error-message';
import * as LookupsActions from './lookups.actions';

@Injectable()
export class LookupsEffects {
    private actions$ = inject(Actions);
    private apiService = inject(ApiService);
    private snackBar = inject(MatSnackBar);

    loadAccounts$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(LookupsActions.loadAccounts),
            mergeMap(({ accountType, accountCategory }) =>
                this.apiService.getAccounts(accountType, accountCategory).pipe(
                    map((accounts) => LookupsActions.loadAccountsSuccess({ accounts })),
                    catchError((error) => of(LookupsActions.loadAccountsFailure({ error })))
                )
            )
        );
    });

    addAccount$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(LookupsActions.addAccount),
            mergeMap(({ account }) =>
                this.apiService.addAccount(account).pipe(
                    map((created) => LookupsActions.addAccountSuccess({ account: created })),
                    catchError((error) => of(LookupsActions.addAccountFailure({ error })))
                )
            )
        );
    });

    updateAccount$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(LookupsActions.updateAccount),
            mergeMap(({ account }) => {
                const id = account.id;
                if (!id) {
                    return of(LookupsActions.updateAccountFailure({ error: new Error('Missing account id') }));
                }
                return this.apiService.updateAccount(id, account).pipe(
                    map((updated) => LookupsActions.updateAccountSuccess({ account: updated })),
                    catchError((error) => of(LookupsActions.updateAccountFailure({ error })))
                );
            })
        );
    });

    deleteAccount$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(LookupsActions.deleteAccount),
            mergeMap(({ id }) =>
                this.apiService.deleteAccount(id).pipe(
                    map(() => LookupsActions.deleteAccountSuccess({ id })),
                    catchError((error) => {
                        this.snackBar.open(
                            httpErrorMessage(error, 'Could not delete account.'),
                            'Dismiss',
                            { duration: 8000 }
                        );
                        return of(LookupsActions.deleteAccountFailure({ error }));
                    })
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

    updateSavingType$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(LookupsActions.updateSavingType),
            mergeMap(({ savingType }) =>
                this.apiService.updateSavingType(savingType.id, savingType).pipe(
                    map((updated) => LookupsActions.updateSavingTypeSuccess({ savingType: updated })),
                    catchError((error) => of(LookupsActions.updateSavingTypeFailure({ error })))
                )
            )
        );
    });

    deleteSavingType$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(LookupsActions.deleteSavingType),
            mergeMap(({ id }) =>
                this.apiService.deleteSavingType(id).pipe(
                    map(() => LookupsActions.deleteSavingTypeSuccess({ id })),
                    catchError((error) => {
                        this.snackBar.open(
                            httpErrorMessage(error, 'Could not delete saving type.'),
                            'Dismiss',
                            { duration: 8000 }
                        );
                        return of(LookupsActions.deleteSavingTypeFailure({ error }));
                    })
                )
            )
        );
    });

    loadLoanTypes$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(LookupsActions.loadLoanTypes),
            mergeMap(() => this.apiService.getLoanTypes()
                .pipe(
                    map(loanTypes => LookupsActions.loadLoanTypesSuccess({ loanTypes })),
                    catchError(error => of(LookupsActions.loadLoanTypesFailure({ error })))
                )
            )
        );
    });

    addLoanType$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(LookupsActions.addLoanType),
            mergeMap(({ loanType }) => this.apiService.addLoanType(loanType)
                .pipe(
                    map(newLoanType => LookupsActions.addLoanTypeSuccess({ loanType: newLoanType })),
                    catchError(error => of(LookupsActions.addLoanTypeFailure({ error })))
                )
            )
        );
    });

    updateLoanType$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(LookupsActions.updateLoanType),
            mergeMap(({ loanType }) => {
                const id = loanType.id;
                if (!id) {
                    return of(LookupsActions.updateLoanTypeFailure({ error: new Error('Missing id') }));
                }
                return this.apiService.updateLoanType(id, loanType).pipe(
                    map((updated) => LookupsActions.updateLoanTypeSuccess({ loanType: updated })),
                    catchError((error) => of(LookupsActions.updateLoanTypeFailure({ error })))
                );
            })
        );
    });

    deleteLoanType$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(LookupsActions.deleteLoanType),
            mergeMap(({ id }) =>
                this.apiService.deleteLoanType(id).pipe(
                    map(() => LookupsActions.deleteLoanTypeSuccess({ id })),
                    catchError((error) => {
                        this.snackBar.open(
                            httpErrorMessage(error, 'Could not delete loan type.'),
                            'Dismiss',
                            { duration: 8000 }
                        );
                        return of(LookupsActions.deleteLoanTypeFailure({ error }));
                    })
                )
            )
        );
    });
}
