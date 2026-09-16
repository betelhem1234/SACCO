import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule, MatOption } from '@angular/material/select';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Account, ExpenseRequest, RentalContract } from '@sacco/shared-models';
import { AppState } from '../../../models/state.model';
import { selectAllAccounts } from '../../../state/lookups/lookups.selectors';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-expense-request-form',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSelectModule,
    MatOption,
    ReactiveFormsModule,
  ],
  templateUrl: './expense-request-form.component.html',
})
export class ExpenseRequestFormComponent implements OnInit {
  form!: FormGroup;
  editMode = false;
  accounts$!: Observable<Account[]>;
  contracts!: RentalContract[];

  readonly categories = [
    { value: 'EQUIPMENT', label: 'Equipment' },
    { value: 'CONSUMABLE', label: 'Consumable' },
    { value: 'RENT', label: 'Rent' },
    { value: 'OTHER', label: 'Other' },
  ];
  readonly frequencies = [
    { value: 'DAILY', label: 'Daily' },
    { value: 'MONTHLY', label: 'Monthly' },
    { value: 'YEARLY', label: 'Yearly' },
  ];

  constructor(
    private store: Store<AppState>,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ExpenseRequestFormComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { request?: ExpenseRequest; contracts: RentalContract[] }
  ) {
    this.contracts = data?.contracts ?? [];
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      id: [''],
      category: ['EQUIPMENT', Validators.required],
      title: ['', Validators.required],
      requestedBy: [''],
      requestedDate: [Date.now()],
      amount: [null],
      note: [''],
      assetName: [''],
      quantity: [1],
      supplier: [''],
      landlord: [''],
      frequency: ['MONTHLY'],
      amountPerPeriod: [null],
      periodsCovered: [1],
      contractId: [null],
      paymentAccountId: [null],
    });
    if (this.data?.request) {
      this.editMode = true;
      this.form.patchValue(this.data.request);
    }
    this.accounts$ = this.store.select(selectAllAccounts);
  }

  get category(): string {
    return this.form.get('category')?.value;
  }

  submit() {
    if (this.form.invalid) return;
    const data = { ...this.form.value };
    data.requestedBy = data.requestedBy || 'admin';
    this.dialogRef.close(data);
  }

  onCancel() { this.dialogRef.close(); }
}