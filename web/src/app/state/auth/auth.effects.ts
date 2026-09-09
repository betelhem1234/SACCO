import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthService } from '../../services/auth.service';
import * as AuthActions from '../auth/auth.actions';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Router } from '@angular/router';

@Injectable()
export class AuthEffects {
    private actions$ = inject(Actions);
    private authService = inject(AuthService);
    private router = inject(Router);

    login$ = createEffect(() => this.actions$.pipe(
        ofType(AuthActions.login),
        mergeMap(action =>
            this.authService.login({ email: action.email, password: action.password }).pipe(
                map(response => AuthActions.loginSuccess({ response })),
                catchError(error => of(AuthActions.loginFailure({ error: error.message || 'Login Failed' })))
            )
        )
    ));

    loginSuccess$ = createEffect(() => this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(() => this.router.navigate(['/'])) // redirect on success
    ), { dispatch: false });

    logout$ = createEffect(() => this.actions$.pipe(
        ofType(AuthActions.logout),
        mergeMap(() =>
            this.authService.logout().pipe(
                map(() => AuthActions.logoutSuccess()),
                catchError(() => of(AuthActions.logoutSuccess())) // Always succeed local logout
            )
        )
    ));

    logoutSuccess$ = createEffect(() => this.actions$.pipe(
        ofType(AuthActions.logoutSuccess, AuthActions.refreshTokenFailure),
        tap(() => this.router.navigate(['/login']))
    ), { dispatch: false });
}
