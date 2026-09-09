import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import { SettingsService } from '../../services/settings.service';
import { Member, SharePurchase, Account, AccountCategory } from '@sacco/shared-models';
import { AppState } from '../../models/state.model';
import { selectAllMembers } from '../../state/members/members.selectors';
import { selectAllAccounts } from '../../state/lookups/lookups.selectors';
import { selectAllSharePurchases } from '../../state/share-purchase/share-purchases.selectors';
import { addSharePurchase, updateSharePurchase } from '../../state/share-purchase/share-purchases.actions';

@Component({
  selector: 'app-purchase-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatDatepickerModule, MatSelectModule, MatDialogModule, MatIconModule],
  templateUrl: './purchase-form.component.html',
  styleUrls: ['./purchase-form.component.css']
})
export class PurchaseFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private store = inject(Store<AppState>);
  private settingsService = inject(SettingsService);

  members: Member[] = [];
  banks: Account[] = [];

  form: FormGroup = this.fb.group({
    memberId: ['', Validators.required],
    units: [{ value: 0, disabled: true }],
    totalAmount: [0, Validators.required],
    purchaseDate: [new Date(), Validators.required],
    bankId: [null],
    transactionReference: [''],
    serviceFee: [{ value: 0, disabled: true }],
    remark: [''],
  });

  get shareUnitPrice(): number {
    return Number(this.settingsService.settings()['share_unit_price']) || 100;
  }

  get registrationFee(): number {
    return Number(this.settingsService.settings()['registration_fee']) || 0;
  }

  get minUnits(): number {
    return Number(this.settingsService.settings()['minimum_share_unit']) || 1;
  }

  get maxUnits(): number {
    return Number(this.settingsService.settings()['maximum_share_unit']) || 1000;
  }

  allPurchases: SharePurchase[] = [];

  get calculatedUnits(): string {
    const amount = this.form.get('totalAmount')?.value || 0;
    const fee = this.form.get('serviceFee')?.value || 0;
    const net = amount - fee;
    return net > 0 ? (net / this.shareUnitPrice).toFixed(2) : '0';
  }

  get totalPaid(): number {
    return this.form.get('totalAmount')?.value || 0;
  }

  isEdit = false;

  constructor(
    public dialogRef: MatDialogRef<PurchaseFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { purchase?: SharePurchase; memberId?: string } | null
  ) {}

  ngOnInit() {
    this.store.select(selectAllMembers).subscribe(m => this.members = m ?? []);
    this.store.select(selectAllAccounts).subscribe(a =>
      this.banks = (a ?? []).filter(b => b.accountCategory === AccountCategory.BANK_ACCOUNT && b.isActive !== false)
    );
    this.store.select(selectAllSharePurchases).subscribe(p => this.allPurchases = p ?? []);

    const purchase = this.data?.purchase;
    this.isEdit = !!(purchase?.id);

    if (purchase) {
      this.form.patchValue({
        ...purchase,
        purchaseDate: new Date(purchase.purchaseDate),
      });
    } else if (this.data?.memberId) {
      this.form.patchValue({ memberId: this.data.memberId });
    }

    this.form.get('memberId')?.valueChanges.subscribe((memberId: string) => {
      this.updateFeeForMember(memberId);
    });

    const initialMemberId = this.form.get('memberId')?.value;
    if (initialMemberId) {
      this.updateFeeForMember(initialMemberId);
    } else {
      this.form.patchValue({ serviceFee: this.registrationFee });
    }

    this.updateUnits();
    this.form.get('totalAmount')?.valueChanges.subscribe(() => {
      this.updateUnits();
    });
  }

  private hasExistingPurchases(memberId: string): boolean {
    return this.allPurchases.some(p => p.memberId === memberId);
  }

  private updateFeeForMember(memberId: string) {
    const fee = this.hasExistingPurchases(memberId) ? 0 : this.registrationFee;
    this.form.patchValue({ serviceFee: fee }, { emitEvent: false });
    this.updateUnits();
  }

  private updateUnits() {
    const amount = this.form.get('totalAmount')?.value || 0;
    const fee = this.form.get('serviceFee')?.value || 0;
    const net = amount - fee;
    const units = net > 0 ? net / this.shareUnitPrice : 0;
    this.form.patchValue({ units: Math.round(units * 100) / 100 }, { emitEvent: false });
  }

  onSubmit() {
    if (this.form.invalid) return;
    const val = this.form.getRawValue();
    if (val.units < this.minUnits) {
      return;
    }
    if (val.units > this.maxUnits) {
      return;
    }
    const payload: SharePurchase = {
      ...val,
      serviceFee: this.form.get('serviceFee')?.value || 0,
      purchaseDate: val.purchaseDate instanceof Date ? val.purchaseDate.getTime() : val.purchaseDate,
    };

    if (this.data?.purchase?.id) {
      const p = this.data.purchase;
      this.store.dispatch(updateSharePurchase({ sharePurchase: { ...p, ...payload, id: p.id } }));
    } else {
      this.store.dispatch(addSharePurchase({ sharePurchase: payload }));
    }
    this.dialogRef.close(true);
  }
}
