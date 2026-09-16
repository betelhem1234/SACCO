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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { SettingsService } from '../../services/settings.service';
import { Member, SharePurchase, ShareSubscription, Account, AccountCategory } from '@sacco/shared-models';
import { AppState } from '../../models/state.model';
import { selectAllMembers } from '../../state/members/members.selectors';
import { selectAllAccounts } from '../../state/lookups/lookups.selectors';
import { selectAllSharePurchases } from '../../state/share-purchase/share-purchases.selectors';
import { selectAllShareSubscriptions } from '../../state/share-subscription/share-subscriptions.selectors';
import { addSharePurchase, updateSharePurchase } from '../../state/share-purchase/share-purchases.actions';

@Component({
  selector: 'app-purchase-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatDatepickerModule, MatSelectModule, MatDialogModule, MatIconModule, MatSnackBarModule],
  templateUrl: './purchase-form.component.html',
  styleUrls: ['./purchase-form.component.css']
})
export class PurchaseFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private store = inject(Store<AppState>);
  private settingsService = inject(SettingsService);
  private snackBar = inject(MatSnackBar);

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
  allSubscriptions: ShareSubscription[] = [];

  get calculatedUnits(): string {
    const amount = this.form.get('totalAmount')?.value || 0;
    const fee = this.form.get('serviceFee')?.value || 0;
    const net = amount - fee;
    return net > 0 ? (net / this.shareUnitPrice).toFixed(2) : '0';
  }

  get totalPaid(): number {
    return this.form.get('totalAmount')?.value || 0;
  }

  get settingsBlocked(): boolean {
    return !this.settingsService.shareSettingsConfigured();
  }

  get missingSettingsText(): string {
    return this.settingsService.missingShareSettings().map(k => k.label).join(', ');
  }

  private get selectedMemberId(): string | null {
    return this.form.get('memberId')?.value || null;
  }

  get subscriptionTotalForMember(): number {
    const id = this.selectedMemberId;
    if (!id) return 0;
    return this.allSubscriptions
      .filter(s => s.memberId === id && this.isPosted(s))
      .reduce((sum, s) => sum + (s.totalAmount || 0), 0);
  }

  get purchasedNetForMember(): number {
    const id = this.selectedMemberId;
    const editingId = this.data?.purchase?.id;
    if (!id) return 0;
    return this.allPurchases
      .filter(p => p.memberId === id && this.isPosted(p) && p.id !== editingId)
      .reduce((sum, p) => sum + Math.max((p.totalAmount || 0) - (p.serviceFee || 0), 0), 0);
  }

  get subscriptionRemaining(): number {
    return Math.max(this.subscriptionTotalForMember - this.purchasedNetForMember, 0);
  }

  get newPurchaseNet(): number {
    const amount = this.form.get('totalAmount')?.value || 0;
    const fee = this.form.get('serviceFee')?.value || 0;
    return Math.max(amount - fee, 0);
  }

  get noSubscriptionForMember(): boolean {
    return !!this.selectedMemberId && this.subscriptionTotalForMember <= 0;
  }

  get exceedsSubscription(): boolean {
    return !!this.selectedMemberId && !this.noSubscriptionForMember
      && this.newPurchaseNet > this.subscriptionRemaining + 0.001;
  }

  get authorizedCapital(): number {
    return Number(this.settingsService.settings()['authorized_capital']) || 0;
  }

  get purchasedShareCapital(): number {
    const editingId = this.data?.purchase?.id;
    let total = 0;
    for (const p of this.allPurchases) {
      if (p.id && editingId === p.id) continue;
      if (!this.isPosted(p)) continue;
      const amt = p.totalAmount || 0;
      if (amt > 0) total += Math.max(amt - (p.serviceFee || 0), 0);
    }
    return total;
  }

  get authorizedRemaining(): number {
    return Math.max(this.authorizedCapital - this.purchasedShareCapital, 0);
  }

  get exceedsAuthorized(): boolean {
    if (this.authorizedCapital <= 0) return false;
    const amount = this.form.get('totalAmount')?.value || 0;
    const fee = this.form.get('serviceFee')?.value || 0;
    const newShare = Math.max(amount - fee, 0);
    return this.purchasedShareCapital + newShare > this.authorizedCapital + 0.001;
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
    this.store.select(selectAllShareSubscriptions).subscribe(s => this.allSubscriptions = s ?? []);

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
    return this.allPurchases.some(p => p.memberId === memberId && this.isPosted(p));
  }

  private isPosted(row: { status?: string }): boolean {
    return !row.status || row.status === 'POSTED';
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
    if (this.settingsBlocked) {
      this.snackBar.open(
        `Configure Share Settings first: ${this.missingSettingsText}`,
        'Close', { duration: 6000 });
      return;
    }
    if (this.noSubscriptionForMember) {
      this.snackBar.open(
        'Please add a subscription before adding a purchase for this member.',
        'Close', { duration: 5000 });
      return;
    }
    if (this.exceedsSubscription) {
      this.snackBar.open(
        `This purchase exceeds the member's remaining subscription amount of ${this.subscriptionRemaining.toFixed(2)}.`,
        'Close', { duration: 5000 });
      return;
    }
    if (this.exceedsAuthorized) {
      this.snackBar.open(
        `This purchase would exceed the authorized share capital of ${this.authorizedCapital.toFixed(2)}.`,
        'Close', { duration: 5000 });
      return;
    }
    const val = this.form.getRawValue();
    if (val.units < this.minUnits) {
      this.snackBar.open(
        `Minimum purchase is ${this.minUnits} share unit${this.minUnits > 1 ? 's' : ''}`,
        'Close', { duration: 5000 });
      return;
    }
    if (val.units > this.maxUnits) {
      this.snackBar.open(
        `Maximum purchase is ${this.maxUnits} share units`,
        'Close', { duration: 5000 });
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
