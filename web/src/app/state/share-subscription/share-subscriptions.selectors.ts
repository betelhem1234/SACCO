import { createSelector } from '@ngrx/store';
import { AppState } from '../../models/state.model';
import { ShareSubscriptionState } from './share-subscriptions.reducer';

export const selectShareSubscriptionsState = (state: AppState) => state?.shareSubscriptions;

export const selectAllShareSubscriptions = createSelector(
    selectShareSubscriptionsState,
    (state: ShareSubscriptionState) => state?.shareSubscriptions ?? []
);

export const selectShareSubscriptionsStatus = createSelector(
    selectShareSubscriptionsState,
    (state: ShareSubscriptionState) => state?.status ?? 'idle'
);
