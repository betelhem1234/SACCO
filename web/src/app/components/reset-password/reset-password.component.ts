import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
    selector: 'app-reset-password',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './reset-password.component.html',
    styleUrls: ['../login/login.component.css']
})
export class ResetPasswordComponent implements OnInit {
    token: string = '';
    password: string = '';
    message: string = '';
    error: string = '';
    loading: boolean = false;
    success: boolean = false;

    constructor(
        private route: ActivatedRoute,
        private http: HttpClient,
        private router: Router
    ) { }

    ngOnInit() {
        this.token = this.route.snapshot.queryParams['token'];
        if (!this.token) {
            this.error = "Invalid or missing token.";
        }
    }

    onSubmit() {
        this.loading = true;
        this.message = '';
        this.error = '';

        this.http.post('/sacco/api/auth/reset-password', { token: this.token, newPassword: this.password }).subscribe({
            next: (res: any) => {
                this.message = "Password has been successfully reset.";
                this.loading = false;
                this.success = true;
            },
            error: (err) => {
                this.error = "Failed to reset password. Token may be expired.";
                this.loading = false;
            }
        });
    }
}
