import { createSelector } from '@ngrx/store';
import { AppState } from '../../models/state.model';
import { SharePurchaseState } from './share-purchases.reducer';

export const selectSharePurchasesState = (state: AppState) => state?.sharePurchases;

export const selectAllSharePurchases = createSelector(
    selectSharePurchasesState,
    (state: SharePurchaseState) => state?.sharePurchases ?? []
);

export const selectSharePurchasesStatus = createSelector(
    selectSharePurchasesState,
    (state: SharePurchaseState) => state?.status ?? 'idle'
);
