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
