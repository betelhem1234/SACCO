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
import { submitLoanRequest } from '../../state/loans.actions';
import { selectAllMembers } from '../../state/members.selectors';
import { selectAllLoanTypes } from '../../state/lookups.selectors';

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
    template: `
    <div>
      <div class="px-6 py-5 flex items-center gap-3" style="background:linear-gradient(135deg,#1e3a5f,#2d5282)">
        <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background:rgba(255,255,255,0.15)">
          <span class="material-icons text-white" style="font-size:20px">request_quote</span>
        </div>
        <div>
          <h2 class="text-white font-bold text-base m-0">Apply For Loan</h2>
          <p class="text-xs m-0" style="color:#93c5fd">Fill in the loan application details</p>
        </div>
      </div>

      <mat-dialog-content class="px-6 py-5">
        <form [formGroup]="form" class="flex flex-col gap-3">
          
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Member</mat-label>
            <mat-select formControlName="memberId">
              <mat-option *ngFor="let member of members$ | async" [value]="member.id">
                {{ member.fullName }} ({{ member.idNumbe }})
              </mat-option>
            </mat-select>
            <mat-icon matPrefix class="mr-2" style="color:#94a3b8">person</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Loan Type</mat-label>
            <mat-select formControlName="loanTypeId">
              <mat-option *ngFor="let lt of loanTypes$ | async" [value]="lt.id">
                {{ lt.name }}
              </mat-option>
            </mat-select>
            <mat-icon matPrefix class="mr-2" style="color:#94a3b8">category</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Requested Amount</mat-label>
            <input matInput formControlName="requestedAmount" type="number" required />
            <mat-icon matPrefix class="mr-2" style="color:#94a3b8">attach_money</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Requested Months (Term)</mat-label>
            <input matInput formControlName="requestedMonths" type="number" required />
            <mat-icon matPrefix class="mr-2" style="color:#94a3b8">calendar_month</mat-icon>
            <mat-hint>Duration to repay the loan in months</mat-hint>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Purpose</mat-label>
            <textarea matInput formControlName="purpose" rows="3"></textarea>
            <mat-icon matPrefix class="mr-2" style="color:#94a3b8">description</mat-icon>
          </mat-form-field>

        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end" class="px-6 py-4" style="border-top:1px solid #e2e8f0">
        <button mat-button (click)="onCancel()" style="color:#64748b;font-weight:500">Cancel</button>
        <button [disabled]="!form.valid" (click)="submit()"
                class="px-5 py-2 rounded-xl text-sm font-semibold border-0 cursor-pointer ml-2 transition-all"
                style="background:linear-gradient(135deg,#1e3a5f,#2d5282);color:white;box-shadow:0 4px 12px rgba(30,58,95,0.3)">
          Submit Request
        </button>
      </mat-dialog-actions>
    </div>
  `,
    styles: [`
    mat-dialog-content { min-width: 420px; }
  `]
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
