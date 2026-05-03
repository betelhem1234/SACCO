import { createAction, props } from '@ngrx/store';
import { Bank, SavingType } from '@sacco/shared-models';

// Banks
export const loadBanks = createAction('[Lookups] Load Banks');
export const loadBanksSuccess = createAction('[Lookups] Load Banks Success', props<{ banks: Bank[] }>());
export const loadBanksFailure = createAction('[Lookups] Load Banks Failure', props<{ error: any }>());

export const addBank = createAction('[Lookups] Add Bank', props<{ bank: Bank }>());
export const addBankSuccess = createAction('[Lookups] Add Bank Success', props<{ bank: Bank }>());
export const addBankFailure = createAction('[Lookups] Add Bank Failure', props<{ error: any }>());

// Saving Types
export const loadSavingTypes = createAction('[Lookups] Load Saving Types');
export const loadSavingTypesSuccess = createAction('[Lookups] Load Saving Types Success', props<{ savingTypes: SavingType[] }>());
export const loadSavingTypesFailure = createAction('[Lookups] Load Saving Types Failure', props<{ error: any }>());

export const addSavingType = createAction('[Lookups] Add Saving Type', props<{ savingType: SavingType }>());
export const addSavingTypeSuccess = createAction('[Lookups] Add Saving Type Success', props<{ savingType: SavingType }>());
export const addSavingTypeFailure = createAction('[Lookups] Add Saving Type Failure', props<{ error: any }>());
