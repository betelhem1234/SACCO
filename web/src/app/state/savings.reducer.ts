import { createReducer, on } from '@ngrx/store';
import { Saving } from '@sacco/shared-models';
import {
    loadSavings, loadSavingsSuccess, loadSavingsFailure,
    addSaving, addSavingSuccess, addSavingFailure,
    updateSaving, updateSavingSuccess, updateSavingFailure,
    deleteSaving, deleteSavingSuccess, deleteSavingFailure
} from './savings.actions';

export interface SavingState {
    savings: Saving[];
    status: 'idle' | 'loading' | 'success' | 'error';
    errorMessage?: string | null;
}

export const initialState: SavingState = {
    savings: [],
    status: 'idle',
    errorMessage: null
};

export const savingReducer = createReducer(
    initialState,
    on(loadSavings, (state) => ({
        ...state,
        status: 'loading' as const
    })),
    on(loadSavingsSuccess, (state, { savings }) => ({
        ...state,
        savings,
        status: 'success' as const
    })),
    on(loadSavingsFailure, (state, { error }) => ({
        ...state,
        status: 'error' as const,
        errorMessage: error
    })),
    on(addSaving, (state) => ({ ...state, status: 'loading' as const })),
    on(addSavingSuccess, (state, { saving }) => ({
        ...state,
        savings: [...state.savings, saving],
        status: 'success' as const
    })),
    on(addSavingFailure, (state, { error }) => ({
        ...state,
        errorMessage: error,
        status: 'error' as const
    })),
    on(updateSaving, (state) => ({ ...state, status: 'loading' as const })),
    on(updateSavingSuccess, (state, { saving }) => ({
        ...state,
        savings: state.savings.map((s) => (s.id === saving.id ? saving : s)),
        status: 'success' as const
    })),
    on(updateSavingFailure, (state, { error }) => ({
        ...state,
        errorMessage: error,
        status: 'error' as const
    })),
    on(deleteSaving, (state) => ({ ...state, status: 'loading' as const })),
    on(deleteSavingSuccess, (state, { id }) => ({
        ...state,
        savings: state.savings.filter((s) => s.id !== id),
        status: 'success' as const
    })),
    on(deleteSavingFailure, (state, { error }) => ({
        ...state,
        errorMessage: error,
        status: 'error' as const
    }))
);
