import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import {
    Account,
    AccountType,
    AccountCategory,
    ACCOUNT_TYPE_OPTIONS,
    ACCOUNT_CATEGORY_OPTIONS,
} from '@sacco/shared-models';
import { AppState } from '../../models/state.model';
import { addAccount, updateAccount } from '../../state/lookups.actions';

@Component({
    selector: 'app-account-form',
    standalone: true,
    imports: [
        CommonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule,
        ReactiveFormsModule,
    ],
    template: `
    <div>
      <div class="px-6 py-5 flex items-center gap-3" style="background:linear-gradient(135deg,#1e3a5f,#2d5282)">
        <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background:rgba(255,255,255,0.15)">
          <span class="material-icons text-white" style="font-size:20px">account_balance_wallet</span>
        </div>
        <div>
          <h2 class="text-white font-bold text-base m-0">{{ editMode ? 'Edit account' : 'New account' }}</h2>
          <p class="text-xs m-0" style="color:#93c5fd">Set type, category, and identifiers</p>
        </div>
      </div>
      <mat-dialog-content class="px-6 py-5">
        <form [formGroup]="form" class="flex flex-col gap-3">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Name</mat-label>
            <input matInput formControlName="name" required />
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Description</mat-label>
            <input matInput formControlName="description" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Account number</mat-label>
            <input matInput formControlName="accountNumber" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Account type</mat-label>
            <mat-select formControlName="accountType" required>
              <mat-option *ngFor="let o of typeOptions" [value]="o.value">{{ o.label }}</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Account category</mat-label>
            <mat-select formControlName="accountCategory" required>
              <mat-option *ngFor="let o of categoryOptions" [value]="o.value">{{ o.label }}</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Effective date</mat-label>
            <input matInput type="date" formControlName="dateStr" required />
          </mat-form-field>

          <div class="flex gap-6 flex-wrap">
            <mat-slide-toggle formControlName="isActive">Active</mat-slide-toggle>
            <mat-slide-toggle formControlName="isParent">Parent account</mat-slide-toggle>
          </div>
        </form>
      </mat-dialog-content>
      <mat-dialog-actions align="end" class="px-6 py-4" style="border-top:1px solid #e2e8f0">
        <button mat-button (click)="onCancel()" style="color:#64748b;font-weight:500">Cancel</button>
        <button [disabled]="!form.valid" (click)="submit()"
                class="px-5 py-2 rounded-xl text-sm font-semibold border-0 cursor-pointer ml-2 transition-all"
                style="background:linear-gradient(135deg,#1e3a5f,#2d5282);color:white">
          {{ editMode ? 'Update account' : 'Save account' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
    styles: [`mat-dialog-content { min-width: 420px; max-height: 70vh; }`],
})
export class AccountFormComponent implements OnInit {
    form!: FormGroup;
    editMode = false;
    readonly typeOptions = ACCOUNT_TYPE_OPTIONS;
    readonly categoryOptions = ACCOUNT_CATEGORY_OPTIONS;

    constructor(
        private store: Store<AppState>,
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<AccountFormComponent>,
        @Optional() @Inject(MAT_DIALOG_DATA) public data: { account?: Account } | undefined
    ) {}

    ngOnInit(): void {
        const a = this.data?.account;
        this.editMode = !!a?.id;

        const dateStr = a?.date
            ? new Date(a.date).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0];

        this.form = this.fb.group({
            name: [a?.name ?? '', Validators.required],
            description: [a?.description ?? ''],
            accountNumber: [a?.accountNumber ?? ''],
            accountType: [a?.accountType ?? AccountType.ASSET, Validators.required],
            accountCategory: [a?.accountCategory ?? AccountCategory.OTHER_ACCOUNT, Validators.required],
            dateStr: [dateStr, Validators.required],
            isActive: [a?.isActive ?? true],
            isParent: [a?.isParent ?? false],
        });
    }

    submit(): void {
        if (this.form.invalid) return;
        const v = this.form.value;
        const date = new Date(v.dateStr).getTime();

        if (this.editMode && this.data?.account?.id) {
            const account: Account = {
                ...this.data.account,
                id: this.data.account.id,
                name: v.name,
                description: v.description || undefined,
                accountNumber: v.accountNumber || undefined,
                accountType: v.accountType as AccountType,
                accountCategory: v.accountCategory as AccountCategory,
                date,
                isActive: v.isActive,
                isParent: v.isParent,
            };
            this.store.dispatch(updateAccount({ account }));
        } else {
            const account: Account = {
                name: v.name,
                description: v.description || undefined,
                accountNumber: v.accountNumber || undefined,
                accountType: v.accountType as AccountType,
                accountCategory: v.accountCategory as AccountCategory,
                date,
                isActive: v.isActive,
                isParent: v.isParent,
            };
            this.store.dispatch(addAccount({ account }));
        }
        this.dialogRef.close(true);
    }

    onCancel(): void {
        this.dialogRef.close();
    }
}
