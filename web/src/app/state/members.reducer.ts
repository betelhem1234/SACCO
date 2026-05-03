import { createReducer, on } from '@ngrx/store';
import { Member } from '@sacco/shared-models';
import {
    loadMembers, loadMembersSuccess, loadMembersFailure,
    addMember, addMemberSuccess, addMemberFailure,
    updateMember, updateMemberSuccess, updateMemberFailure,
    deleteMember, deleteMemberSuccess, deleteMemberFailure
} from './members.actions';

export interface MemberState {
    members: Member[];
    status: 'idle' | 'loading' | 'success' | 'error';
    errorMessage?: string | null;
}

export const initialState: MemberState = {
    members: [],
    status: 'idle',
    errorMessage: null
};

export const memberReducer = createReducer(
    initialState,
    on(loadMembers, (state) => ({
        ...state,
        status: 'loading' as const
    })),
    on(loadMembersSuccess, (state, { members }) => ({
        ...state,
        members,
        status: 'success' as const
    })),
    on(loadMembersFailure, (state, { error }) => ({
        ...state,
        status: 'error' as const,
        errorMessage: error
    })),
    on(addMember, (state) => ({
        ...state,
        status: 'loading' as const
    })),
    on(addMemberSuccess, (state, { member }) => ({
        ...state,
        members: [...state.members, member],
        status: 'success' as const
    })),
    on(addMemberFailure, (state, { error }) => ({
        ...state,
        status: 'error' as const,
        errorMessage: error
    })),
    on(updateMember, (state) => ({
        ...state,
        status: 'loading' as const
    })),
    on(updateMemberSuccess, (state, { member }) => ({
        ...state,
        status: 'success' as const,
        members: state.members.map(m =>
            m.id === member.id ? member : m
        )
    })),
    on(updateMemberFailure, (state, { error }) => ({
        ...state,
        status: 'error' as const,
        errorMessage: error
    })),
    on(deleteMember, (state) => ({
        ...state,
        status: 'loading' as const
    })),
    on(deleteMemberSuccess, (state, { id }) => ({
        ...state,
        members: state.members.filter(m => m.id !== id),
        status: 'success' as const
    })),
    on(deleteMemberFailure, (state, { error }) => ({
        ...state,
        status: 'error' as const,
        errorMessage: error
    }))
);
