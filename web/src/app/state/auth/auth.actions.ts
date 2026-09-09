import { createAction, props } from '@ngrx/store';
import { JwtResponse } from '../../services/auth.service';

export const login = createAction(
    '[Auth] Login Request',
    props<{ email: string; password: string }>()
);

export const loginSuccess = createAction(
    '[Auth] Login Success',
    props<{ response: JwtResponse }>()
);

export const loginFailure = createAction(
    '[Auth] Login Failure',
    props<{ error: any }>()
);

export const logout = createAction('[Auth] Logout');
export const logoutSuccess = createAction('[Auth] Logout Success');

export const refreshToken = createAction(
    '[Auth] Refresh Token',
    props<{ refreshToken: string }>()
);

export const refreshTokenSuccess = createAction(
    '[Auth] Refresh Token Success',
    props<{ token: string; refreshToken: string }>()
);

export const refreshTokenFailure = createAction(
    '[Auth] Refresh Token Failure',
    props<{ error: any }>()
);
