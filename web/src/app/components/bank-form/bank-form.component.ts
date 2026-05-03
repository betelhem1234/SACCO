import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Bank } from '@sacco/shared-models';
import { AppState } from '../../models/state.model';
import { addBank } from '../../state/lookups.actions';

@Component({
    selector: 'app-bank-form',
    standalone: true,
    imports: [
        CommonModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule,
        ReactiveFormsModule
    ],
    template: `
    <div>
      <div class="px-6 py-5 flex items-center gap-3" style="background:linear-gradient(135deg,#1e3a5f,#2d5282)">
        <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background:rgba(255,255,255,0.15)">
          <span class="material-icons text-white" style="font-size:20px">account_balance</span>
        </div>
        <div>
          <h2 class="text-white font-bold text-base m-0">{{ editMode ? 'Edit Bank' : 'Register New Bank' }}</h2>
          <p class="text-xs m-0" style="color:#93c5fd">Fill in bank details below</p>
        </div>
      </div>
      <mat-dialog-content class="px-6 py-5">
        <form [formGroup]="bankForm" class="flex flex-col gap-3">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Bank Name</mat-label>
            <input matInput formControlName="name" required />
            <mat-icon matPrefix class="mr-2" style="color:#94a3b8">account_balance</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Bank Code</mat-label>
            <input matInput formControlName="code" required />
            <mat-icon matPrefix class="mr-2" style="color:#94a3b8">code</mat-icon>
          </mat-form-field>
        </form>
      </mat-dialog-content>
      <mat-dialog-actions align="end" class="px-6 py-4" style="border-top:1px solid #e2e8f0">
        <button mat-button (click)="onCancel()" style="color:#64748b;font-weight:500">Cancel</button>
        <button [disabled]="!bankForm.valid" (click)="submit()"
                class="px-5 py-2 rounded-xl text-sm font-semibold border-0 cursor-pointer ml-2 transition-all"
                style="background:linear-gradient(135deg,#1e3a5f,#2d5282);color:white;box-shadow:0 4px 12px rgba(30,58,95,0.3)">
          Save Bank
        </button>
      </mat-dialog-actions>
    </div>
  `,
    styles: [`mat-dialog-content { min-width: 420px; }`]
})
export class BankFormComponent implements OnInit {
    bankForm!: FormGroup;
    editMode = false;

    constructor(
        private store: Store<AppState>,
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<BankFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { bank?: Bank }
    ) { }

    ngOnInit(): void {
        this.bankForm = this.fb.group({
            id: [''],
            name: ['', Validators.required],
            code: ['', Validators.required],
        });
        if (this.data?.bank) {
            this.editMode = true;
            this.bankForm.patchValue(this.data.bank);
        }
    }

    submit() {
        if (this.bankForm.invalid) return;
        const data = { ...this.bankForm.value };
        if (!data.id) delete data.id;
        // Currently only addBank is implemented in requirements. updateBank can be added later if needed.
        this.store.dispatch(addBank({ bank: data }));
        this.dialogRef.close(true);
    }

    onCancel() { this.dialogRef.close(); }
}
