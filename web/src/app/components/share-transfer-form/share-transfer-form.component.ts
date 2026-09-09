import { Component, Inject, OnInit, Optional, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { ShareTransfer, Member } from '@sacco/shared-models';
import { Store } from '@ngrx/store';
import { AppState } from '../../models/state.model';
import { selectAllMembers } from '../../state/members/members.selectors';
import { loadMembers } from '../../state/members/members.actions';
import { addShareTransfer, updateShareTransfer } from '../../state/share-transfer/share-transfers.actions';

@Component({
  selector: 'app-share-transfer-form',
  standalone: true,
  imports: [
    CommonModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatDialogModule, ReactiveFormsModule
  ],
  templateUrl: './share-transfer-form.component.html',
  styleUrls: ['./share-transfer-form.component.css']
})
export class ShareTransferFormComponent implements OnInit {
  form!: FormGroup;
  editMode = false;
  members: Member[] = [];

  constructor(
    private store: Store<AppState>,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ShareTransferFormComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: { transfer?: ShareTransfer; memberId?: string } | undefined
  ) {}

  ngOnInit(): void {
    this.store.dispatch(loadMembers());
    this.store.select(selectAllMembers).subscribe(m => this.members = m ?? []);

    const t = this.data?.transfer;
    this.editMode = !!(t?.id);

    const dateStr = t?.transferDate
      ? new Date(t.transferDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    this.form = this.fb.group({
      sourceMemberId: [t?.sourceMemberId ?? this.data?.memberId ?? '', Validators.required],
      destinationMemberId: [t?.destinationMemberId ?? '', Validators.required],
      units: [t?.units ?? '', [Validators.required, Validators.min(1)]],
      totalAmount: [t?.totalAmount ?? '', [Validators.required, Validators.min(1)]],
      ftp: [t?.ftp ?? '', Validators.required],
      transferDate: [dateStr, Validators.required],
      remark: [t?.remark ?? ''],
    });
  }

  submit() {
    if (this.form.invalid) return;
    const v = this.form.value;
    const transferDate = new Date(v.transferDate).getTime();

    const shareTransfer: ShareTransfer = {
      ...v,
      units: Number(v.units),
      totalAmount: Number(v.totalAmount),
      transferDate,
      createdAt: Date.now(),
    };

    if (this.editMode && this.data?.transfer?.id) {
      this.store.dispatch(updateShareTransfer({ shareTransfer: { ...this.data.transfer, ...shareTransfer } }));
    } else {
      this.store.dispatch(addShareTransfer({ shareTransfer }));
    }
    this.dialogRef.close(true);
  }

  onCancel() { this.dialogRef.close(); }
}
