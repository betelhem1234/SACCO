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
import { addSaving, updateSaving } from '../../state/savings/savings.actions';
import { selectAllMembers } from '../../state/members/members.selectors';
import { selectAllAccounts, selectAllSavingTypes } from '../../state/lookups/lookups.selectors';
import { loadAccounts, loadSavingTypes } from '../../state/lookups/lookups.actions';
import { ApiService } from '../../services/api.service';

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
  templateUrl: './saving-form.component.html',
  styleUrls: ['./saving-form.component.css']
})
export class SavingFormComponent implements OnInit {
  savingForm!: FormGroup;
  members$!: Observable<Member[]>;
  /** Active ledger accounts categorized as bank (member deposits). */
  depositAccounts$!: Observable<Account[]>;
  savingTypes$!: Observable<SavingType[]>;
  editMode = false;
  /** Minimum required amount hint for the selected type/date (null when type has no minimum requirement shown). */
  requiredMin: { amount: number; date: number; typeName: string } | null = null;

  get minRequired(): number {
    return this.requiredMin?.amount ?? 0;
  }

  constructor(
    private store: Store<AppState>,
    private fb: FormBuilder,
    private api: ApiService,
    private dialogRef: MatDialogRef<SavingFormComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: { saving?: Saving; memberId?: string } | undefined
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
      memberId: [saving?.memberId ?? this.data?.memberId ?? '', Validators.required],
      savingType: [saving?.savingType ?? '', Validators.required],
      accountId: [saving?.accountId ?? '', Validators.required],
      savingAmount: [saving?.savingAmount ?? '', [Validators.required, Validators.min(1)]],
      ftp: [saving?.ftp ?? '', Validators.required],
      remark: [saving?.remark ?? ''],
      savingDate: [dateStr, Validators.required],
    });

    this.savingTypes$.subscribe((types) => {
      this.types = types ?? [];
      this.refreshMinimum();
    });
    this.savingForm.get('savingType')?.valueChanges.subscribe(() => this.refreshMinimum(true));
    this.savingForm.get('savingDate')?.valueChanges.subscribe(() => this.refreshMinimum());
  }

  private types: SavingType[] = [];

  /** Resolve the minimum amount the selected type requires on the selected date and surface it in the form. */
  private refreshMinimum(autoFill: boolean = false): void {
    const typeId = this.savingForm.get('savingType')?.value as string | undefined;
    const dateRaw = this.savingForm.get('savingDate')?.value as string | undefined;
    this.requiredMin = null;
    if (!typeId || !dateRaw) return;

    const type = this.types.find((t) => t.id === typeId);
    if (!type) return;

    const date = new Date(dateRaw).getTime();
    const amountCtrl = this.savingForm.get('savingAmount');

    const apply = (amount: number) => {
      if (type!.isMandatory) {
        this.requiredMin = { amount, date, typeName: type!.name };
      }
      const min = Math.max(1, amount ?? 0);
      amountCtrl?.setValidators([Validators.required, Validators.min(min)]);
      amountCtrl?.updateValueAndValidity();
      if (autoFill && (amountCtrl?.value === null || amountCtrl?.value === '')) {
        amountCtrl?.setValue(amount);
      }
    };

    if (type.isMandatory) {
      this.api.getSavingTypeHistory(type.id).subscribe({
        next: (history) => {
          const sorted = [...(history ?? [])].filter((h) => h.effectiveFrom <= date)
            .sort((a, b) => b.effectiveFrom - a.effectiveFrom);
          apply(sorted.length > 0 ? sorted[0].amount : (type.minimumAmount ?? 0));
        },
        error: () => apply(type.minimumAmount ?? 0),
      });
    } else {
      apply(type.minimumAmount ?? 0);
    }
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
