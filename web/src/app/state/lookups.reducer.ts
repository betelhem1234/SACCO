import { createReducer, on } from '@ngrx/store';
import { Bank, SavingType } from '@sacco/shared-models';
import * as LookupsActions from './lookups.actions';

export interface LookupsState {
    banks: Bank[];
    savingTypes: SavingType[];
    status: 'idle' | 'loading' | 'success' | 'error';
    error: any;
}

export const initialLookupsState: LookupsState = {
    banks: [],
    savingTypes: [],
    status: 'idle',
    error: null
};

export const lookupsReducer = createReducer(
    initialLookupsState,
    on(LookupsActions.loadBanks, (state) => ({ ...state, status: 'loading' as const })),
    on(LookupsActions.loadBanksSuccess, (state, { banks }) => ({ ...state, banks, status: 'success' as const })),
    on(LookupsActions.loadBanksFailure, (state, { error }) => ({ ...state, error, status: 'error' as const })),

    on(LookupsActions.loadSavingTypes, (state) => ({ ...state, status: 'loading' as const })),
    on(LookupsActions.loadSavingTypesSuccess, (state, { savingTypes }) => ({ ...state, savingTypes, status: 'success' as const })),
    on(LookupsActions.loadSavingTypesFailure, (state, { error }) => ({ ...state, error, status: 'error' as const })),

    on(LookupsActions.addBankSuccess, (state, { bank }) => ({ ...state, banks: [...state.banks, bank], status: 'success' as const })),
    on(LookupsActions.addSavingTypeSuccess, (state, { savingType }) => ({ ...state, savingTypes: [...state.savingTypes, savingType], status: 'success' as const }))
);
