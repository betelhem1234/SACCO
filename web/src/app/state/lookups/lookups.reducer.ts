import { createReducer, on } from '@ngrx/store';
import { Account, SavingType, SharedLoanType, AccountClassification } from '@sacco/shared-models';
import * as LookupsActions from './lookups.actions';
import { LookupItem } from './lookups.actions';

export interface LookupsState {
    accounts: Account[];
    savingTypes: SavingType[];
    loanTypes: SharedLoanType[];
    regions: LookupItem[];
    subcities: LookupItem[];
    educations: LookupItem[];
    branches: LookupItem[];
    accountClassifications: AccountClassification[];
    status: 'idle' | 'loading' | 'success' | 'error';
    error: any;
}

export const initialLookupsState: LookupsState = {
    accounts: [],
    savingTypes: [],
    loanTypes: [],
    regions: [],
    subcities: [],
    educations: [],
    branches: [],
    accountClassifications: [],
    status: 'idle',
    error: null
};

export const lookupsReducer = createReducer(
    initialLookupsState,
    on(LookupsActions.loadAccounts, (state) => ({ ...state, status: 'loading' as const })),
    on(LookupsActions.loadAccountsSuccess, (state, { accounts }) => ({ ...state, accounts, status: 'success' as const })),
    on(LookupsActions.loadAccountsFailure, (state, { error }) => ({ ...state, error, status: 'error' as const })),

    on(LookupsActions.loadSavingTypes, (state) => ({ ...state, status: 'loading' as const })),
    on(LookupsActions.loadSavingTypesSuccess, (state, { savingTypes }) => ({ ...state, savingTypes, status: 'success' as const })),
    on(LookupsActions.loadSavingTypesFailure, (state, { error }) => ({ ...state, error, status: 'error' as const })),

    on(LookupsActions.addAccountSuccess, (state, { account }) => ({
        ...state,
        accounts: [...state.accounts, account],
        status: 'success' as const
    })),
    on(LookupsActions.updateAccountSuccess, (state, { account }) => ({
        ...state,
        accounts: state.accounts.map((a) => (a.id === account.id ? account : a)),
        status: 'success' as const
    })),
    on(LookupsActions.deleteAccountSuccess, (state, { id }) => ({
        ...state,
        accounts: state.accounts.filter((a) => a.id !== id),
        status: 'success' as const
    })),

    on(LookupsActions.addSavingTypeSuccess, (state, { savingType }) => ({
        ...state,
        savingTypes: [...state.savingTypes, savingType],
        status: 'success' as const
    })),
    on(LookupsActions.updateSavingTypeSuccess, (state, { savingType }) => ({
        ...state,
        savingTypes: state.savingTypes.map((t) => (t.id === savingType.id ? savingType : t)),
        status: 'success' as const
    })),
    on(LookupsActions.deleteSavingTypeSuccess, (state, { id }) => ({
        ...state,
        savingTypes: state.savingTypes.filter((t) => t.id !== id),
        status: 'success' as const
    })),

    on(LookupsActions.loadLoanTypes, (state) => ({ ...state, status: 'loading' as const })),
    on(LookupsActions.loadLoanTypesSuccess, (state, { loanTypes }) => ({ ...state, loanTypes, status: 'success' as const })),
    on(LookupsActions.loadLoanTypesFailure, (state, { error }) => ({ ...state, error, status: 'error' as const })),

    on(LookupsActions.addLoanTypeSuccess, (state, { loanType }) => ({
        ...state,
        loanTypes: [...state.loanTypes, loanType],
        status: 'success' as const
    })),
    on(LookupsActions.updateLoanTypeSuccess, (state, { loanType }) => ({
        ...state,
        loanTypes: state.loanTypes.map((t) => (t.id === loanType.id ? loanType : t)),
        status: 'success' as const
    })),
    on(LookupsActions.deleteLoanTypeSuccess, (state, { id }) => ({
        ...state,
        loanTypes: state.loanTypes.filter((t) => t.id !== id),
        status: 'success' as const
    })),

    // Regions
    on(LookupsActions.loadRegions, (state) => ({ ...state, status: 'loading' as const })),
    on(LookupsActions.loadRegionsSuccess, (state, { regions }) => ({ ...state, regions, status: 'success' as const })),
    on(LookupsActions.loadRegionsFailure, (state, { error }) => ({ ...state, error, status: 'error' as const })),
    on(LookupsActions.addRegionSuccess, (state, { region }) => ({
        ...state, regions: [...state.regions, region], status: 'success' as const
    })),
    on(LookupsActions.updateRegionSuccess, (state, { region }) => ({
        ...state, regions: state.regions.map((r) => (r.id === region.id ? region : r)), status: 'success' as const
    })),
    on(LookupsActions.deleteRegionSuccess, (state, { id }) => ({
        ...state, regions: state.regions.filter((r) => r.id !== id), status: 'success' as const
    })),

    // Subcities
    on(LookupsActions.loadSubcities, (state) => ({ ...state, status: 'loading' as const })),
    on(LookupsActions.loadSubcitiesSuccess, (state, { subcities }) => ({ ...state, subcities, status: 'success' as const })),
    on(LookupsActions.loadSubcitiesFailure, (state, { error }) => ({ ...state, error, status: 'error' as const })),
    on(LookupsActions.addSubcitySuccess, (state, { subcity }) => ({
        ...state, subcities: [...state.subcities, subcity], status: 'success' as const
    })),
    on(LookupsActions.updateSubcitySuccess, (state, { subcity }) => ({
        ...state, subcities: state.subcities.map((s) => (s.id === subcity.id ? subcity : s)), status: 'success' as const
    })),
    on(LookupsActions.deleteSubcitySuccess, (state, { id }) => ({
        ...state, subcities: state.subcities.filter((s) => s.id !== id), status: 'success' as const
    })),

    // Educations
    on(LookupsActions.loadEducations, (state) => ({ ...state, status: 'loading' as const })),
    on(LookupsActions.loadEducationsSuccess, (state, { educations }) => ({ ...state, educations, status: 'success' as const })),
    on(LookupsActions.loadEducationsFailure, (state, { error }) => ({ ...state, error, status: 'error' as const })),
    on(LookupsActions.addEducationSuccess, (state, { education }) => ({
        ...state, educations: [...state.educations, education], status: 'success' as const
    })),
    on(LookupsActions.updateEducationSuccess, (state, { education }) => ({
        ...state, educations: state.educations.map((e) => (e.id === education.id ? education : e)), status: 'success' as const
    })),
    on(LookupsActions.deleteEducationSuccess, (state, { id }) => ({
        ...state, educations: state.educations.filter((e) => e.id !== id), status: 'success' as const
    })),

    // Branches
    on(LookupsActions.loadBranches, (state) => ({ ...state, status: 'loading' as const })),
    on(LookupsActions.loadBranchesSuccess, (state, { branches }) => ({ ...state, branches, status: 'success' as const })),
    on(LookupsActions.loadBranchesFailure, (state, { error }) => ({ ...state, error, status: 'error' as const })),

    // Account Classifications
    on(LookupsActions.loadAccountClassifications, (state) => ({ ...state, status: 'loading' as const })),
    on(LookupsActions.loadAccountClassificationsSuccess, (state, { accountClassifications }) => ({ ...state, accountClassifications, status: 'success' as const })),
    on(LookupsActions.loadAccountClassificationsFailure, (state, { error }) => ({ ...state, error, status: 'error' as const })),
    on(LookupsActions.addAccountClassificationSuccess, (state, { accountClassification }) => ({
        ...state, accountClassifications: [...state.accountClassifications, accountClassification], status: 'success' as const
    })),
    on(LookupsActions.updateAccountClassificationSuccess, (state, { accountClassification }) => ({
        ...state, accountClassifications: state.accountClassifications.map((a) => (a.id === accountClassification.id ? accountClassification : a)), status: 'success' as const
    })),
    on(LookupsActions.deleteAccountClassificationSuccess, (state, { id }) => ({
        ...state, accountClassifications: state.accountClassifications.filter((a) => a.id !== id), status: 'success' as const
    }))
);
