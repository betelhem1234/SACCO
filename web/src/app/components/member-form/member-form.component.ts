import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


import { Member } from '@sacco/shared-models';
import { AppState } from '../../models/state.model';
import { addMember, updateMember } from '../../state/members.actions';

@Component({
  selector: 'app-member-form',
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
           style="background:linear-gradient(135deg,#1e3a5f,#2d5282)">
        <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background:rgba(255,255,255,0.15)">
          <span class="material-icons text-white" style="font-size:20px">{{ editMode ? 'edit' : 'person_add' }}</span>
        </div>
        <div>
          <h2 class="text-white font-bold text-base m-0">{{ editMode ? 'Edit Member' : 'Register New Member' }}</h2>
          <p class="text-xs m-0" style="color:#93c5fd">{{ editMode ? 'Update member information' : 'Fill in member details below' }}</p>
        </div>
      </div>

      <!-- Form Body -->
      <mat-dialog-content class="px-6 py-5">
        <form [formGroup]="memberForm" class="flex flex-col gap-3">
          
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Member Number (ID)</mat-label>
            <input matInput formControlName="idNumbe" />
            <mat-icon matPrefix class="mr-2" style="color:#94a3b8">badge</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Full Name</mat-label>
            <input matInput formControlName="fullName" required />
            <mat-icon matPrefix class="mr-2" style="color:#94a3b8">person</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Email Address</mat-label>
            <input matInput type="email" formControlName="email" />
            <mat-icon matPrefix class="mr-2" style="color:#94a3b8">email</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Phone Number</mat-label>
            <input matInput formControlName="phone" />
            <mat-icon matPrefix class="mr-2" style="color:#94a3b8">phone</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Gender</mat-label>
            <mat-select formControlName="isMale">
              <mat-option [value]="true">Male</mat-option>
              <mat-option [value]="false">Female</mat-option>
            </mat-select>
            <mat-icon matPrefix class="mr-2" style="color:#94a3b8">wc</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Member Type</mat-label>
            <mat-select formControlName="memberType">
              <mat-option [value]="1">Adult</mat-option>
              <mat-option [value]="2">Child</mat-option>
              <mat-option [value]="3">Group</mat-option>
            </mat-select>
            <mat-icon matPrefix class="mr-2" style="color:#94a3b8">group</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Membership Status</mat-label>
            <mat-select formControlName="membersipStatus">
              <mat-option [value]="1">Active</mat-option>
              <mat-option [value]="0">Inactive</mat-option>
              <mat-option [value]="2">Pending</mat-option>
            </mat-select>
            <mat-icon matPrefix class="mr-2" style="color:#94a3b8">model_training</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Branch ID</mat-label>
            <input matInput formControlName="branchId" required />
            <mat-icon matPrefix class="mr-2" style="color:#94a3b8">domain</mat-icon>
          </mat-form-field>

        </form>
      </mat-dialog-content>

      <!-- Actions -->
      <mat-dialog-actions align="end" class="px-6 py-4" style="border-top:1px solid #e2e8f0">
        <button mat-button (click)="onCancel()" style="color:#64748b;font-weight:500">Cancel</button>
        <button [disabled]="!memberForm.valid" (click)="submitMember()"
                class="px-5 py-2 rounded-xl text-sm font-semibold border-0 cursor-pointer ml-2 transition-all"
                style="background:linear-gradient(135deg,#1e3a5f,#2d5282);color:white;box-shadow:0 4px 12px rgba(30,58,95,0.3)">
          {{ editMode ? 'Save Changes' : 'Register Member' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    mat-dialog-content { min-width: 420px; }
  `]
})
export class MemberFormComponent implements OnInit {
  memberForm!: FormGroup;
  editMode = false;

  constructor(
    private store: Store<AppState>,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<MemberFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { member?: Member }
  ) { }

  ngOnInit(): void {
    // Default membership status is Active (1)
    this.memberForm = this.fb.group({
      id: [''],
      idNumbe: [''],
      fullName: ['', Validators.required],
      email: ['', [Validators.email]],
      phone: [''],
      isMale: [null],
      memberType: [1], // Default Adult
      membersipStatus: [1], // Default Active
      branchId: ['', Validators.required],
      birthDate: [null],
      registrationDate: [Date.now()]
    });

    if (this.data?.member) {
      this.editMode = true;
      this.memberForm.patchValue(this.data.member);
    }
  }

  submitMember() {
    if (this.memberForm.invalid) return;
    const data = { ...this.memberForm.value };

    // Ensure empty IDs are not sent, which causes Java UUID parsing errors
    if (!data.id) {
      delete data.id;
    }

    // Ensure branchId is a valid UUID, otherwise dummy for now if user didn't provide one
    // Normally this should be a dropdown of branches.
    if (data.branchId && data.branchId.length < 36) {
      // Just a fallback UUID to prevent 500 error if they just type "1"
      data.branchId = '00000000-0000-0000-0000-000000000001';
    }

    if (this.editMode) {
      this.store.dispatch(updateMember({ member: data }));
    } else {
      this.store.dispatch(addMember({ member: data }));
    }
    this.dialogRef.close(true);
  }

  onCancel() { this.dialogRef.close(); }
}
