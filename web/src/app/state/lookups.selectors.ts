import { createSelector } from '@ngrx/store';
import { AppState } from '../models/state.model';
import { LookupsState } from './lookups.reducer';

export const selectLookupsFeature = (state: AppState) => state.lookups;

export const selectAllBanks = createSelector(
    selectLookupsFeature,
    (state: LookupsState) => state.banks
);

export const selectAllSavingTypes = createSelector(
    selectLookupsFeature,
    (state: LookupsState) => state.savingTypes
);
