import { createFeatureSelector, createSelector } from '@ngrx/store';
import { MemberState } from './members.reducer';

export const selectMembersState =
    createFeatureSelector<MemberState>('members');

export const selectAllMembers = createSelector(
    selectMembersState,
    (state) => state.members
);

export const selectMembersTotalCount = createSelector(
    selectMembersState,
    (state) => state.totalCount
);

export const selectMembersStatus = createSelector(
    selectMembersState,
    (state) => state.status
);
