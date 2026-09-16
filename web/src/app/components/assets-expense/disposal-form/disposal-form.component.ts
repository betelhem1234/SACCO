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

import { Account, FixedAsset } from '@sacco/shared-models';
import { AppState } from '../../../models/state.model';
import { selectAllAccounts } from '../../../state/lookups/lookups.selectors';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-disposal-form',
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
  templateUrl: './disposal-form.component.html',
})
export class DisposalFormComponent implements OnInit {
  form!: FormGroup;
  accounts$!: Observable<Account[]>;

  readonly conditions = [
    { value: 'SALE', label: 'Sale' },
    { value: 'LOST', label: 'Lost' },
    { value: 'GIFT', label: 'Gifted / Donated' },
    { value: 'SCRAP', label: 'Scrapped' },
    { value: 'DAMAGED', label: 'Damaged / Write-off' },
    { value: 'OTHER', label: 'Other' },
  ];

  constructor(
    private store: Store<AppState>,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DisposalFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { asset: FixedAsset }
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      assetId: [this.data.asset.id],
      disposalDate: [new Date().toISOString().slice(0, 10), Validators.required],
      condition: ['SALE', Validators.required],
      proceeds: [0],
      proceedsAccountId: [null],
      note: [''],
    });
    this.accounts$ = this.store.select(selectAllAccounts);
  }

  get condition(): string {
    return this.form.get('condition')?.value;
  }

  submit() {
    if (this.form.invalid) return;
    const data = { ...this.form.value };
    const d = this.form.get('disposalDate')?.value;
    data.disposalDate = typeof d === 'string' ? new Date(d + 'T00:00:00').getTime() : Number(d);
    data.proceeds = data.proceeds || 0;
    this.dialogRef.close(data);
  }

  onCancel() { this.dialogRef.close(); }
}