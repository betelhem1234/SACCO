import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { FixedAsset } from '@sacco/shared-models';

@Component({
  selector: 'app-asset-form',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatCheckboxModule,
    ReactiveFormsModule,
  ],
  templateUrl: './asset-form.component.html',
})
export class AssetFormComponent implements OnInit {
  form!: FormGroup;
  editMode = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AssetFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { asset?: FixedAsset }
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      id: [''],
      name: ['', Validators.required],
      category: ['EQUIPMENT'],
      description: [''],
      purchaseDate: [Date.now(), Validators.required],
      cost: [0, Validators.required],
      supplier: [''],
      depreciable: [true],
      usefulLifeYears: [5],
      salvageValue: [0],
      status: ['ACTIVE'],
    });
    if (this.data?.asset) {
      this.editMode = true;
      const a: Record<string, any> = { ...this.data.asset };
      a['purchaseDate'] = toDateInput(a['purchaseDate'] as number);
      this.form.patchValue(a);
    }
  }

  submit() {
    if (this.form.invalid) return;
    const data = { ...this.form.value };
    data.purchaseDate = fromDateInput(data.purchaseDate);
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
  if (value == null) return Date.now();
  const t = typeof value === 'string' ? new Date(value + 'T00:00:00').getTime() : Number(value);
  return isNaN(t) ? Date.now() : t;
}