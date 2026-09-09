import { createAction, props } from '@ngrx/store';
import { Account, SavingType, SharedLoanType, AccountClassification } from '@sacco/shared-models';

export interface LookupItem {
  id: string;
  name: string;
  description?: string;
  state_id?: string;
}

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

// Regions
export const loadRegions = createAction('[Lookups] Load Regions');
export const loadRegionsSuccess = createAction('[Lookups] Load Regions Success', props<{ regions: LookupItem[] }>());
export const loadRegionsFailure = createAction('[Lookups] Load Regions Failure', props<{ error: any }>());

export const addRegion = createAction('[Lookups] Add Region', props<{ region: LookupItem }>());
export const addRegionSuccess = createAction('[Lookups] Add Region Success', props<{ region: LookupItem }>());
export const addRegionFailure = createAction('[Lookups] Add Region Failure', props<{ error: any }>());

export const updateRegion = createAction('[Lookups] Update Region', props<{ region: LookupItem }>());
export const updateRegionSuccess = createAction('[Lookups] Update Region Success', props<{ region: LookupItem }>());
export const updateRegionFailure = createAction('[Lookups] Update Region Failure', props<{ error: any }>());

export const deleteRegion = createAction('[Lookups] Delete Region', props<{ id: string }>());
export const deleteRegionSuccess = createAction('[Lookups] Delete Region Success', props<{ id: string }>());
export const deleteRegionFailure = createAction('[Lookups] Delete Region Failure', props<{ error: any }>());

// Subcities
export const loadSubcities = createAction('[Lookups] Load Subcities');
export const loadSubcitiesSuccess = createAction('[Lookups] Load Subcities Success', props<{ subcities: LookupItem[] }>());
export const loadSubcitiesFailure = createAction('[Lookups] Load Subcities Failure', props<{ error: any }>());

export const addSubcity = createAction('[Lookups] Add Subcity', props<{ subcity: LookupItem }>());
export const addSubcitySuccess = createAction('[Lookups] Add Subcity Success', props<{ subcity: LookupItem }>());
export const addSubcityFailure = createAction('[Lookups] Add Subcity Failure', props<{ error: any }>());

export const updateSubcity = createAction('[Lookups] Update Subcity', props<{ subcity: LookupItem }>());
export const updateSubcitySuccess = createAction('[Lookups] Update Subcity Success', props<{ subcity: LookupItem }>());
export const updateSubcityFailure = createAction('[Lookups] Update Subcity Failure', props<{ error: any }>());

export const deleteSubcity = createAction('[Lookups] Delete Subcity', props<{ id: string }>());
export const deleteSubcitySuccess = createAction('[Lookups] Delete Subcity Success', props<{ id: string }>());
export const deleteSubcityFailure = createAction('[Lookups] Delete Subcity Failure', props<{ error: any }>());

// Educations
export const loadEducations = createAction('[Lookups] Load Educations');
export const loadEducationsSuccess = createAction('[Lookups] Load Educations Success', props<{ educations: LookupItem[] }>());
export const loadEducationsFailure = createAction('[Lookups] Load Educations Failure', props<{ error: any }>());

export const addEducation = createAction('[Lookups] Add Education', props<{ education: LookupItem }>());
export const addEducationSuccess = createAction('[Lookups] Add Education Success', props<{ education: LookupItem }>());
export const addEducationFailure = createAction('[Lookups] Add Education Failure', props<{ error: any }>());

export const updateEducation = createAction('[Lookups] Update Education', props<{ education: LookupItem }>());
export const updateEducationSuccess = createAction('[Lookups] Update Education Success', props<{ education: LookupItem }>());
export const updateEducationFailure = createAction('[Lookups] Update Education Failure', props<{ error: any }>());

export const deleteEducation = createAction('[Lookups] Delete Education', props<{ id: string }>());
export const deleteEducationSuccess = createAction('[Lookups] Delete Education Success', props<{ id: string }>());
export const deleteEducationFailure = createAction('[Lookups] Delete Education Failure', props<{ error: any }>());

// Branches
export const loadBranches = createAction('[Lookups] Load Branches');
export const loadBranchesSuccess = createAction('[Lookups] Load Branches Success', props<{ branches: LookupItem[] }>());
export const loadBranchesFailure = createAction('[Lookups] Load Branches Failure', props<{ error: any }>());

// Account Classifications
export const loadAccountClassifications = createAction('[Lookups] Load Account Classifications');
export const loadAccountClassificationsSuccess = createAction('[Lookups] Load Account Classifications Success', props<{ accountClassifications: AccountClassification[] }>());
export const loadAccountClassificationsFailure = createAction('[Lookups] Load Account Classifications Failure', props<{ error: any }>());

export const addAccountClassification = createAction('[Lookups] Add Account Classification', props<{ accountClassification: AccountClassification }>());
export const addAccountClassificationSuccess = createAction('[Lookups] Add Account Classification Success', props<{ accountClassification: AccountClassification }>());
export const addAccountClassificationFailure = createAction('[Lookups] Add Account Classification Failure', props<{ error: any }>());

export const updateAccountClassification = createAction('[Lookups] Update Account Classification', props<{ accountClassification: AccountClassification }>());
export const updateAccountClassificationSuccess = createAction('[Lookups] Update Account Classification Success', props<{ accountClassification: AccountClassification }>());
export const updateAccountClassificationFailure = createAction('[Lookups] Update Account Classification Failure', props<{ error: any }>());

export const deleteAccountClassification = createAction('[Lookups] Delete Account Classification', props<{ id: string }>());
export const deleteAccountClassificationSuccess = createAction('[Lookups] Delete Account Classification Success', props<{ id: string }>());
export const deleteAccountClassificationFailure = createAction('[Lookups] Delete Account Classification Failure', props<{ error: any }>());
