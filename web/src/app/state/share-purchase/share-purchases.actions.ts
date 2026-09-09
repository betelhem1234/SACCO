import { createAction, props } from '@ngrx/store';
import { SharePurchase } from '@sacco/shared-models';

export const loadSharePurchases = createAction('[SHARE_PURCHASE] Load Share Purchases');
export const loadSharePurchasesSuccess = createAction('[SHARE_PURCHASE] Load Share Purchases Success', props<{ sharePurchases: SharePurchase[] }>());
export const loadSharePurchasesFailure = createAction('[SHARE_PURCHASE] Load Share Purchases Failure', props<{ error: any }>());

export const addSharePurchase = createAction('[SHARE_PURCHASE] Add Share Purchase', props<{ sharePurchase: SharePurchase }>());
export const addSharePurchaseSuccess = createAction('[SHARE_PURCHASE] Add Share Purchase Success', props<{ sharePurchase: SharePurchase }>());
export const addSharePurchaseFailure = createAction('[SHARE_PURCHASE] Add Share Purchase Failure', props<{ error: any }>());

export const updateSharePurchase = createAction('[SHARE_PURCHASE] Update Share Purchase', props<{ sharePurchase: SharePurchase }>());
export const updateSharePurchaseSuccess = createAction('[SHARE_PURCHASE] Update Share Purchase Success', props<{ sharePurchase: SharePurchase }>());
export const updateSharePurchaseFailure = createAction('[SHARE_PURCHASE] Update Share Purchase Failure', props<{ error: any }>());

export const deleteSharePurchase = createAction('[SHARE_PURCHASE] Delete Share Purchase', props<{ id: string }>());
export const deleteSharePurchaseSuccess = createAction('[SHARE_PURCHASE] Delete Share Purchase Success', props<{ id: string }>());
export const deleteSharePurchaseFailure = createAction('[SHARE_PURCHASE] Delete Share Purchase Failure', props<{ error: any }>());
