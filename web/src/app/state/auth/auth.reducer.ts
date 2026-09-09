import { createReducer, on } from '@ngrx/store';
import * as AuthActions from '../auth/auth.actions';

export interface AuthState {
    token: string | null;
    refreshToken: string | null;
    user: {
        id: string;
        username: string;
        email: string;
        roles: string[];
    } | null;
    error: any | null;
    loading: boolean;
}

export const initialState: AuthState = {
    token: localStorage.getItem('token') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    error: null,
    loading: false,
};

export const authReducer = createReducer(
    initialState,
    on(AuthActions.login, state => ({ ...state, loading: true, error: null })),
    on(AuthActions.loginSuccess, (state, { response }) => {
        // Persist to local storage synchronously for interceptor access
        localStorage.setItem('token', response.token);
        localStorage.setItem('refreshToken', response.refreshToken);
        const userPayload = {
            id: response.id,
            username: response.username,
            email: response.email,
            roles: response.roles
        };
        localStorage.setItem('user', JSON.stringify(userPayload));

        return {
            ...state,
            token: response.token,
            refreshToken: response.refreshToken,
            user: userPayload,
            loading: false,
            error: null
        };
    }),
    on(AuthActions.loginFailure, (state, { error }) => ({
        ...state,
        error,
        loading: false
    })),
    on(AuthActions.logoutSuccess, state => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        return {
            ...state,
            token: null,
            refreshToken: null,
            user: null
        };
    }),
    on(AuthActions.refreshTokenSuccess, (state, { token, refreshToken }) => {
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        return {
            ...state,
            token,
            refreshToken
        };
    }),
    on(AuthActions.refreshTokenFailure, (state, { error }) => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        return { ...state, token: null, refreshToken: null, user: null, error };
    })
);
