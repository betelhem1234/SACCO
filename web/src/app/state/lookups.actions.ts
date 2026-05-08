import { createAction, props } from '@ngrx/store';
import { Account, SavingType, SharedLoanType } from '@sacco/shared-models';

/** Optional query filters for GET /api/accounts */
export const loadAccounts = createAction(
    '[Lookups] Load Accounts',
    props<{ accountType?: number; accountCategory?: number }>()
);
export const loadAccountsSuccess = createAction('[Lookups] Load Accounts Success', props<{ accounts: Account[] }>());
export const loadAccountsFailure = createAction('[Lookups] Load Accounts Failure', props<{ error: any }>());

export const addAccount = createAction('[Lookups] Add Account', props<{ account: Account }>());
export const addAccountSuccess = createAction('[Lookups] Add Account Success', props<{ account: Account }>());
export const addAccountFailure = createAction('[Lookups] Add Account Failure', props<{ error: any }>());

export const updateAccount = createAction('[Lookups] Update Account', props<{ account: Account }>());
export const updateAccountSuccess = createAction('[Lookups] Update Account Success', props<{ account: Account }>());
export const updateAccountFailure = createAction('[Lookups] Update Account Failure', props<{ error: any }>());

export const deleteAccount = createAction('[Lookups] Delete Account', props<{ id: string }>());
export const deleteAccountSuccess = createAction('[Lookups] Delete Account Success', props<{ id: string }>());
export const deleteAccountFailure = createAction('[Lookups] Delete Account Failure', props<{ error: any }>());

// Saving Types
export const loadSavingTypes = createAction('[Lookups] Load Saving Types');
export const loadSavingTypesSuccess = createAction('[Lookups] Load Saving Types Success', props<{ savingTypes: SavingType[] }>());
export const loadSavingTypesFailure = createAction('[Lookups] Load Saving Types Failure', props<{ error: any }>());

export const addSavingType = createAction('[Lookups] Add Saving Type', props<{ savingType: SavingType }>());
export const addSavingTypeSuccess = createAction('[Lookups] Add Saving Type Success', props<{ savingType: SavingType }>());
export const addSavingTypeFailure = createAction('[Lookups] Add Saving Type Failure', props<{ error: any }>());

export const updateSavingType = createAction('[Lookups] Update Saving Type', props<{ savingType: SavingType }>());
export const updateSavingTypeSuccess = createAction('[Lookups] Update Saving Type Success', props<{ savingType: SavingType }>());
export const updateSavingTypeFailure = createAction('[Lookups] Update Saving Type Failure', props<{ error: any }>());

export const deleteSavingType = createAction('[Lookups] Delete Saving Type', props<{ id: string }>());
export const deleteSavingTypeSuccess = createAction('[Lookups] Delete Saving Type Success', props<{ id: string }>());
export const deleteSavingTypeFailure = createAction('[Lookups] Delete Saving Type Failure', props<{ error: any }>());

// Loan Types
export const loadLoanTypes = createAction('[Lookups] Load Loan Types');
export const loadLoanTypesSuccess = createAction('[Lookups] Load Loan Types Success', props<{ loanTypes: SharedLoanType[] }>());
export const loadLoanTypesFailure = createAction('[Lookups] Load Loan Types Failure', props<{ error: any }>());

export const addLoanType = createAction('[Lookups] Add Loan Type', props<{ loanType: SharedLoanType }>());
export const addLoanTypeSuccess = createAction('[Lookups] Add Loan Type Success', props<{ loanType: SharedLoanType }>());
export const addLoanTypeFailure = createAction('[Lookups] Add Loan Type Failure', props<{ error: any }>());

export const updateLoanType = createAction('[Lookups] Update Loan Type', props<{ loanType: SharedLoanType }>());
export const updateLoanTypeSuccess = createAction('[Lookups] Update Loan Type Success', props<{ loanType: SharedLoanType }>());
export const updateLoanTypeFailure = createAction('[Lookups] Update Loan Type Failure', props<{ error: any }>());

export const deleteLoanType = createAction('[Lookups] Delete Loan Type', props<{ id: string }>());
export const deleteLoanTypeSuccess = createAction('[Lookups] Delete Loan Type Success', props<{ id: string }>());
export const deleteLoanTypeFailure = createAction('[Lookups] Delete Loan Type Failure', props<{ error: any }>());
