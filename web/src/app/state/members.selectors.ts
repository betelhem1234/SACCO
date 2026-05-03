import { createFeatureSelector, createSelector } from '@ngrx/store';
import { MemberState } from './members.reducer';

export const selectMembersState =
    createFeatureSelector<MemberState>('members');

export const selectAllMembers = createSelector(
    selectMembersState,
    (state) => state.members
);
