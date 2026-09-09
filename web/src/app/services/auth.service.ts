import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface JwtResponse {
    token: string;
    refreshToken: string;
    id: string;
    username: string;
    email: string;
    roles: string[];
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private authUrl = '/sacco/api/auth';

    constructor(private http: HttpClient) { }

    login(credentials: { email: string, password: string }): Observable<JwtResponse> {
        return this.http.post<JwtResponse>(`${this.authUrl}/login`, credentials);
    }

    logout(): Observable<any> {
        return this.http.post(`${this.authUrl}/logout`, {});
    }

    refreshToken(token: string): Observable<{ accessToken: string, refreshToken: string }> {
        return this.http.post<{ accessToken: string, refreshToken: string }>(`${this.authUrl}/refresh`, {
            refreshToken: token
        });
    }
}
