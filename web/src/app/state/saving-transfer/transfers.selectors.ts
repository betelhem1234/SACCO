import { createSelector } from '@ngrx/store';
import { AppState } from '../../models/state.model';
import { TransferState } from './transfers.reducer';

export const selectTransfersState = (state: AppState) => state?.transfers;

export const selectAllTransfers = createSelector(
    selectTransfersState,
    (state: TransferState) => state?.transfers ?? []
);

export const selectTransfersStatus = createSelector(
    selectTransfersState,
    (state: TransferState) => state?.status ?? 'idle'
);
