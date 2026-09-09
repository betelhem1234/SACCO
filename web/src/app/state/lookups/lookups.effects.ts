import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { ApiService } from '../../services/api.service';
import * as LookupsActions from './lookups.actions';

@Injectable()
export class LookupsEffects {
    private actions$ = inject(Actions);
    private apiService = inject(ApiService);

    loadAccounts$ = createEffect(() =>
        this.actions$.pipe(
            ofType(LookupsActions.loadAccounts),
            mergeMap(({ accountType, accountCategory }) =>
                this.apiService.getAccounts(accountType, accountCategory).pipe(
                    map((accounts) => LookupsActions.loadAccountsSuccess({ accounts })),
                    catchError((error) => of(LookupsActions.loadAccountsFailure({ error })))
                )
            )
        )
    );

    addAccount$ = createEffect(() =>
        this.actions$.pipe(
            ofType(LookupsActions.addAccount),
            mergeMap(({ account }) =>
                this.apiService.addAccount(account).pipe(
                    map((created) => LookupsActions.addAccountSuccess({ account: created })),
                    catchError((error) => of(LookupsActions.addAccountFailure({ error })))
                )
            )
        )
    );

    updateAccount$ = createEffect(() =>
        this.actions$.pipe(
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
        )
    );

    deleteAccount$ = createEffect(() =>
        this.actions$.pipe(
            ofType(LookupsActions.deleteAccount),
            mergeMap(({ id }) =>
                this.apiService.deleteAccount(id).pipe(
                    map(() => LookupsActions.deleteAccountSuccess({ id })),
                    catchError((error) => of(LookupsActions.deleteAccountFailure({ error })))
                )
            )
        )
    );

    loadSavingTypes$ = createEffect(() =>
        this.actions$.pipe(
            ofType(LookupsActions.loadSavingTypes),
            mergeMap(() => this.apiService.getSavingTypes()
                .pipe(
                    map(savingTypes => LookupsActions.loadSavingTypesSuccess({ savingTypes })),
                    catchError(error => of(LookupsActions.loadSavingTypesFailure({ error })))
                )
            )
        )
    );

    addSavingType$ = createEffect(() =>
        this.actions$.pipe(
            ofType(LookupsActions.addSavingType),
            mergeMap(({ savingType }) => this.apiService.addSavingType(savingType)
                .pipe(
                    map(newSavingType => LookupsActions.addSavingTypeSuccess({ savingType: newSavingType })),
                    catchError(error => of(LookupsActions.addSavingTypeFailure({ error })))
                )
            )
        )
    );

    updateSavingType$ = createEffect(() =>
        this.actions$.pipe(
            ofType(LookupsActions.updateSavingType),
            mergeMap(({ savingType }) =>
                this.apiService.updateSavingType(savingType.id, savingType).pipe(
                    map((updated) => LookupsActions.updateSavingTypeSuccess({ savingType: updated })),
                    catchError((error) => of(LookupsActions.updateSavingTypeFailure({ error })))
                )
            )
        )
    );

    deleteSavingType$ = createEffect(() =>
        this.actions$.pipe(
            ofType(LookupsActions.deleteSavingType),
            mergeMap(({ id }) =>
                this.apiService.deleteSavingType(id).pipe(
                    map(() => LookupsActions.deleteSavingTypeSuccess({ id })),
                    catchError((error) => of(LookupsActions.deleteSavingTypeFailure({ error })))
                )
            )
        )
    );

    loadLoanTypes$ = createEffect(() =>
        this.actions$.pipe(
            ofType(LookupsActions.loadLoanTypes),
            mergeMap(() => this.apiService.getLoanTypes()
                .pipe(
                    map(loanTypes => LookupsActions.loadLoanTypesSuccess({ loanTypes })),
                    catchError(error => of(LookupsActions.loadLoanTypesFailure({ error })))
                )
            )
        )
    );

    addLoanType$ = createEffect(() =>
        this.actions$.pipe(
            ofType(LookupsActions.addLoanType),
            mergeMap(({ loanType }) => this.apiService.addLoanType(loanType)
                .pipe(
                    map(newLoanType => LookupsActions.addLoanTypeSuccess({ loanType: newLoanType })),
                    catchError(error => of(LookupsActions.addLoanTypeFailure({ error })))
                )
            )
        )
    );

    updateLoanType$ = createEffect(() =>
        this.actions$.pipe(
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
        )
    );

    deleteLoanType$ = createEffect(() =>
        this.actions$.pipe(
            ofType(LookupsActions.deleteLoanType),
            mergeMap(({ id }) =>
                this.apiService.deleteLoanType(id).pipe(
                    map(() => LookupsActions.deleteLoanTypeSuccess({ id })),
                    catchError((error) => of(LookupsActions.deleteLoanTypeFailure({ error })))
                )
            )
        )
    );

    // Regions
    loadRegions$ = createEffect(() =>
        this.actions$.pipe(
            ofType(LookupsActions.loadRegions),
            mergeMap(() => this.apiService.getRegions()
                .pipe(
                    map((result: any) => LookupsActions.loadRegionsSuccess({ regions: result.data || result || [] })),
                    catchError(error => of(LookupsActions.loadRegionsFailure({ error })))
                )
            )
        )
    );

    addRegion$ = createEffect(() =>
        this.actions$.pipe(
            ofType(LookupsActions.addRegion),
            mergeMap(({ region }) => this.apiService.addRegion(region)
                .pipe(
                    map((created: any) => LookupsActions.addRegionSuccess({ region: created })),
                    catchError(error => of(LookupsActions.addRegionFailure({ error })))
                )
            )
        )
    );

    updateRegion$ = createEffect(() =>
        this.actions$.pipe(
            ofType(LookupsActions.updateRegion),
            mergeMap(({ region }) => {
                const id = region.id;
                if (!id) {
                    return of(LookupsActions.updateRegionFailure({ error: new Error('Missing region id') }));
                }
                return this.apiService.updateRegion(id, region).pipe(
                    map((updated: any) => LookupsActions.updateRegionSuccess({ region: updated })),
                    catchError(error => of(LookupsActions.updateRegionFailure({ error })))
                );
            })
        )
    );

    deleteRegion$ = createEffect(() =>
        this.actions$.pipe(
            ofType(LookupsActions.deleteRegion),
            mergeMap(({ id }) =>
                this.apiService.deleteRegion(id).pipe(
                    map(() => LookupsActions.deleteRegionSuccess({ id })),
                    catchError(error => of(LookupsActions.deleteRegionFailure({ error })))
                )
            )
        )
    );

    // Subcities
    loadSubcities$ = createEffect(() =>
        this.actions$.pipe(
            ofType(LookupsActions.loadSubcities),
            mergeMap(() => this.apiService.getSubcities()
                .pipe(
                    map((result: any) => LookupsActions.loadSubcitiesSuccess({ subcities: result.data || result || [] })),
                    catchError(error => of(LookupsActions.loadSubcitiesFailure({ error })))
                )
            )
        )
    );

    addSubcity$ = createEffect(() =>
        this.actions$.pipe(
            ofType(LookupsActions.addSubcity),
            mergeMap(({ subcity }) => this.apiService.addSubcity(subcity)
                .pipe(
                    map((created: any) => LookupsActions.addSubcitySuccess({ subcity: created })),
                    catchError(error => of(LookupsActions.addSubcityFailure({ error })))
                )
            )
        )
    );

    updateSubcity$ = createEffect(() =>
        this.actions$.pipe(
            ofType(LookupsActions.updateSubcity),
            mergeMap(({ subcity }) => {
                const id = subcity.id;
                if (!id) {
                    return of(LookupsActions.updateSubcityFailure({ error: new Error('Missing subcity id') }));
                }
                return this.apiService.updateSubcity(id, subcity).pipe(
                    map((updated: any) => LookupsActions.updateSubcitySuccess({ subcity: updated })),
                    catchError(error => of(LookupsActions.updateSubcityFailure({ error })))
                );
            })
        )
    );

    deleteSubcity$ = createEffect(() =>
        this.actions$.pipe(
            ofType(LookupsActions.deleteSubcity),
            mergeMap(({ id }) =>
                this.apiService.deleteSubcity(id).pipe(
                    map(() => LookupsActions.deleteSubcitySuccess({ id })),
                    catchError(error => of(LookupsActions.deleteSubcityFailure({ error })))
                )
            )
        )
    );

    // Educations
    loadEducations$ = createEffect(() =>
        this.actions$.pipe(
            ofType(LookupsActions.loadEducations),
            mergeMap(() => this.apiService.getEducations()
                .pipe(
                    map((result: any) => LookupsActions.loadEducationsSuccess({ educations: result.data || result || [] })),
                    catchError(error => of(LookupsActions.loadEducationsFailure({ error })))
                )
            )
        )
    );

    addEducation$ = createEffect(() =>
        this.actions$.pipe(
            ofType(LookupsActions.addEducation),
            mergeMap(({ education }) => this.apiService.addEducation(education)
                .pipe(
                    map((created: any) => LookupsActions.addEducationSuccess({ education: created })),
                    catchError(error => of(LookupsActions.addEducationFailure({ error })))
                )
            )
        )
    );

    updateEducation$ = createEffect(() =>
        this.actions$.pipe(
            ofType(LookupsActions.updateEducation),
            mergeMap(({ education }) => {
                const id = education.id;
                if (!id) {
                    return of(LookupsActions.updateEducationFailure({ error: new Error('Missing education id') }));
                }
                return this.apiService.updateEducation(id, education).pipe(
                    map((updated: any) => LookupsActions.updateEducationSuccess({ education: updated })),
                    catchError(error => of(LookupsActions.updateEducationFailure({ error })))
                );
            })
        )
    );

    deleteEducation$ = createEffect(() =>
        this.actions$.pipe(
            ofType(LookupsActions.deleteEducation),
            mergeMap(({ id }) =>
                this.apiService.deleteEducation(id).pipe(
                    map(() => LookupsActions.deleteEducationSuccess({ id })),
                    catchError(error => of(LookupsActions.deleteEducationFailure({ error })))
                )
            )
        )
    );

    // Branches
    loadBranches$ = createEffect(() =>
        this.actions$.pipe(
            ofType(LookupsActions.loadBranches),
            mergeMap(() => this.apiService.getBranches()
                .pipe(
                    map((result: any) => LookupsActions.loadBranchesSuccess({ branches: result.data || result || [] })),
                    catchError(error => of(LookupsActions.loadBranchesFailure({ error })))
                )
            )
        )
    );

    loadAccountClassifications$ = createEffect(() =>
        this.actions$.pipe(
            ofType(LookupsActions.loadAccountClassifications),
            mergeMap(() => this.apiService.getAccountClassifications()
                .pipe(
                    map((accountClassifications) => LookupsActions.loadAccountClassificationsSuccess({ accountClassifications })),
                    catchError(error => of(LookupsActions.loadAccountClassificationsFailure({ error })))
                )
            )
        )
    );

    addAccountClassification$ = createEffect(() =>
        this.actions$.pipe(
            ofType(LookupsActions.addAccountClassification),
            mergeMap(({ accountClassification }) => this.apiService.addAccountClassification(accountClassification)
                .pipe(
                    map((created) => LookupsActions.addAccountClassificationSuccess({ accountClassification: created })),
                    catchError(error => of(LookupsActions.addAccountClassificationFailure({ error })))
                )
            )
        )
    );

    updateAccountClassification$ = createEffect(() =>
        this.actions$.pipe(
            ofType(LookupsActions.updateAccountClassification),
            mergeMap(({ accountClassification }) => {
                const id = accountClassification.id;
                if (!id) {
                    return of(LookupsActions.updateAccountClassificationFailure({ error: new Error('Missing id') }));
                }
                return this.apiService.updateAccountClassification(id, accountClassification).pipe(
                    map((updated) => LookupsActions.updateAccountClassificationSuccess({ accountClassification: updated })),
                    catchError(error => of(LookupsActions.updateAccountClassificationFailure({ error })))
                );
            })
        )
    );

    deleteAccountClassification$ = createEffect(() =>
        this.actions$.pipe(
            ofType(LookupsActions.deleteAccountClassification),
            mergeMap(({ id }) =>
                this.apiService.deleteAccountClassification(id).pipe(
                    map(() => LookupsActions.deleteAccountClassificationSuccess({ id })),
                    catchError(error => of(LookupsActions.deleteAccountClassificationFailure({ error })))
                )
            )
        )
    );
}
