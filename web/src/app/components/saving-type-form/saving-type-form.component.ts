import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Account, AccountType, SavingType } from '@sacco/shared-models';
import { AppState } from '../../models/state.model';
import { addSavingType, updateSavingType } from '../../state/lookups.actions';
import { map, Observable } from 'rxjs';
import { selectAllAccounts } from 'src/app/state/lookups.selectors';
import { MatOption } from "@angular/material/select";
import { MatSelectModule } from '@angular/material/select';
@Component({
    selector: 'app-saving-type-form',
    standalone: true,
    imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatOption,
    MatSelectModule
],
    template: `
    <div>
      <div class="px-6 py-5 flex items-center gap-3" style="background:linear-gradient(135deg,#1e3a5f,#2d5282)">
        <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background:rgba(255,255,255,0.15)">
          <span class="material-icons text-white" style="font-size:20px">savings</span>
        </div>
        <div>
          <h2 class="text-white font-bold text-base m-0">{{ editMode ? 'Edit Saving Type' : 'Register New Saving Type' }}</h2>
          <p class="text-xs m-0" style="color:#93c5fd">Fill in details below</p>
        </div>
      </div>
      <mat-dialog-content class="px-6 py-5">
        <form [formGroup]="form" class="flex flex-col gap-3">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Type Name</mat-label>
            <input matInput formControlName="name" required />
            <mat-icon matPrefix class="mr-2" style="color:#94a3b8">label</mat-icon>
          </mat-form-field>
           <mat-form-field appearance="outline" class="w-full">
              <mat-label>Deposit account</mat-label>
              <mat-select formControlName="accountId">
                <mat-option *ngFor="let acc of depositAccounts$ | async" [value]="acc.id">
                  {{ acc.name }} <span class="text-xs opacity-70">({{ acc.accountNumber || 'no #' }})</span>
                </mat-option>
              </mat-select>
              <mat-icon matPrefix class="mr-2" style="color:#94a3b8">account_balance_wallet</mat-icon>
            </mat-form-field>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Description</mat-label>
            <input matInput formControlName="description" />
            <mat-icon matPrefix class="mr-2" style="color:#94a3b8">description</mat-icon>
          </mat-form-field>
        </form>
      </mat-dialog-content>
      <mat-dialog-actions align="end" class="px-6 py-4" style="border-top:1px solid #e2e8f0">
        <button mat-button (click)="onCancel()" style="color:#64748b;font-weight:500">Cancel</button>
        <button [disabled]="!form.valid" (click)="submit()"
                class="px-5 py-2 rounded-xl text-sm font-semibold border-0 cursor-pointer ml-2 transition-all"
                style="background:linear-gradient(135deg,#1e3a5f,#2d5282);color:white;box-shadow:0 4px 12px rgba(30,58,95,0.3)">
          {{ editMode ? 'Update Type' : 'Save Type' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
    styles: [`mat-dialog-content { min-width: 420px; }`]
})
export class SavingTypeFormComponent implements OnInit {
    form!: FormGroup;
    editMode = false;
    depositAccounts$!: Observable<Account[]>;

    constructor(
        private store: Store<AppState>,
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<SavingTypeFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { savingType?: SavingType }
    ) { }

    ngOnInit(): void {
        this.form = this.fb.group({
            id: [''],
            name: ['', Validators.required],
            accountId: [null],
            description: [''],
        });
        if (this.data?.savingType) {
            this.editMode = true;
            this.form.patchValue(this.data.savingType);
        }
        this.depositAccounts$ = this.store.select(selectAllAccounts).pipe(
              map((accounts) =>
                (accounts ?? []).filter(
                  (a) => a.accountType === AccountType.LIABILITY && a.isActive !== false
                )
              )
            );
    }

    submit() {
        if (this.form.invalid) return;
        const data = { ...this.form.value };
        if (this.editMode && data.id) {
            this.store.dispatch(updateSavingType({ savingType: data as SavingType }));
        } else {
            delete data.id;
            this.store.dispatch(addSavingType({ savingType: data as SavingType }));
        }
        this.dialogRef.close(true);
    }
    

    onCancel() { this.dialogRef.close(); }
}
