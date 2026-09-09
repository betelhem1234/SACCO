import { createAction, props } from '@ngrx/store';
import { Transfer } from '@sacco/shared-models';

export const loadTransfers = createAction('[TRANSFER] Load Transfers');
export const loadTransfersSuccess = createAction('[TRANSFER] Load Transfers Success', props<{ transfers: Transfer[] }>());
export const loadTransfersFailure = createAction('[TRANSFER] Load Transfers Failure', props<{ error: any }>());

export const addTransfer = createAction('[TRANSFER] Add Transfer', props<{ transfer: Transfer }>());
export const addTransferSuccess = createAction('[TRANSFER] Add Transfer Success', props<{ transfer: Transfer }>());
export const addTransferFailure = createAction('[TRANSFER] Add Transfer Failure', props<{ error: any }>());

export const updateTransfer = createAction('[TRANSFER] Update Transfer', props<{ transfer: Transfer }>());
export const updateTransferSuccess = createAction('[TRANSFER] Update Transfer Success', props<{ transfer: Transfer }>());
export const updateTransferFailure = createAction('[TRANSFER] Update Transfer Failure', props<{ error: any }>());

export const deleteTransfer = createAction('[TRANSFER] Delete Transfer', props<{ id: string }>());
export const deleteTransferSuccess = createAction('[TRANSFER] Delete Transfer Success', props<{ id: string }>());
export const deleteTransferFailure = createAction('[TRANSFER] Delete Transfer Failure', props<{ error: any }>());
