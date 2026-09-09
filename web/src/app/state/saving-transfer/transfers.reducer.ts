import { createReducer, on } from '@ngrx/store';
import { Transfer } from '@sacco/shared-models';
import {
    loadTransfers, loadTransfersSuccess, loadTransfersFailure,
    addTransfer, addTransferSuccess, addTransferFailure,
    updateTransfer, updateTransferSuccess, updateTransferFailure,
    deleteTransfer, deleteTransferSuccess, deleteTransferFailure
} from './transfers.actions';

export interface TransferState {
    transfers: Transfer[];
    status: 'idle' | 'loading' | 'success' | 'error';
    errorMessage?: string | null;
}

export const initialState: TransferState = {
    transfers: [],
    status: 'idle',
    errorMessage: null
};

export const transferReducer = createReducer(
    initialState,
    on(loadTransfers, (state) => ({ ...state, status: 'loading' as const })),
    on(loadTransfersSuccess, (state, { transfers }) => ({ ...state, transfers, status: 'success' as const })),
    on(loadTransfersFailure, (state, { error }) => ({ ...state, status: 'error' as const, errorMessage: error })),

    on(addTransfer, (state) => ({ ...state, status: 'loading' as const })),
    on(addTransferSuccess, (state, { transfer }) => ({
        ...state,
        transfers: [...state.transfers, transfer],
        status: 'success' as const
    })),
    on(addTransferFailure, (state, { error }) => ({ ...state, errorMessage: error, status: 'error' as const })),

    on(updateTransfer, (state) => ({ ...state, status: 'loading' as const })),
    on(updateTransferSuccess, (state, { transfer }) => ({
        ...state,
        transfers: state.transfers.map(t => t.id === transfer.id ? transfer : t),
        status: 'success' as const
    })),
    on(updateTransferFailure, (state, { error }) => ({ ...state, errorMessage: error, status: 'error' as const })),

    on(deleteTransfer, (state) => ({ ...state, status: 'loading' as const })),
    on(deleteTransferSuccess, (state, { id }) => ({
        ...state,
        transfers: state.transfers.filter(t => t.id !== id),
        status: 'success' as const
    })),
    on(deleteTransferFailure, (state, { error }) => ({ ...state, errorMessage: error, status: 'error' as const }))
);
