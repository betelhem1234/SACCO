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

import { Withdrawal, Member, Account, AccountCategory, SavingType } from '@sacco/shared-models';
import { AppState } from '../../models/state.model';
import { addWithdrawal, updateWithdrawal } from '../../state/withdrawals.actions';
import { selectAllMembers } from '../../state/members.selectors';
import { selectAllAccounts, selectAllSavingTypes } from '../../state/lookups.selectors';
import { loadAccounts, loadSavingTypes } from '../../state/lookups.actions';

@Component({
    selector: 'app-withdrawal-form',
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
      <!-- Header -->
      <div class="px-6 py-5 flex items-center gap-3"
           style="background:linear-gradient(135deg,#7c3aed,#5b21b6)">
        <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background:rgba(255,255,255,0.15)">
          <span class="material-icons text-white" style="font-size:20px">payments</span>
        </div>
        <div>
          <h2 class="text-white font-bold text-base m-0">{{ editMode ? 'Edit Withdrawal' : 'Record New Withdrawal' }}</h2>
          <p class="text-xs m-0" style="color:#ddd6fe">{{ editMode ? 'Update withdrawal details' : 'Enter withdrawal transaction details' }}</p>
        </div>
      </div>

      <mat-dialog-content class="px-6 py-5">
        <form [formGroup]="form" class="flex flex-col gap-3">

          <!-- Member -->
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Select Member</mat-label>
            <mat-select formControlName="memberId" required>
              <mat-option *ngFor="let m of members$ | async" [value]="m.id">
                {{ m.fullName }} ({{ m.idNumbe || 'No ID' }})
              </mat-option>
            </mat-select>
            <mat-icon matPrefix class="mr-2" style="color:#94a3b8">person</mat-icon>
          </mat-form-field>

          <!-- Saving Type -->
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Saving Type</mat-label>
            <mat-select formControlName="savingTypeId" required>
              <mat-option *ngFor="let st of savingTypes$ | async" [value]="st.id">
                {{ st.name }}
              </mat-option>
            </mat-select>
            <mat-icon matPrefix class="mr-2" style="color:#94a3b8">category</mat-icon>
          </mat-form-field>

          <!-- Amount & FTP row -->
          <div class="flex gap-3">
            <mat-form-field appearance="outline" class="w-1/2">
              <mat-label>Amount (ETB)</mat-label>
              <input matInput type="number" formControlName="amount" required />
              <mat-icon matPrefix class="mr-2" style="color:#94a3b8">monetization_on</mat-icon>
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-1/2">
              <mat-label>FTP Reference</mat-label>
              <input matInput formControlName="ftp" required />
              <mat-icon matPrefix class="mr-2" style="color:#94a3b8">receipt</mat-icon>
            </mat-form-field>
          </div>

          <!-- Credit Bank Account -->
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Credit Bank Account</mat-label>
            <mat-select formControlName="bankId" required>
              <mat-option *ngFor="let acc of bankAccounts$ | async" [value]="acc.id">
                {{ acc.name }} <span class="text-xs opacity-70">({{ acc.accountNumber || 'no #' }})</span>
              </mat-option>
            </mat-select>
            <mat-icon matPrefix class="mr-2" style="color:#94a3b8">account_balance</mat-icon>
          </mat-form-field>

          <!-- Date -->
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Date</mat-label>
            <input matInput type="date" formControlName="date" required />
          </mat-form-field>

          <!-- Remark -->
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Remark</mat-label>
            <input matInput formControlName="remark" />
            <mat-icon matPrefix class="mr-2" style="color:#94a3b8">notes</mat-icon>
          </mat-form-field>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end" class="px-6 py-4" style="border-top:1px solid #e2e8f0">
        <button mat-button (click)="onCancel()" style="color:#64748b;font-weight:500">Cancel</button>
        <button [disabled]="!form.valid" (click)="submit()"
                class="px-5 py-2 rounded-xl text-sm font-semibold border-0 cursor-pointer ml-2 transition-all"
                style="background:linear-gradient(135deg,#7c3aed,#5b21b6);color:white;box-shadow:0 4px 12px rgba(124,58,237,0.35)">
          {{ editMode ? 'Update Withdrawal' : 'Record Withdrawal' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
    styles: [`mat-dialog-content { min-width: 480px; }`]
})
export class WithdrawalFormComponent implements OnInit {
    form!: FormGroup;
    editMode = false;
    members$!: Observable<Member[]>;
    savingTypes$!: Observable<SavingType[]>;
    bankAccounts$!: Observable<Account[]>;

    constructor(
        private store: Store<AppState>,
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<WithdrawalFormComponent>,
        @Optional() @Inject(MAT_DIALOG_DATA) public data: { withdrawal?: Withdrawal } | undefined
    ) { }

    ngOnInit(): void {
        this.store.dispatch(loadAccounts({}));
        this.store.dispatch(loadSavingTypes());

        this.members$ = this.store.select(selectAllMembers);
        this.savingTypes$ = this.store.select(selectAllSavingTypes);
        this.bankAccounts$ = this.store.select(selectAllAccounts).pipe(
            map(accounts => (accounts ?? []).filter(a => a.accountCategory === AccountCategory.BANK_ACCOUNT && a.isActive !== false))
        );

        const w = this.data?.withdrawal;
        this.editMode = !!(w?.id);

        const dateStr = w?.date
            ? new Date(w.date).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0];

        this.form = this.fb.group({
            memberId: [w?.memberId ?? '', Validators.required],
            savingTypeId: [w?.savingTypeId ?? '', Validators.required],
            amount: [w?.amount ?? '', [Validators.required, Validators.min(1)]],
            ftp: [w?.ftp ?? '', Validators.required],
            bankId: [w?.bankId ?? '', Validators.required],
            date: [dateStr, Validators.required],
            remark: [w?.remark ?? ''],
        });
    }

    submit() {
        if (this.form.invalid) return;
        const v = this.form.value;
        const date = new Date(v.date).getTime();

        if (this.editMode && this.data?.withdrawal?.id) {
            const withdrawal: Withdrawal = {
                ...this.data.withdrawal,
                memberId: v.memberId,
                savingTypeId: v.savingTypeId,
                amount: Number(v.amount),
                ftp: v.ftp,
                bankId: v.bankId,
                date,
                remark: v.remark || undefined,
                createdAt: this.data.withdrawal.createdAt,
            };
            this.store.dispatch(updateWithdrawal({ withdrawal }));
        } else {
            const withdrawal: Withdrawal = {
                memberId: v.memberId,
                savingTypeId: v.savingTypeId,
                amount: Number(v.amount),
                ftp: v.ftp,
                bankId: v.bankId,
                date,
                remark: v.remark || undefined,
                createdAt: Date.now(),
            };
            this.store.dispatch(addWithdrawal({ withdrawal }));
        }
        this.dialogRef.close(true);
    }

    onCancel() { this.dialogRef.close(); }
}
