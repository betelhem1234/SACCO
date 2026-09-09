import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { RouterModule } from '@angular/router';
import { login } from '../../state/auth/auth.actions';
import { selectAuthError, selectAuthLoading } from '../../state/auth/auth.selectors';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
    loginForm!: FormGroup;
    error$;
    loading$;

    constructor(
        private fb: FormBuilder,
        private store: Store
    ) {
        this.error$ = this.store.select(selectAuthError);
        this.loading$ = this.store.select(selectAuthLoading);
    }

    ngOnInit(): void {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required]
        });
    }

    onSubmit(): void {
        if (this.loginForm.valid) {
            this.store.dispatch(login({
                email: this.loginForm.value.email,
                password: this.loginForm.value.password
            }));
        }
    }
}
