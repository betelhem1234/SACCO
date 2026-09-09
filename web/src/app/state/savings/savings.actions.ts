import { createAction, props } from '@ngrx/store';
import { Saving } from '@sacco/shared-models';

export const loadSavings = createAction('[SAVING] Load Savings');
export const loadSavingsSuccess = createAction('[SAVING] Load Savings Success', props<{ savings: Saving[] }>());
export const loadSavingsFailure = createAction('[SAVING] Load Savings Failure', props<{ error: any }>());

export const addSaving = createAction('[SAVING] Add Saving', props<{ saving: Saving }>());
export const addSavingSuccess = createAction('[SAVING] Add Saving Success', props<{ saving: Saving }>());
export const addSavingFailure = createAction('[SAVING] Add Saving Failure', props<{ error: any }>());

export const updateSaving = createAction('[SAVING] Update Saving', props<{ saving: Saving }>());
export const updateSavingSuccess = createAction('[SAVING] Update Saving Success', props<{ saving: Saving }>());
export const updateSavingFailure = createAction('[SAVING] Update Saving Failure', props<{ error: any }>());

export const deleteSaving = createAction('[SAVING] Delete Saving', props<{ id: string }>());
export const deleteSavingSuccess = createAction('[SAVING] Delete Saving Success', props<{ id: string }>());
export const deleteSavingFailure = createAction('[SAVING] Delete Saving Failure', props<{ error: any }>());

export const approveSaving = createAction('[SAVING] Approve Saving', props<{ id: string }>());
export const approveSavingSuccess = createAction('[SAVING] Approve Saving Success', props<{ saving: Saving }>());
export const approveSavingFailure = createAction('[SAVING] Approve Saving Failure', props<{ error: any }>());

export const rejectSaving = createAction('[SAVING] Reject Saving', props<{ id: string }>());
export const rejectSavingSuccess = createAction('[SAVING] Reject Saving Success', props<{ saving: Saving }>());
export const rejectSavingFailure = createAction('[SAVING] Reject Saving Failure', props<{ error: any }>());
