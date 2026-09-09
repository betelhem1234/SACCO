import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectToken = createSelector(
    selectAuthState,
    (state: AuthState) => state.token
);

export const selectUser = createSelector(
    selectAuthState,
    (state: AuthState) => state.user
);

export const selectRoles = createSelector(
    selectUser,
    (user) => user?.roles || []
);

export const selectAuthError = createSelector(
    selectAuthState,
    (state: AuthState) => state.error
);

export const selectAuthLoading = createSelector(
    selectAuthState,
    (state: AuthState) => state.loading
);

export const selectIsLoggedIn = createSelector(
    selectToken,
    (token) => !!token
);
