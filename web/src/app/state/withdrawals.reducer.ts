import { createReducer, on } from '@ngrx/store';
import { Withdrawal } from '@sacco/shared-models';
import {
    loadWithdrawals, loadWithdrawalsSuccess, loadWithdrawalsFailure,
    addWithdrawal, addWithdrawalSuccess, addWithdrawalFailure,
    updateWithdrawal, updateWithdrawalSuccess, updateWithdrawalFailure,
    deleteWithdrawal, deleteWithdrawalSuccess, deleteWithdrawalFailure
} from './withdrawals.actions';

export interface WithdrawalState {
    withdrawals: Withdrawal[];
    status: 'idle' | 'loading' | 'success' | 'error';
    errorMessage?: string | null;
}

export const initialState: WithdrawalState = {
    withdrawals: [],
    status: 'idle',
    errorMessage: null
};

export const withdrawalReducer = createReducer(
    initialState,
    on(loadWithdrawals, (state) => ({ ...state, status: 'loading' as const })),
    on(loadWithdrawalsSuccess, (state, { withdrawals }) => ({ ...state, withdrawals, status: 'success' as const })),
    on(loadWithdrawalsFailure, (state, { error }) => ({ ...state, status: 'error' as const, errorMessage: error })),

    on(addWithdrawal, (state) => ({ ...state, status: 'loading' as const })),
    on(addWithdrawalSuccess, (state, { withdrawal }) => ({
        ...state,
        withdrawals: [...state.withdrawals, withdrawal],
        status: 'success' as const
    })),
    on(addWithdrawalFailure, (state, { error }) => ({ ...state, errorMessage: error, status: 'error' as const })),

    on(updateWithdrawal, (state) => ({ ...state, status: 'loading' as const })),
    on(updateWithdrawalSuccess, (state, { withdrawal }) => ({
        ...state,
        withdrawals: state.withdrawals.map(w => w.id === withdrawal.id ? withdrawal : w),
        status: 'success' as const
    })),
    on(updateWithdrawalFailure, (state, { error }) => ({ ...state, errorMessage: error, status: 'error' as const })),

    on(deleteWithdrawal, (state) => ({ ...state, status: 'loading' as const })),
    on(deleteWithdrawalSuccess, (state, { id }) => ({
        ...state,
        withdrawals: state.withdrawals.filter(w => w.id !== id),
        status: 'success' as const
    })),
    on(deleteWithdrawalFailure, (state, { error }) => ({ ...state, errorMessage: error, status: 'error' as const }))
);
