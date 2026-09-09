import { createSelector } from '@ngrx/store';
import { AppState } from '../../models/state.model';
import { LookupsState } from './lookups.reducer';

export const selectLookupsFeature = (state: AppState) => state.lookups;

export const selectAllAccounts = createSelector(
    selectLookupsFeature,
    (state: LookupsState) => state.accounts
);

export const selectAllSavingTypes = createSelector(
    selectLookupsFeature,
    (state: LookupsState) => state.savingTypes
);

export const selectAllLoanTypes = createSelector(
    selectLookupsFeature,
    (state: LookupsState) => state.loanTypes
);

export const selectAllRegions = createSelector(
    selectLookupsFeature,
    (state: LookupsState) => state.regions
);

export const selectAllSubcities = createSelector(
    selectLookupsFeature,
    (state: LookupsState) => state.subcities
);

export const selectAllEducations = createSelector(
    selectLookupsFeature,
    (state: LookupsState) => state.educations
);

export const selectAllBranches = createSelector(
    selectLookupsFeature,
    (state: LookupsState) => state.branches
);

export const selectAllAccountClassifications = createSelector(
    selectLookupsFeature,
    (state: LookupsState) => state.accountClassifications
);
