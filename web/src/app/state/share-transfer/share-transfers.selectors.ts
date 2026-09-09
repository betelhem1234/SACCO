import { createSelector } from '@ngrx/store';
import { AppState } from '../../models/state.model';
import { ShareTransferState } from './share-transfers.reducer';

export const selectShareTransfersState = (state: AppState) => state?.shareTransfers;

export const selectAllShareTransfers = createSelector(
    selectShareTransfersState,
    (state: ShareTransferState) => state?.shareTransfers ?? []
);

export const selectShareTransfersStatus = createSelector(
    selectShareTransfersState,
    (state: ShareTransferState) => state?.status ?? 'idle'
);
