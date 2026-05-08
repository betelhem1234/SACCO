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

import { Saving, Member, Account, AccountCategory, SavingType } from '@sacco/shared-models';
import { AppState } from '../../models/state.model';
import { addSaving, updateSaving } from '../../state/savings.actions';
import { selectAllMembers } from '../../state/members.selectors';
import { selectAllAccounts, selectAllSavingTypes } from '../../state/lookups.selectors';
import { loadAccounts, loadSavingTypes } from '../../state/lookups.actions';

@Component({
  selector: 'app-saving-form',
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
      <!-- Dialog Header -->
      <div class="px-6 py-5 flex items-center gap-3"
           style="background:linear-gradient(135deg,#065f46,#059669)">
        <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background:rgba(255,255,255,0.15)">
          <span class="material-icons text-white" style="font-size:20px">savings</span>
        </div>
        <div>
          <h2 class="text-white font-bold text-base m-0">{{ editMode ? 'Edit Saving' : 'Record New Saving' }}</h2>
          <p class="text-xs m-0" style="color:#a7f3d0">{{ editMode ? 'Update transaction details' : 'Enter saving transaction details' }}</p>
        </div>
      </div>

      <!-- Form Body -->
      <mat-dialog-content class="px-6 py-5">
        <form [formGroup]="savingForm" class="flex flex-col gap-3">

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Select Member</mat-label>
            <mat-select formControlName="memberId">
              <mat-option *ngFor="let member of members$ | async" [value]="member.id">
                {{ member.fullName }} ({{ member.idNumbe || 'No ID' }})
              </mat-option>
            </mat-select>
            <mat-icon matPrefix class="mr-2" style="color:#94a3b8">person</mat-icon>
          </mat-form-field>

          <div class="flex gap-3">
            <mat-form-field appearance="outline" class="w-1/2">
              <mat-label>Saving Type</mat-label>
              <mat-select formControlName="savingType">
                <mat-option *ngFor="let st of savingTypes$ | async" [value]="st.id">
                  {{ st.name }}
                </mat-option>
              </mat-select>
              <mat-icon matPrefix class="mr-2" style="color:#94a3b8">category</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-1/2">
              <mat-label>Deposit account</mat-label>
              <mat-select formControlName="accountId">
                <mat-option *ngFor="let acc of depositAccounts$ | async" [value]="acc.id">
                  {{ acc.name }} <span class="text-xs opacity-70">({{ acc.accountNumber || 'no #' }})</span>
                </mat-option>
              </mat-select>
              <mat-icon matPrefix class="mr-2" style="color:#94a3b8">account_balance_wallet</mat-icon>
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Amount (ETB)</mat-label>
            <input matInput type="number" formControlName="savingAmount" required />
            <mat-icon matPrefix class="mr-2" style="color:#94a3b8">monetization_on</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>FTP Reference</mat-label>
            <input matInput formControlName="ftp" required />
            <mat-icon matPrefix class="mr-2" style="color:#94a3b8">receipt</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Remark</mat-label>
            <input matInput formControlName="remark" />
            <mat-icon matPrefix class="mr-2" style="color:#94a3b8">notes</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Date</mat-label>
            <input matInput type="date" formControlName="savingDate" required/>
          </mat-form-field>
        </form>
      </mat-dialog-content>

      <!-- Actions -->
      <mat-dialog-actions align="end" class="px-6 py-4" style="border-top:1px solid #e2e8f0">
        <button mat-button (click)="onCancel()" style="color:#64748b;font-weight:500">Cancel</button>
        <button [disabled]="!savingForm.valid" (click)="submitSaving()"
                class="px-5 py-2 rounded-xl text-sm font-semibold border-0 cursor-pointer ml-2 transition-all"
                style="background:linear-gradient(135deg,#059669,#047857);color:white;box-shadow:0 4px 12px rgba(5,150,105,0.35)">
          {{ editMode ? 'Update Saving' : 'Record Saving' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    mat-dialog-content { min-width: 420px; }
  `]
})
export class SavingFormComponent implements OnInit {
  savingForm!: FormGroup;
  members$!: Observable<Member[]>;
  /** Active ledger accounts categorized as bank (member deposits). */
  depositAccounts$!: Observable<Account[]>;
  savingTypes$!: Observable<SavingType[]>;
  editMode = false;

  constructor(
    private store: Store<AppState>,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<SavingFormComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: { saving?: Saving } | undefined
  ) { }

  ngOnInit(): void {
    this.store.dispatch(loadAccounts({}));
    this.store.dispatch(loadSavingTypes());

    this.members$ = this.store.select(selectAllMembers);
    this.depositAccounts$ = this.store.select(selectAllAccounts).pipe(
      map((accounts) =>
        (accounts ?? []).filter(
          (a) => a.accountCategory === AccountCategory.BANK_ACCOUNT && a.isActive !== false
        )
      )
    );
    this.savingTypes$ = this.store.select(selectAllSavingTypes);

    const saving = this.data?.saving;
    this.editMode = !!(saving?.id);

    const dateStr = saving?.savingDate
      ? new Date(saving.savingDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    this.savingForm = this.fb.group({
      memberId: [saving?.memberId ?? '', Validators.required],
      savingType: [saving?.savingType ?? '', Validators.required],
      accountId: [saving?.accountId ?? '', Validators.required],
      savingAmount: [saving?.savingAmount ?? '', [Validators.required, Validators.min(1)]],
      ftp: [saving?.ftp ?? '', Validators.required],
      remark: [saving?.remark ?? ''],
      savingDate: [dateStr, Validators.required],
    });
  }

  submitSaving() {
    if (this.savingForm.invalid) return;

    const formValue = this.savingForm.value;
    const savingDate = new Date(formValue.savingDate).getTime();

    if (this.editMode && this.data?.saving?.id) {
      const base = this.data.saving;
      const saving: Saving = {
        ...base,
        id: base.id,
        memberId: formValue.memberId,
        savingType: formValue.savingType,
        accountId: formValue.accountId,
        savingAmount: Number(formValue.savingAmount),
        ftp: formValue.ftp,
        remark: formValue.remark || undefined,
        savingDate,
        createdAt: base.createdAt ?? Date.now(),
      };
      this.store.dispatch(updateSaving({ saving }));
    } else {
      const savingData: Saving = {
        ...formValue,
        savingAmount: Number(formValue.savingAmount),
        savingDate,
        createdAt: Date.now()
      };
      this.store.dispatch(addSaving({ saving: savingData }));
    }

    this.dialogRef.close(true);
  }

  onCancel() { this.dialogRef.close(); }
}
