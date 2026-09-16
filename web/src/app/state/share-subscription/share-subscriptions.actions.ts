import { createAction, props } from '@ngrx/store';
import { ShareSubscription } from '@sacco/shared-models';

export const loadShareSubscriptions = createAction('[SHARE_SUBSCRIPTION] Load Share Subscriptions');
export const loadShareSubscriptionsSuccess = createAction('[SHARE_SUBSCRIPTION] Load Share Subscriptions Success', props<{ shareSubscriptions: ShareSubscription[] }>());
export const loadShareSubscriptionsFailure = createAction('[SHARE_SUBSCRIPTION] Load Share Subscriptions Failure', props<{ error: any }>());

export const addShareSubscription = createAction('[SHARE_SUBSCRIPTION] Add Share Subscription', props<{ shareSubscription: ShareSubscription }>());
export const addShareSubscriptionSuccess = createAction('[SHARE_SUBSCRIPTION] Add Share Subscription Success', props<{ shareSubscription: ShareSubscription }>());
export const addShareSubscriptionFailure = createAction('[SHARE_SUBSCRIPTION] Add Share Subscription Failure', props<{ error: any }>());

export const updateShareSubscription = createAction('[SHARE_SUBSCRIPTION] Update Share Subscription', props<{ shareSubscription: ShareSubscription }>());
export const updateShareSubscriptionSuccess = createAction('[SHARE_SUBSCRIPTION] Update Share Subscription Success', props<{ shareSubscription: ShareSubscription }>());
export const updateShareSubscriptionFailure = createAction('[SHARE_SUBSCRIPTION] Update Share Subscription Failure', props<{ error: any }>());

export const deleteShareSubscription = createAction('[SHARE_SUBSCRIPTION] Delete Share Subscription', props<{ id: string }>());
export const deleteShareSubscriptionSuccess = createAction('[SHARE_SUBSCRIPTION] Delete Share Subscription Success', props<{ id: string }>());
export const deleteShareSubscriptionFailure = createAction('[SHARE_SUBSCRIPTION] Delete Share Subscription Failure', props<{ error: any }>());

export const approveShareSubscription = createAction('[SHARE_SUBSCRIPTION] Approve Share Subscription', props<{ id: string; approvedBy?: string }>());
export const approveShareSubscriptionSuccess = createAction('[SHARE_SUBSCRIPTION] Approve Share Subscription Success', props<{ shareSubscription: ShareSubscription }>());
export const approveShareSubscriptionFailure = createAction('[SHARE_SUBSCRIPTION] Approve Share Subscription Failure', props<{ error: any }>());

export const rejectShareSubscription = createAction('[SHARE_SUBSCRIPTION] Reject Share Subscription', props<{ id: string }>());
export const rejectShareSubscriptionSuccess = createAction('[SHARE_SUBSCRIPTION] Reject Share Subscription Success', props<{ shareSubscription: ShareSubscription }>());
export const rejectShareSubscriptionFailure = createAction('[SHARE_SUBSCRIPTION] Reject Share Subscription Failure', props<{ error: any }>());

export const reverseShareSubscription = createAction('[SHARE_SUBSCRIPTION] Reverse Share Subscription', props<{ id: string }>());
export const reverseShareSubscriptionSuccess = createAction('[SHARE_SUBSCRIPTION] Reverse Share Subscription Success', props<{ shareSubscription: ShareSubscription }>());
export const reverseShareSubscriptionFailure = createAction('[SHARE_SUBSCRIPTION] Reverse Share Subscription Failure', props<{ error: any }>());
