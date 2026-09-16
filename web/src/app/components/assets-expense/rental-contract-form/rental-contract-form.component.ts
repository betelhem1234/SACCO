import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule, MatOption } from '@angular/material/select';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { RentalContract } from '@sacco/shared-models';

@Component({
  selector: 'app-rental-contract-form',
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
  templateUrl: './rental-contract-form.component.html',
})
export class RentalContractFormComponent implements OnInit {
  form!: FormGroup;
  editMode = false;

  readonly frequencies = [
    { value: 'DAILY', label: 'Daily' },
    { value: 'MONTHLY', label: 'Monthly' },
    { value: 'YEARLY', label: 'Yearly' },
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RentalContractFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { contract?: RentalContract }
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      id: [''],
      propertyName: ['', Validators.required],
      description: [''],
      landlord: ['', Validators.required],
      frequency: ['MONTHLY', Validators.required],
      amountPerPeriod: [0, Validators.required],
      startDate: [new Date().toISOString().slice(0, 10), Validators.required],
      endDate: [''],
      advancePeriods: [0],
      status: ['ACTIVE'],
    });
    if (this.data?.contract) {
      this.editMode = true;
      const c: Record<string, any> = { ...this.data.contract };
      c['startDate'] = toDateInput(c['startDate'] as number);
      c['endDate'] = c['endDate'] ? toDateInput(c['endDate'] as number) : '';
      this.form.patchValue(c);
    }
  }

  submit() {
    if (this.form.invalid) return;
    const data = { ...this.form.value };
    data.startDate = fromDateInput(data.startDate);
    data.endDate = data.endDate ? fromDateInput(data.endDate) : null;
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