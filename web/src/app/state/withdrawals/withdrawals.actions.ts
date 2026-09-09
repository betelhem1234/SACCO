import { createAction, props } from '@ngrx/store';
import { Withdrawal } from '@sacco/shared-models';

export const loadWithdrawals = createAction('[WITHDRAWAL] Load Withdrawals');
export const loadWithdrawalsSuccess = createAction('[WITHDRAWAL] Load Withdrawals Success', props<{ withdrawals: Withdrawal[] }>());
export const loadWithdrawalsFailure = createAction('[WITHDRAWAL] Load Withdrawals Failure', props<{ error: any }>());

export const addWithdrawal = createAction('[WITHDRAWAL] Add Withdrawal', props<{ withdrawal: Withdrawal }>());
export const addWithdrawalSuccess = createAction('[WITHDRAWAL] Add Withdrawal Success', props<{ withdrawal: Withdrawal }>());
export const addWithdrawalFailure = createAction('[WITHDRAWAL] Add Withdrawal Failure', props<{ error: any }>());

export const updateWithdrawal = createAction('[WITHDRAWAL] Update Withdrawal', props<{ withdrawal: Withdrawal }>());
export const updateWithdrawalSuccess = createAction('[WITHDRAWAL] Update Withdrawal Success', props<{ withdrawal: Withdrawal }>());
export const updateWithdrawalFailure = createAction('[WITHDRAWAL] Update Withdrawal Failure', props<{ error: any }>());

export const deleteWithdrawal = createAction('[WITHDRAWAL] Delete Withdrawal', props<{ id: string }>());
export const deleteWithdrawalSuccess = createAction('[WITHDRAWAL] Delete Withdrawal Success', props<{ id: string }>());
export const deleteWithdrawalFailure = createAction('[WITHDRAWAL] Delete Withdrawal Failure', props<{ error: any }>());

export const approveWithdrawal = createAction('[WITHDRAWAL] Approve Withdrawal', props<{ id: string; approvedBy?: string }>());
export const approveWithdrawalSuccess = createAction('[WITHDRAWAL] Approve Withdrawal Success', props<{ withdrawal: Withdrawal }>());
export const approveWithdrawalFailure = createAction('[WITHDRAWAL] Approve Withdrawal Failure', props<{ error: any }>());

export const rejectWithdrawal = createAction('[WITHDRAWAL] Reject Withdrawal', props<{ id: string }>());
export const rejectWithdrawalSuccess = createAction('[WITHDRAWAL] Reject Withdrawal Success', props<{ withdrawal: Withdrawal }>());
export const rejectWithdrawalFailure = createAction('[WITHDRAWAL] Reject Withdrawal Failure', props<{ error: any }>());
