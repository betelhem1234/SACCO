import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Account, SharedLoanType } from '@sacco/shared-models';
import { AppState } from '../../models/state.model';
import { addLoanType, updateLoanType } from '../../state/lookups.actions';
import { map, Observable } from 'rxjs';
import { selectAllAccounts } from 'src/app/state/lookups.selectors';
import { MatOption } from "@angular/material/select";
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-loan-type-form',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatOption,
    MatSelectModule
  ],
  template: `
    <div>
      <div class="px-6 py-5 flex items-center gap-3" style="background:linear-gradient(135deg,#1e3a5f,#2d5282)">
        <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background:rgba(255,255,255,0.15)">
          <span class="material-icons text-white" style="font-size:20px">account_balance</span>
        </div>
        <div>
          <h2 class="text-white font-bold text-base m-0">{{ editMode ? 'Edit Loan Type' : 'Register New Loan Type' }}</h2>
          <p class="text-xs m-0" style="color:#93c5fd">Fill in details below</p>
        </div>
      </div>
      <mat-dialog-content class="px-6 py-5">
        <form [formGroup]="form" class="grid grid-cols-2 gap-4">
          <!-- Basic Info -->
          <mat-form-field appearance="outline" class="w-full col-span-2">
            <mat-label>Type Name</mat-label>
            <input matInput formControlName="name" required />
            <mat-icon matPrefix class="mr-2" style="color:#94a3b8">label</mat-icon>
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-full col-span-2">
            <mat-label>Description</mat-label>
            <input matInput formControlName="description" />
            <mat-icon matPrefix class="mr-2" style="color:#94a3b8">description</mat-icon>
          </mat-form-field>
          
          <!-- Requirements -->
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Required Months</mat-label>
            <input matInput formControlName="requiredMonths" type="number" required />
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Required Saving Percentage</mat-label>
            <input matInput formControlName="requiredSavingPercentage" type="number" required />
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Required Share Percentage</mat-label>
            <input matInput formControlName="requiredSharePercentage" type="number" required />
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Required Share Unit Count</mat-label>
            <input matInput formControlName="requiredShareUnitCount" type="number" required />
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Required Maximum Amount</mat-label>
            <input matInput formControlName="requiredMaximumAmount" type="number" required />
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Maximum Repayment Months</mat-label>
            <input matInput formControlName="maximumRepaymentMonths" type="number" required />
          </mat-form-field>

          <!-- Accounts -->
          <mat-form-field appearance="outline" class="w-full">
             <mat-label>Interest Collective Acc</mat-label>
             <mat-select formControlName="interestCollectiveAccount">
               <mat-option *ngFor="let acc of accounts$ | async" [value]="acc.id">{{ acc.name }}</mat-option>
             </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-full">
             <mat-label>Late Interest Collective Acc</mat-label>
             <mat-select formControlName="lateInterestCollectiveAccount">
               <mat-option *ngFor="let acc of accounts$ | async" [value]="acc.id">{{ acc.name }}</mat-option>
             </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-full">
             <mat-label>Late Interest Payable Acc</mat-label>
             <mat-select formControlName="lateInterestPayableAccount">
               <mat-option *ngFor="let acc of accounts$ | async" [value]="acc.id">{{ acc.name }}</mat-option>
             </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-full">
             <mat-label>Long Term Principal Acc</mat-label>
             <mat-select formControlName="longTermPrincipalAccount">
               <mat-option *ngFor="let acc of accounts$ | async" [value]="acc.id">{{ acc.name }}</mat-option>
             </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-full">
             <mat-label>Short Term Principal Acc</mat-label>
             <mat-select formControlName="shortTermPrincipalAccount">
               <mat-option *ngFor="let acc of accounts$ | async" [value]="acc.id">{{ acc.name }}</mat-option>
             </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-full">
             <mat-label>Penalty Collective Acc</mat-label>
             <mat-select formControlName="penaltyCollectiveAccount">
               <mat-option *ngFor="let acc of accounts$ | async" [value]="acc.id">{{ acc.name }}</mat-option>
             </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-full">
             <mat-label>Transfer Fee Collective Acc</mat-label>
             <mat-select formControlName="transferFeeCollectiveAccount">
               <mat-option *ngFor="let acc of accounts$ | async" [value]="acc.id">{{ acc.name }}</mat-option>
             </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-full">
             <mat-label>Service Fee Collective Acc</mat-label>
             <mat-select formControlName="serviceFeeCollectiveAccount">
               <mat-option *ngFor="let acc of accounts$ | async" [value]="acc.id">{{ acc.name }}</mat-option>
             </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-full">
             <mat-label>Insurance Fee Collective Acc</mat-label>
             <mat-select formControlName="insuranceFeeCollectiveAccount">
               <mat-option *ngFor="let acc of accounts$ | async" [value]="acc.id">{{ acc.name }}</mat-option>
             </mat-select>
          </mat-form-field>
          
          <!-- Interest Amounts -->
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Male Interest Amount</mat-label>
            <input matInput formControlName="maleInterestAmount" type="number" required />
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Female Interest Amount</mat-label>
            <input matInput formControlName="femaleInterestAmount" type="number" required />
          </mat-form-field>
          
          <!-- Other -->
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Loan Code</mat-label>
            <input matInput formControlName="loanCode" type="number" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Loan Term</mat-label>
            <mat-select formControlName="loanTerm">
              <mat-option value="ShortTerm">Short Term</mat-option>
              <mat-option value="MediumTerm">Medium Term</mat-option>
              <mat-option value="LongTerm">Long Term</mat-option>
            </mat-select>
          </mat-form-field>
        </form>
      </mat-dialog-content>
      <mat-dialog-actions align="end" class="px-6 py-4" style="border-top:1px solid #e2e8f0;margin-top:auto">
        <button mat-button (click)="onCancel()" style="color:#64748b;font-weight:500">Cancel</button>
        <button [disabled]="!form.valid" (click)="submit()"
                class="px-5 py-2 rounded-xl text-sm font-semibold border-0 cursor-pointer ml-2 transition-all"
                style="background:linear-gradient(135deg,#1e3a5f,#2d5282);color:white;box-shadow:0 4px 12px rgba(30,58,95,0.3)">
          {{ editMode ? 'Update Type' : 'Save Type' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`mat-dialog-content { min-height: 50vh; max-height: 70vh; }`]
})
export class LoanTypeFormComponent implements OnInit {
  form!: FormGroup;
  editMode = false;
  accounts$!: Observable<Account[]>;

  constructor(
    private store: Store<AppState>,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<LoanTypeFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { loanType?: SharedLoanType }
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      id: [''],
      name: ['', Validators.required],
      description: [''],
      requiredMonths: [0, Validators.required],
      requiredSavingPercentage: [0, Validators.required],
      requiredSharePercentage: [0, Validators.required],
      maleInterestAmount: [0, Validators.required],
      femaleInterestAmount: [0, Validators.required],
      requiredMaximumAmount: [0, Validators.required],
      maximumRepaymentMonths: [0, Validators.required],
      requiredShareUnitCount: [0, Validators.required],
      interestCollectiveAccount: [null],
      lateInterestCollectiveAccount: [null],
      lateInterestPayableAccount: [null],
      longTermPrincipalAccount: [null],
      shortTermPrincipalAccount: [null],
      penaltyCollectiveAccount: [null],
      transferFeeCollectiveAccount: [null],
      serviceFeeCollectiveAccount: [null],
      insuranceFeeCollectiveAccount: [null],
      loanCode: [null],
      loanTerm: [null]
    });
    if (this.data?.loanType) {
      this.editMode = true;
      this.form.patchValue(this.data.loanType);
    }
    this.accounts$ = this.store.select(selectAllAccounts);
  }

  submit() {
    if (this.form.invalid) return;
    const data = { ...this.form.value };
    if (this.editMode && data.id) {
      this.store.dispatch(updateLoanType({ loanType: data as SharedLoanType }));
    } else {
      delete data.id;
      this.store.dispatch(addLoanType({ loanType: data as SharedLoanType }));
    }
    this.dialogRef.close(true);
  }

  onCancel() { this.dialogRef.close(); }
}
