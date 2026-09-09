import { Component, Inject, OnInit, Optional } from '@angular/core';
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
import { map } from 'rxjs/operators';

import { Transfer, Member, SavingType } from '@sacco/shared-models';
import { AppState } from '../../models/state.model';
import { addTransfer, updateTransfer } from '../../state/saving-transfer/transfers.actions';
import { selectAllMembers } from '../../state/members/members.selectors';
import { selectAllSavingTypes } from '../../state/lookups/lookups.selectors';
import { loadAccounts, loadSavingTypes } from '../../state/lookups/lookups.actions';

@Component({
  selector: 'app-transfer-form',
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
  templateUrl: './transfer-form.component.html',
  styleUrls: ['./transfer-form.component.css']
})
export class TransferFormComponent implements OnInit {
  form!: FormGroup;
  editMode = false;
  members$!: Observable<Member[]>;
  savingTypes$!: Observable<SavingType[]>;

  constructor(
    private store: Store<AppState>,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TransferFormComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: { transfer?: Transfer; memberId?: string } | undefined
  ) {}

  ngOnInit(): void {
    this.store.dispatch(loadAccounts({}));
    this.store.dispatch(loadSavingTypes());

    this.members$ = this.store.select(selectAllMembers);
    this.savingTypes$ = this.store.select(selectAllSavingTypes);

    const t = this.data?.transfer;
    this.editMode = !!(t?.id);

    const dateStr = t?.date
      ? new Date(t.date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    this.form = this.fb.group({
      sourceMemberId: [t?.sourceMemberId ?? this.data?.memberId ?? '', Validators.required],
      sourceSavingTypeId: [t?.sourceSavingTypeId ?? '', Validators.required],
      destinationMemberId: [t?.destinationMemberId ?? '', Validators.required],
      destinationSavingTypeId: [t?.destinationSavingTypeId ?? '', Validators.required],
      amount: [t?.amount ?? '', [Validators.required, Validators.min(1)]],
      ftp: [t?.ftp ?? '', Validators.required],
      date: [dateStr, Validators.required],
      remark: [t?.remark ?? ''],
    });
  }

  submit() {
    if (this.form.invalid) return;
    const v = this.form.value;
    const date = new Date(v.date).getTime();

    if (this.editMode && this.data?.transfer?.id) {
      const transfer: Transfer = {
        ...this.data.transfer,
        sourceMemberId: v.sourceMemberId,
        sourceSavingTypeId: v.sourceSavingTypeId,
        destinationMemberId: v.destinationMemberId,
        destinationSavingTypeId: v.destinationSavingTypeId,
        amount: Number(v.amount),
        ftp: v.ftp,
        date,
        remark: v.remark || undefined,
        createdAt: this.data.transfer.createdAt,
      };
      this.store.dispatch(updateTransfer({ transfer }));
    } else {
      const transfer: Transfer = {
        sourceMemberId: v.sourceMemberId,
        sourceSavingTypeId: v.sourceSavingTypeId,
        destinationMemberId: v.destinationMemberId,
        destinationSavingTypeId: v.destinationSavingTypeId,
        amount: Number(v.amount),
        ftp: v.ftp,
        date,
        remark: v.remark || undefined,
        createdAt: Date.now(),
      };
      this.store.dispatch(addTransfer({ transfer }));
    }
    this.dialogRef.close(true);
  }

  onCancel() { this.dialogRef.close(); }
}
