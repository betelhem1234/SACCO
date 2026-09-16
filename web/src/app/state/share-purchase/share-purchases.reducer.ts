import { createReducer, on } from '@ngrx/store';
import { SharePurchase } from '@sacco/shared-models';
import {
    loadSharePurchases, loadSharePurchasesSuccess, loadSharePurchasesFailure,
    addSharePurchase, addSharePurchaseSuccess, addSharePurchaseFailure,
    updateSharePurchase, updateSharePurchaseSuccess, updateSharePurchaseFailure,
    deleteSharePurchase, deleteSharePurchaseSuccess, deleteSharePurchaseFailure,
    approveSharePurchase, approveSharePurchaseSuccess, approveSharePurchaseFailure,
    rejectSharePurchase, rejectSharePurchaseSuccess, rejectSharePurchaseFailure,
    reverseSharePurchase, reverseSharePurchaseSuccess, reverseSharePurchaseFailure
} from './share-purchases.actions';

export interface SharePurchaseState {
    sharePurchases: SharePurchase[];
    status: 'idle' | 'loading' | 'success' | 'error';
    errorMessage?: string | null;
}

export const initialState: SharePurchaseState = {
    sharePurchases: [],
    status: 'idle',
    errorMessage: null
};

export const sharePurchaseReducer = createReducer(
    initialState,
    on(loadSharePurchases, (state) => ({ ...state, status: 'loading' as const })),
    on(loadSharePurchasesSuccess, (state, { sharePurchases }) => ({ ...state, sharePurchases, status: 'success' as const })),
    on(loadSharePurchasesFailure, (state, { error }) => ({ ...state, status: 'error' as const, errorMessage: error })),

    on(addSharePurchase, (state) => ({ ...state, status: 'loading' as const })),
    on(addSharePurchaseSuccess, (state, { sharePurchase }) => ({
        ...state,
        sharePurchases: [...state.sharePurchases, sharePurchase],
        status: 'success' as const
    })),
    on(addSharePurchaseFailure, (state, { error }) => ({ ...state, errorMessage: error, status: 'error' as const })),

    on(updateSharePurchase, (state) => ({ ...state, status: 'loading' as const })),
    on(updateSharePurchaseSuccess, (state, { sharePurchase }) => ({
        ...state,
        sharePurchases: state.sharePurchases.map(p => p.id === sharePurchase.id ? sharePurchase : p),
        status: 'success' as const
    })),
    on(updateSharePurchaseFailure, (state, { error }) => ({ ...state, errorMessage: error, status: 'error' as const })),

    on(deleteSharePurchase, (state) => ({ ...state, status: 'loading' as const })),
    on(deleteSharePurchaseSuccess, (state, { id }) => ({
        ...state,
        sharePurchases: state.sharePurchases.filter(p => p.id !== id),
        status: 'success' as const
    })),
    on(deleteSharePurchaseFailure, (state, { error }) => ({ ...state, errorMessage: error, status: 'error' as const })),

    on(approveSharePurchase, (state) => ({ ...state, status: 'loading' as const })),
    on(approveSharePurchaseSuccess, (state, { sharePurchase }) => ({
        ...state,
        sharePurchases: state.sharePurchases.map(p => p.id === sharePurchase.id ? { ...sharePurchase, status: 'POSTED' as const } : p),
        status: 'success' as const
    })),
    on(approveSharePurchaseFailure, (state, { error }) => ({ ...state, errorMessage: error, status: 'error' as const })),

    on(rejectSharePurchase, (state) => ({ ...state, status: 'loading' as const })),
    on(rejectSharePurchaseSuccess, (state, { sharePurchase }) => ({
        ...state,
        sharePurchases: state.sharePurchases.map(p => p.id === sharePurchase.id ? { ...sharePurchase, status: 'REJECTED' as const } : p),
        status: 'success' as const
    })),
    on(rejectSharePurchaseFailure, (state, { error }) => ({ ...state, errorMessage: error, status: 'error' as const })),

    on(reverseSharePurchase, (state) => ({ ...state, status: 'loading' as const })),
    on(reverseSharePurchaseSuccess, (state, { sharePurchase }) => ({
        ...state,
        sharePurchases: state.sharePurchases.map(p => p.id === sharePurchase.id ? { ...sharePurchase, status: 'PENDING' as const } : p),
        status: 'success' as const
    })),
    on(reverseSharePurchaseFailure, (state, { error }) => ({ ...state, errorMessage: error, status: 'error' as const }))
);
