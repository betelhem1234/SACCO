import { createReducer, on } from '@ngrx/store';
import { Account, SavingType, SharedLoanType } from '@sacco/shared-models';
import * as LookupsActions from './lookups.actions';

export interface LookupsState {
    accounts: Account[];
    savingTypes: SavingType[];
    loanTypes: SharedLoanType[];
    status: 'idle' | 'loading' | 'success' | 'error';
    error: any;
}

export const initialLookupsState: LookupsState = {
    accounts: [],
    savingTypes: [],
    loanTypes: [],
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
    }))
);
