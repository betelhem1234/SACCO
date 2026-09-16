import { createReducer, on } from '@ngrx/store';
import { ShareSubscription } from '@sacco/shared-models';
import {
    loadShareSubscriptions, loadShareSubscriptionsSuccess, loadShareSubscriptionsFailure,
    addShareSubscription, addShareSubscriptionSuccess, addShareSubscriptionFailure,
    updateShareSubscription, updateShareSubscriptionSuccess, updateShareSubscriptionFailure,
    deleteShareSubscription, deleteShareSubscriptionSuccess, deleteShareSubscriptionFailure,
    approveShareSubscription, approveShareSubscriptionSuccess, approveShareSubscriptionFailure,
    rejectShareSubscription, rejectShareSubscriptionSuccess, rejectShareSubscriptionFailure,
    reverseShareSubscription, reverseShareSubscriptionSuccess, reverseShareSubscriptionFailure
} from './share-subscriptions.actions';

export interface ShareSubscriptionState {
    shareSubscriptions: ShareSubscription[];
    status: 'idle' | 'loading' | 'success' | 'error';
    errorMessage?: string | null;
}

export const initialState: ShareSubscriptionState = {
    shareSubscriptions: [],
    status: 'idle',
    errorMessage: null
};

export const shareSubscriptionReducer = createReducer(
    initialState,
    on(loadShareSubscriptions, (state) => ({ ...state, status: 'loading' as const })),
    on(loadShareSubscriptionsSuccess, (state, { shareSubscriptions }) => ({ ...state, shareSubscriptions, status: 'success' as const })),
    on(loadShareSubscriptionsFailure, (state, { error }) => ({ ...state, status: 'error' as const, errorMessage: error })),

    on(addShareSubscription, (state) => ({ ...state, status: 'loading' as const })),
    on(addShareSubscriptionSuccess, (state, { shareSubscription }) => ({
        ...state,
        shareSubscriptions: [...state.shareSubscriptions, shareSubscription],
        status: 'success' as const
    })),
    on(addShareSubscriptionFailure, (state, { error }) => ({ ...state, errorMessage: error, status: 'error' as const })),

    on(updateShareSubscription, (state) => ({ ...state, status: 'loading' as const })),
    on(updateShareSubscriptionSuccess, (state, { shareSubscription }) => ({
        ...state,
        shareSubscriptions: state.shareSubscriptions.map(s => s.id === shareSubscription.id ? shareSubscription : s),
        status: 'success' as const
    })),
    on(updateShareSubscriptionFailure, (state, { error }) => ({ ...state, errorMessage: error, status: 'error' as const })),

    on(deleteShareSubscription, (state) => ({ ...state, status: 'loading' as const })),
    on(deleteShareSubscriptionSuccess, (state, { id }) => ({
        ...state,
        shareSubscriptions: state.shareSubscriptions.filter(s => s.id !== id),
        status: 'success' as const
    })),
    on(deleteShareSubscriptionFailure, (state, { error }) => ({ ...state, errorMessage: error, status: 'error' as const })),

    on(approveShareSubscription, (state) => ({ ...state, status: 'loading' as const })),
    on(approveShareSubscriptionSuccess, (state, { shareSubscription }) => ({
        ...state,
        shareSubscriptions: state.shareSubscriptions.map(s => s.id === shareSubscription.id ? { ...shareSubscription, status: 'POSTED' as const } : s),
        status: 'success' as const
    })),
    on(approveShareSubscriptionFailure, (state, { error }) => ({ ...state, errorMessage: error, status: 'error' as const })),

    on(rejectShareSubscription, (state) => ({ ...state, status: 'loading' as const })),
    on(rejectShareSubscriptionSuccess, (state, { shareSubscription }) => ({
        ...state,
        shareSubscriptions: state.shareSubscriptions.map(s => s.id === shareSubscription.id ? { ...shareSubscription, status: 'REJECTED' as const } : s),
        status: 'success' as const
    })),
    on(rejectShareSubscriptionFailure, (state, { error }) => ({ ...state, errorMessage: error, status: 'error' as const })),

    on(reverseShareSubscription, (state) => ({ ...state, status: 'loading' as const })),
    on(reverseShareSubscriptionSuccess, (state, { shareSubscription }) => ({
        ...state,
        shareSubscriptions: state.shareSubscriptions.map(s => s.id === shareSubscription.id ? { ...shareSubscription, status: 'PENDING' as const } : s),
        status: 'success' as const
    })),
    on(reverseShareSubscriptionFailure, (state, { error }) => ({ ...state, errorMessage: error, status: 'error' as const }))
);
