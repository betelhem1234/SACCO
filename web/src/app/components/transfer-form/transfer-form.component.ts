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

import { Transfer, Member, SavingType, Account, AccountCategory } from '@sacco/shared-models';
import { AppState } from '../../models/state.model';
import { addTransfer, updateTransfer } from '../../state/saving-transfer/transfers.actions';
import { selectAllMembers } from '../../state/members/members.selectors';
import { selectAllSavingTypes, selectAllAccounts } from '../../state/lookups/lookups.selectors';
import { loadAccounts, loadSavingTypes } from '../../state/lookups/lookups.actions';
import { SettingsService } from '../../services/settings.service';

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
  bankAccounts$!: Observable<Account[]>;

  constructor(
    private store: Store<AppState>,
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private dialogRef: MatDialogRef<TransferFormComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: { transfer?: Transfer; memberId?: string } | undefined
  ) {}

  ngOnInit(): void {
    this.store.dispatch(loadAccounts({}));
    this.store.dispatch(loadSavingTypes());

    this.members$ = this.store.select(selectAllMembers);
    this.savingTypes$ = this.store.select(selectAllSavingTypes);
    this.bankAccounts$ = this.store.select(selectAllAccounts).pipe(
      map(accounts => (accounts ?? []).filter(a =>
        (a.accountCategory === AccountCategory.BANK_ACCOUNT || a.accountCategory === AccountCategory.CASH_ACCOUNT)
        && a.isActive !== false))
    );

    this.settingsService.load();

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
      feeSource: [t?.feeSource && t.feeSource !== 'NONE' ? t.feeSource : ''],
      bankId: [t?.bankId ?? ''],
    });
  }

  get requiresServiceFee(): boolean {
    return this.settingsService.get('transfer_requires_service_fee') === 'true';
  }

  get feeFlat(): number {
    return Number(this.settingsService.get('transfer_service_fee_flat') || 0);
  }

  get feePct(): number {
    return Number(this.settingsService.get('transfer_service_fee_percentage') || 0);
  }

  get feePayable(): boolean {
    return this.requiresServiceFee
      && (this.feeFlat > 0 || this.feePct > 0)
      && !!this.settingsService.get('transfer_service_fee_account_id');
  }

  computedFee(): number {
    if (!this.feePayable) return 0;
    const amount = Number(this.form?.get('amount')?.value) || 0;
    return Math.round((this.feeFlat + amount * this.feePct / 100) * 100) / 100;
  }

  submit() {
    if (this.form.invalid) return;
    const v = this.form.value;
    const date = new Date(v.date).getTime();

    let feeSource = 'NONE';
    let bankId = '';
    if (this.feePayable) {
      feeSource = v.feeSource || '';
      if (feeSource !== 'SAVING' && feeSource !== 'BANK') {
        window.alert('Choose where the transfer service fee is paid from (saving or bank).');
        return;
      }
      if (feeSource === 'BANK' && !v.bankId) {
        window.alert('Select the bank account used to pay the service fee.');
        return;
      }
      bankId = feeSource === 'BANK' ? v.bankId : '';
    }

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
        feeSource: feeSource as 'NONE' | 'SAVING' | 'BANK',
        bankId: bankId || undefined,
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
        feeSource: feeSource as 'NONE' | 'SAVING' | 'BANK',
        bankId: bankId || undefined,
        createdAt: Date.now(),
      };
      this.store.dispatch(addTransfer({ transfer }));
    }
    this.dialogRef.close(true);
  }

  onCancel() { this.dialogRef.close(); }
}
