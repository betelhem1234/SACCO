import { createAction, props } from '@ngrx/store';
import { ShareTransfer } from '@sacco/shared-models';

export const loadShareTransfers = createAction('[SHARE_TRANSFER] Load Share Transfers');
export const loadShareTransfersSuccess = createAction('[SHARE_TRANSFER] Load Share Transfers Success', props<{ shareTransfers: ShareTransfer[] }>());
export const loadShareTransfersFailure = createAction('[SHARE_TRANSFER] Load Share Transfers Failure', props<{ error: any }>());

export const addShareTransfer = createAction('[SHARE_TRANSFER] Add Share Transfer', props<{ shareTransfer: ShareTransfer }>());
export const addShareTransferSuccess = createAction('[SHARE_TRANSFER] Add Share Transfer Success', props<{ shareTransfer: ShareTransfer }>());
export const addShareTransferFailure = createAction('[SHARE_TRANSFER] Add Share Transfer Failure', props<{ error: any }>());

export const updateShareTransfer = createAction('[SHARE_TRANSFER] Update Share Transfer', props<{ shareTransfer: ShareTransfer }>());
export const updateShareTransferSuccess = createAction('[SHARE_TRANSFER] Update Share Transfer Success', props<{ shareTransfer: ShareTransfer }>());
export const updateShareTransferFailure = createAction('[SHARE_TRANSFER] Update Share Transfer Failure', props<{ error: any }>());

export const deleteShareTransfer = createAction('[SHARE_TRANSFER] Delete Share Transfer', props<{ id: string }>());
export const deleteShareTransferSuccess = createAction('[SHARE_TRANSFER] Delete Share Transfer Success', props<{ id: string }>());
export const deleteShareTransferFailure = createAction('[SHARE_TRANSFER] Delete Share Transfer Failure', props<{ error: any }>());
