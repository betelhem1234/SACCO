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
import { addLoanType, updateLoanType } from '../../state/lookups/lookups.actions';
import { map, Observable } from 'rxjs';
import { selectAllAccounts } from 'src/app/state/lookups/lookups.selectors';
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
  templateUrl: './loan-type-form.component.html',
  styleUrls: ['./loan-type-form.component.css']
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
