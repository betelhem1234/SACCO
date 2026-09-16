import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

export interface WithdrawalDisburseDialogData {
  memberName: string;
  amount: number;
}

@Component({
  selector: 'app-withdrawal-disburse-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatDialogModule, MatIconModule, MatInputModule],
  templateUrl: './withdrawal-disburse-dialog.component.html',
  styleUrls: ['./withdrawal-disburse-dialog.component.css']
})
export class WithdrawalDisburseDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<WithdrawalDisburseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: WithdrawalDisburseDialogData
  ) {
    this.form = this.fb.group({
      referenceNo: [''],
    });
  }

  onDisburse() {
    this.dialogRef.close({ referenceNo: this.form.value.referenceNo || undefined });
  }

  onCancel() {
    this.dialogRef.close(null);
  }
}