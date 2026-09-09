import { createReducer, on } from '@ngrx/store';
import { ShareTransfer } from '@sacco/shared-models';
import {
    loadShareTransfers, loadShareTransfersSuccess, loadShareTransfersFailure,
    addShareTransfer, addShareTransferSuccess, addShareTransferFailure,
    updateShareTransfer, updateShareTransferSuccess, updateShareTransferFailure,
    deleteShareTransfer, deleteShareTransferSuccess, deleteShareTransferFailure
} from './share-transfers.actions';

export interface ShareTransferState {
    shareTransfers: ShareTransfer[];
    status: 'idle' | 'loading' | 'success' | 'error';
    errorMessage?: string | null;
}

export const initialState: ShareTransferState = {
    shareTransfers: [],
    status: 'idle',
    errorMessage: null
};

export const shareTransferReducer = createReducer(
    initialState,
    on(loadShareTransfers, (state) => ({ ...state, status: 'loading' as const })),
    on(loadShareTransfersSuccess, (state, { shareTransfers }) => ({ ...state, shareTransfers, status: 'success' as const })),
    on(loadShareTransfersFailure, (state, { error }) => ({ ...state, status: 'error' as const, errorMessage: error })),

    on(addShareTransfer, (state) => ({ ...state, status: 'loading' as const })),
    on(addShareTransferSuccess, (state, { shareTransfer }) => ({
        ...state,
        shareTransfers: [...state.shareTransfers, shareTransfer],
        status: 'success' as const
    })),
    on(addShareTransferFailure, (state, { error }) => ({ ...state, errorMessage: error, status: 'error' as const })),

    on(updateShareTransfer, (state) => ({ ...state, status: 'loading' as const })),
    on(updateShareTransferSuccess, (state, { shareTransfer }) => ({
        ...state,
        shareTransfers: state.shareTransfers.map(t => t.id === shareTransfer.id ? shareTransfer : t),
        status: 'success' as const
    })),
    on(updateShareTransferFailure, (state, { error }) => ({ ...state, errorMessage: error, status: 'error' as const })),

    on(deleteShareTransfer, (state) => ({ ...state, status: 'loading' as const })),
    on(deleteShareTransferSuccess, (state, { id }) => ({
        ...state,
        shareTransfers: state.shareTransfers.filter(t => t.id !== id),
        status: 'success' as const
    })),
    on(deleteShareTransferFailure, (state, { error }) => ({ ...state, errorMessage: error, status: 'error' as const }))
);
