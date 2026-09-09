import { createSelector } from '@ngrx/store';
import { AppState } from '../../models/state.model';
import { SavingState } from './savings.reducer';

export const selectSavingsState = (state: AppState) => state?.savings;

export const selectAllSavings = createSelector(
    selectSavingsState,
    (state: SavingState) => state?.savings ?? []
);

export const selectSavingsStatus = createSelector(
    selectSavingsState,
    (state: SavingState) => state?.status ?? 'idle'
);
