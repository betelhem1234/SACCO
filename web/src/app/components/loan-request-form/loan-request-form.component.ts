import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { LoanRequest, Member, SharedLoanType } from '@sacco/shared-models';
import { AppState } from '../../models/state.model';
import { submitLoanRequest } from '../../state/loan/loans.actions';
import { selectAllMembers } from '../../state/members/members.selectors';
import { selectAllLoanTypes } from '../../state/lookups/lookups.selectors';

@Component({
    selector: 'app-loan-request-form',
    standalone: true,
    imports: [
        CommonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule,
        ReactiveFormsModule
    ],
    templateUrl: './loan-request-form.component.html',
    styleUrls: ['./loan-request-form.component.css']
})
export class LoanRequestFormComponent implements OnInit {
    form!: FormGroup;
    members$!: Observable<Member[]>;
    loanTypes$!: Observable<SharedLoanType[]>;

    constructor(
        private store: Store<AppState>,
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<LoanRequestFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) { }

    ngOnInit(): void {
        this.form = this.fb.group({
            memberId: ['', Validators.required],
            loanTypeId: ['', Validators.required],
            requestedAmount: [0, [Validators.required, Validators.min(1)]],
            requestedMonths: [0, [Validators.required, Validators.min(1)]],
            purpose: ['']
        });

        this.members$ = this.store.select(selectAllMembers);
        this.loanTypes$ = this.store.select(selectAllLoanTypes);
    }

    submit() {
        if (this.form.invalid) return;
        const request: LoanRequest = {
            ...this.form.value,
            status: 'PENDING'
        };
        this.store.dispatch(submitLoanRequest({ request }));
        this.dialogRef.close(true);
    }

    onCancel() { this.dialogRef.close(); }
}
