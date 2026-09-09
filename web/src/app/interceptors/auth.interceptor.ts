import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
    HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, take, switchMap, timeout } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { logout, refreshTokenSuccess } from '../state/auth/auth.actions';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    private isRefreshing = false;
    private readonly REFRESH_FAILED = '__REFRESH_FAILED__';
    private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

    constructor(private store: Store, private authService: AuthService) { }

    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        const isApiUrl = request.url.startsWith('/sacco/api');
        const token = localStorage.getItem('token');

        if (isApiUrl && token) {
            request = this.addTokenHeader(request, token);
        }

        // Never let a request hang forever (stuck "loading" states / blocked overlays).
        return next.handle(request).pipe(timeout(60000), catchError(error => {
            if (error instanceof HttpErrorResponse && !request.url.includes('auth/login') && error.status === 401) {
                return this.handle401Error(request, next);
            }
            return throwError(() => error);
        }));
    }

    private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
        if (!this.isRefreshing) {
            const refreshToken = localStorage.getItem('refreshToken');

            // No refresh token available: fail fast instead of hanging forever.
            if (!refreshToken) {
                this.store.dispatch(logout());
                return throwError(() => new HttpErrorResponse({
                    status: 401,
                    statusText: 'Unauthorized',
                    error: 'Session expired. Please log in again.'
                }));
            }

            this.isRefreshing = true;
            this.refreshTokenSubject.next(null);

            return this.authService.refreshToken(refreshToken).pipe(
                switchMap((tokenResponse: any) => {
                    this.isRefreshing = false;
                    this.store.dispatch(refreshTokenSuccess({
                        token: tokenResponse.accessToken,
                        refreshToken: tokenResponse.refreshToken
                    }));
                    this.refreshTokenSubject.next(tokenResponse.accessToken);
                    return next.handle(this.addTokenHeader(request, tokenResponse.accessToken));
                }),
                catchError((err) => {
                    this.isRefreshing = false;
                    // Unblock any request waiting for the refreshed token.
                    this.refreshTokenSubject.next(this.REFRESH_FAILED);
                    this.store.dispatch(logout());
                    return throwError(() => err);
                })
            );
        }

        // Another request is already refreshing the token; wait for it.
        return this.refreshTokenSubject.pipe(
            take(1),
            switchMap((token) => {
                if (!token || token === this.REFRESH_FAILED) {
                    return throwError(() => new HttpErrorResponse({
                        status: 401,
                        statusText: 'Unauthorized',
                        error: 'Session expired. Please log in again.'
                    }));
                }
                return next.handle(this.addTokenHeader(request, token));
            })
        );
    }

    private addTokenHeader(request: HttpRequest<any>, token: string) {
        return request.clone({ headers: request.headers.set('Authorization', 'Bearer ' + token) });
    }
}
