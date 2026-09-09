import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './forgot-password.component.html',
    styleUrls: ['../login/login.component.css'] // reuse login styles
})
export class ForgotPasswordComponent {
    email: string = '';
    message: string = '';
    error: string = '';
    loading: boolean = false;

    constructor(private http: HttpClient) { }

    onSubmit() {
        this.loading = true;
        this.message = '';
        this.error = '';

        this.http.post('/sacco/api/auth/forgot-password', { email: this.email }).subscribe({
            next: (res: any) => {
                this.message = "Check your email for a reset link.";
                this.loading = false;
            },
            error: (err) => {
                this.error = "Failed to send reset link.";
                this.loading = false;
            }
        });
    }
}
