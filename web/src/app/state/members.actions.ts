import { createAction, props } from '@ngrx/store';
import { Member } from '@sacco/shared-models';

export const loadMembers = createAction('[MEMBER] Load Members');
export const loadMembersSuccess = createAction('[MEMBER] Load Members Success', props<{ members: Member[] }>());
export const loadMembersFailure = createAction('[MEMBER] Load Members Failure', props<{ error: any }>());

export const addMember = createAction('[MEMBER] Add Member', props<{ member: Member }>());
export const addMemberSuccess = createAction('[MEMBER] Add Member Success', props<{ member: Member }>());
export const addMemberFailure = createAction('[MEMBER] Add Member Failure', props<{ error: any }>());

export const updateMember = createAction('[MEMBER] Update Member', props<{ member: Member }>());
export const updateMemberSuccess = createAction('[MEMBER] Update Member Success', props<{ member: Member }>());
export const updateMemberFailure = createAction('[MEMBER] Update Member Failure', props<{ error: any }>());

export const deleteMember = createAction('[MEMBER] Delete Member', props<{ id: string }>());
export const deleteMemberSuccess = createAction('[MEMBER] Delete Member Success', props<{ id: string }>());
export const deleteMemberFailure = createAction('[MEMBER] Delete Member Failure', props<{ error: any }>());
