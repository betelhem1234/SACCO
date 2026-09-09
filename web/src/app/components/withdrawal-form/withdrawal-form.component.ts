import { Component, Inject, OnInit, Optional, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Withdrawal, Member, Account, AccountCategory, SavingType, Saving } from '@sacco/shared-models';
import { AppState } from '../../models/state.model';
import { addWithdrawal, updateWithdrawal } from '../../state/withdrawals/withdrawals.actions';
import { selectAllMembers } from '../../state/members/members.selectors';
import { selectAllAccounts, selectAllSavingTypes } from '../../state/lookups/lookups.selectors';
import { loadAccounts, loadSavingTypes } from '../../state/lookups/lookups.actions';
import { ApiService } from '../../services/api.service';
import { SettingsService } from '../../services/settings.service';

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
        MatSnackBarModule,
        ReactiveFormsModule
    ],
    templateUrl: './withdrawal-form.component.html',
    styleUrls: ['./withdrawal-form.component.css']
})
export class WithdrawalFormComponent implements OnInit {
    private api = inject(ApiService);
    private snackBar = inject(MatSnackBar);

    withdrawalLimit: number = 0;
    withdrawalIntervalDays: number = 0;
    lastWithdrawalDate: number | null = null;

    form!: FormGroup;
    editMode = false;
    members$!: Observable<Member[]>;
    savingTypes$!: Observable<SavingType[]>;
    bankAccounts$!: Observable<Account[]>;

    allSavings: Saving[] = [];
    availableBalance: number | null = null;

    get balanceColor(): string {
        if (this.availableBalance === null) return '#64748b';
        const amount = Number(this.form?.get('amount')?.value) || 0;
        return amount > this.availableBalance ? '#ef4444' : '#059669';
    }

    constructor(
        private store: Store<AppState>,
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<WithdrawalFormComponent>,
        @Optional() @Inject(MAT_DIALOG_DATA) public data: { withdrawal?: Withdrawal; memberId?: string } | undefined
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
            memberId: [w?.memberId ?? this.data?.memberId ?? '', Validators.required],
            savingTypeId: [w?.savingTypeId ?? '', Validators.required],
            amount: [w?.amount ?? '', [Validators.required, Validators.min(1)]],
            ftp: [w?.ftp ?? '', Validators.required],
            bankId: [w?.bankId ?? '', Validators.required],
            date: [dateStr, Validators.required],
            remark: [w?.remark ?? ''],
        });

        // Fetch all savings via API for balance calculation
        this.api.getSavings().subscribe({
            next: s => {
                this.allSavings = s ?? [];
                const memberId = this.form.get('memberId')?.value;
                const savingTypeId = this.form.get('savingTypeId')?.value;
                if (memberId && savingTypeId) this.updateBalance(memberId, savingTypeId);
            },
            error: () => this.snackBar.open('Failed to load savings data', 'Close', { duration: 3000 }),
        });

        // Recalculate balance when member or saving type changes
        this.form.get('memberId')?.valueChanges.subscribe(memberId => {
            const savingTypeId = this.form.get('savingTypeId')?.value;
            this.updateBalance(memberId, savingTypeId);
            this.loadLastWithdrawal();
        });
        this.form.get('savingTypeId')?.valueChanges.subscribe(savingTypeId => {
            const memberId = this.form.get('memberId')?.value;
            this.updateBalance(memberId, savingTypeId);
        });
        // Initial recalculation if both are already set (edit mode)
        if (w?.memberId && w?.savingTypeId) {
            this.updateBalance(w.memberId, w.savingTypeId);
        }

        // Load withdrawal policy settings (limit + interval)
        this.api.getSettings().subscribe({
            next: settings => {
                const limit = Number(settings['withdrawal_limit'] || 0);
                const interval = Number(settings['withdrawal_interval_days'] || 0);
                this.withdrawalLimit = limit || 0;
                this.withdrawalIntervalDays = interval || 0;
                this.loadLastWithdrawal();
                this.validateLimit();
            },
            error: () => { /* settings unavailable; skip policy checks */ }
        });
    }

    private loadLastWithdrawal() {
        const memberId = this.form.get('memberId')?.value;
        if (!memberId) {
            this.lastWithdrawalDate = null;
            this.validateInterval();
            return;
        }
        this.api.getWithdrawals().subscribe({
            next: withdrawals => {
                const last = (withdrawals ?? [])
                    .filter(w => w.memberId === memberId && w.status !== 'REJECTED')
                    .sort((a, b) => (b.date ?? 0) - (a.date ?? 0))[0];
                this.lastWithdrawalDate = last?.date ?? null;
                this.validateInterval();
            },
            error: () => { /* ignore */ }
        });
    }

    intervalRemainingDays(): number | null {
        if (!this.withdrawalIntervalDays || !this.lastWithdrawalDate) return null;
        const date = this.form.get('date')?.value;
        if (!date) return null;
        const target = new Date(date).getTime();
        const elapsedDays = (target - this.lastWithdrawalDate) / 86_400_000;
        if (elapsedDays >= this.withdrawalIntervalDays) return 0;
        return Math.max(0, Math.ceil(this.withdrawalIntervalDays - elapsedDays));
    }

    overLimit(): boolean {
        if (!this.withdrawalLimit) return false;
        return (Number(this.form?.get('amount')?.value) || 0) > this.withdrawalLimit;
    }

    private validateLimit() {
        this.form.get('amount')?.valueChanges.subscribe(() => {
            if (this.overLimit()) {
                this.snackBar.open(
                    `Amount exceeds the per-withdrawal limit of ${this.withdrawalLimit.toFixed(2)} ETB`,
                    'Close', { duration: 4000 }
                );
            }
        });
    }

    private validateInterval() {
        this.form.get('date')?.valueChanges.subscribe(() => {
            const rem = this.intervalRemainingDays();
            if (rem !== null && rem > 0) {
                this.snackBar.open(
                    `Member can withdraw again in ${rem} day(s)`,
                    'Close', { duration: 4000 }
                );
            }
        });
    }

    private updateBalance(memberId: string, savingTypeId: string) {
        if (!memberId || !savingTypeId) {
            this.availableBalance = null;
            return;
        }
        const total = this.allSavings
            .filter(s => s.memberId === memberId && s.savingType === savingTypeId)
            .reduce((sum, s) => sum + (s.savingAmount || 0), 0);
        this.availableBalance = total;
    }

    submit() {
        if (this.form.invalid) return;
        const v = this.form.value;
        const amount = Number(v.amount);

        // Hard check: reject if balance is known and amount exceeds it
        if (this.availableBalance !== null && amount > this.availableBalance) {
            this.snackBar.open(
                `Insufficient balance. Available: ${this.availableBalance.toFixed(2)} ETB`,
                'Close', { duration: 5000 }
            );
            return;
        }

        // Enforce per-withdrawal limit
        if (this.withdrawalLimit && amount > this.withdrawalLimit) {
            this.snackBar.open(
                `Amount exceeds the per-withdrawal limit of ${this.withdrawalLimit.toFixed(2)} ETB`,
                'Close', { duration: 5000 }
            );
            return;
        }

        // Enforce minimum interval between withdrawals
        const rem = this.intervalRemainingDays();
        if (rem !== null && rem > 0) {
            this.snackBar.open(
                `Member can withdraw again in ${rem} day(s)`,
                'Close', { duration: 5000 }
            );
            return;
        }

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
