import { createSelector } from '@ngrx/store';
import { AppState } from '../models/state.model';
import { WithdrawalState } from './withdrawals.reducer';

export const selectWithdrawalsState = (state: AppState) => state?.withdrawals;

export const selectAllWithdrawals = createSelector(
    selectWithdrawalsState,
    (state: WithdrawalState) => state?.withdrawals ?? []
);

export const selectWithdrawalsStatus = createSelector(
    selectWithdrawalsState,
    (state: WithdrawalState) => state?.status ?? 'idle'
);
