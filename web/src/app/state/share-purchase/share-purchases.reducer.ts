import { createReducer, on } from '@ngrx/store';
import { SharePurchase } from '@sacco/shared-models';
import {
    loadSharePurchases, loadSharePurchasesSuccess, loadSharePurchasesFailure,
    addSharePurchase, addSharePurchaseSuccess, addSharePurchaseFailure,
    updateSharePurchase, updateSharePurchaseSuccess, updateSharePurchaseFailure,
    deleteSharePurchase, deleteSharePurchaseSuccess, deleteSharePurchaseFailure
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
    on(deleteSharePurchaseFailure, (state, { error }) => ({ ...state, errorMessage: error, status: 'error' as const }))
);
