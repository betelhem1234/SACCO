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

import { Account, RentalContract, RentalPayment } from '@sacco/shared-models';
import { AppState } from '../../../models/state.model';
import { selectAllAccounts } from '../../../state/lookups/lookups.selectors';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-rental-payment-form',
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
  templateUrl: './rental-payment-form.component.html',
})
export class RentalPaymentFormComponent implements OnInit {
  form!: FormGroup;
  accounts$!: Observable<Account[]>;
  contracts!: RentalContract[];

  constructor(
    private store: Store<AppState>,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RentalPaymentFormComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { payment?: RentalPayment; contracts: RentalContract[] }
  ) {
    this.contracts = data?.contracts ?? [];
  }

  ngOnInit(): void {
    const today = new Date().toISOString().slice(0, 10);
    this.form = this.fb.group({
      id: [''],
      contractId: [this.contracts[0]?.id ?? null, Validators.required],
      paidFrom: [today, Validators.required],
      paidTo: [today, Validators.required],
      amountPaid: [0, Validators.required],
      payDate: [today, Validators.required],
      paidBy: ['admin'],
      paymentAccountId: [null],
      note: [''],
    });
    if (this.data?.payment) {
      const p: Record<string, any> = { ...this.data.payment };
      p['paidFrom'] = toDateInput(p['paidFrom'] as number);
      p['paidTo'] = toDateInput(p['paidTo'] as number);
      p['payDate'] = toDateInput(p['payDate'] as number);
      this.form.patchValue(p);
    }
    this.accounts$ = this.store.select(selectAllAccounts);
  }

  submit() {
    if (this.form.invalid) return;
    const data = { ...this.form.value };
    data.paidFrom = fromDateInput(data.paidFrom);
    data.paidTo = fromDateInput(data.paidTo);
    data.payDate = fromDateInput(data.payDate);
    this.dialogRef.close(data);
  }

  onCancel() { this.dialogRef.close(); }
}

function toDateInput(epoch: number | undefined): string {
  if (epoch == null) return '';
  const d = new Date(epoch);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function fromDateInput(value: any): number {
  if (value == null || value === '') return Date.now();
  const t = typeof value === 'string' ? new Date(value + 'T00:00:00').getTime() : Number(value);
  return isNaN(t) ? Date.now() : t;
}