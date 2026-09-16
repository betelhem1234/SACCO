import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Store } from '@ngrx/store';

import { ApiService } from '../../services/api.service';
import { AppState } from '../../models/state.model';
import { selectAllAccounts } from '../../state/lookups/lookups.selectors';
import { loadAccounts } from '../../state/lookups/lookups.actions';
import { selectUser } from '../../state/auth/auth.selectors';
import { etb, num, fmtDate, sortIcon, sortRows } from '../../utils/finance-format';

import {
  ExpenseRequest,
  FixedAsset,
  DepreciationEntry,
  AssetDisposal,
  RentalContract,
  RentalPayment,
  Account,
} from '@sacco/shared-models';

import { ExpenseRequestFormComponent } from './expense-request-form/expense-request-form.component';
import { AssetFormComponent } from './asset-form/asset-form.component';
import { DisposalFormComponent } from './disposal-form/disposal-form.component';
import { RentalContractFormComponent } from './rental-contract-form/rental-contract-form.component';
import { RentalPaymentFormComponent } from './rental-payment-form/rental-payment-form.component';

type Tab = 'overview' | 'requests' | 'assets' | 'disposals' | 'rentals';

@Component({
  selector: 'app-assets-expense',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './assets-expense.component.html',
  styleUrls: ['./assets-expense.component.css'],
})
export class AssetsExpenseComponent implements OnInit {
  private api = inject(ApiService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private store = inject(Store<AppState>);

  readonly etb = etb;
  readonly num = num;
  readonly fmtDate = fmtDate;
  readonly sortIcon = sortIcon;

  assetSortAsc = false;

  toggleAssetSort(): void {
    this.assetSortAsc = !this.assetSortAsc;
  }

  sortedAssets(): FixedAsset[] {
    return sortRows(this.assets, 'purchaseDate', this.assetSortAsc);
  }

  activeTab: Tab = 'overview';
  loading = false;

  requests: ExpenseRequest[] = [];
  assets: FixedAsset[] = [];
  disposals: AssetDisposal[] = [];
  depreciation: DepreciationEntry[] = [];
  contracts: RentalContract[] = [];
  payments: RentalPayment[] = [];
  accounts: Account[] = [];
  userName = 'admin';

  readonly requestTabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: 'dashboard' },
    { id: 'requests', label: 'Purchase Requests', icon: 'request_quote' },
    { id: 'assets', label: 'Assets', icon: 'inventory_2' },
    { id: 'disposals', label: 'Disposals', icon: 'delete_sweep' },
    { id: 'rentals', label: 'Rentals', icon: 'apartment' },
  ];

  readonly statusStyles: Record<string, string> = {
    PENDING: 'background:#fef3c7;color:#92400e',
    APPROVED: 'background:#dbeafe;color:#1e40af',
    PAID: 'background:#d1fae5;color:#065f46',
    REJECTED: 'background:#fee2e2;color:#991b1b',
  };

  readonly conditionStyles: Record<string, string> = {
    SALE: 'background:#d1fae5;color:#065f46',
    LOST: 'background:#fee2e2;color:#991b1b',
    GIFT: 'background:#fce7f3;color:#9d174d',
    SCRAP: 'background:#f3f4f6;color:#374151',
    DAMAGED: 'background:#ffedd5;color:#9a3412',
    OTHER: 'background:#e0e7ff;color:#3730a3',
  };

  ngOnInit(): void {
    this.store.dispatch(loadAccounts({}));
    this.store.select(selectAllAccounts).subscribe((a) => (this.accounts = a ?? []));
    this.store.select(selectUser).subscribe((u) => {
      if (u?.username) this.userName = u.username;
    });
    this.loadAll();
  }

  setTab(tab: Tab): void {
    this.activeTab = tab;
  }

  async loadAll(): Promise<void> {
    this.loading = true;
    try {
      const [requests, assets, disposals, depreciation, contracts, payments] = await Promise.all([
        this.toPromise(this.api.getExpenseRequests()),
        this.toPromise(this.api.getFixedAssets()),
        this.toPromise(this.api.getAssetDisposals()),
        this.toPromise(this.api.getDepreciationEntries()),
        this.toPromise(this.api.getRentalContracts()),
        this.toPromise(this.api.getRentalPayments()),
      ] as const);
      this.requests = requests ?? [];
      this.assets = assets ?? [];
      this.disposals = disposals ?? [];
      this.depreciation = depreciation ?? [];
      this.contracts = contracts ?? [];
      this.payments = payments ?? [];
    } catch {
      this.snackBar.open('Failed to load assets & expenses data', 'Close', { duration: 4000 });
    } finally {
      this.loading = false;
    }
  }

  private toPromise<T>(obs: Observable<T>): Promise<T> {
    return new Promise<T>((resolve, reject) =>
      obs.subscribe({ next: (v: T) => resolve(v), error: (e: any) => reject(e) })
    );
  }

  refresh(): void {
    this.loadAll();
  }

  accountName(id?: string): string {
    if (!id) return '—';
    return this.accounts.find((a) => a.id === id)?.name ?? '—';
  }

  bankCashAccounts(): Account[] {
    return this.accounts.filter(
      (a) =>
        a.isActive !== false &&
        !a.isParent &&
        (a.accountCategory === 1 || a.accountCategory === 2)
    );
  }

  defaultPaymentAccount(id?: string): string | undefined {
    if (id) return id;
    return this.bankCashAccounts()[0]?.id;
  }

  // ─── KPIs ───────────────────────────────────────────────────────────────

  totalAssetCost(): number {
    return this.assets.reduce((s, a) => s + (a.status === 'DISPOSED' ? 0 : a.cost || 0), 0);
  }

  accumulatedDepreciation(): number {
    const byAsset = new Map<string, DepreciationEntry[]>();
    for (const d of this.depreciation) {
      if (!byAsset.has(d.assetId)) byAsset.set(d.assetId, []);
      byAsset.get(d.assetId)!.push(d);
    }
    let total = 0;
    for (const [assetId, entries] of byAsset) {
      if (this.assets.find((a) => a.id === assetId)?.status === 'DISPOSED') continue;
      const latest = [...entries].sort((a, b) => (a.periodKey < b.periodKey ? -1 : 1)).at(-1);
      if (latest) total += latest.accumulated || 0;
    }
    return total;
  }

  netBookValue(): number {
    return this.totalAssetCost() - this.accumulatedDepreciation();
  }

  pendingCount(status: string): number {
    return this.requests.filter((r) => r.status === status).length;
  }

  prepaidExposure(): number {
    return this.payments.reduce((s, p) => {
      const from = p.paidFrom;
      const to = p.paidTo;
      const expensed = p.expensedThrough ?? Math.min(Math.max(Date.now(), from), to);
      const days = Math.max(1, Math.round((to - from) / 86_400_000));
      const remainingDays = Math.max(0, Math.round((to - expensed) / 86_400_000));
      return s + (p.amountPaid || 0) * (remainingDays / days);
    }, 0);
  }

  requestByCategory(cat: string): number {
    return this.requests.filter((r) => r.category === cat).length;
  }

  // ─── Requests ───────────────────────────────────────────────────────────

  canEditRequest(r: ExpenseRequest): boolean {
    return r.status === 'PENDING' || r.status === 'REJECTED';
  }

  openRequestDialog(request?: ExpenseRequest): void {
    const ref = this.dialog.open(ExpenseRequestFormComponent, {
      width: '760px',
      data: { request, contracts: this.contracts },
    });
    ref.afterClosed().subscribe((data) => {
      if (!data) return;
      const req: ExpenseRequest = data;
      req.requestedBy = req.requestedBy || this.userName;
      if (request?.id) {
        this.api.updateExpenseRequest(request.id, req).subscribe({
          next: () => { this.snackBar.open('Request updated', 'Close', { duration: 3000 }); this.loadAll(); },
          error: (e) => this.snackBar.open(e?.error?.message || 'Update failed', 'Close', { duration: 4000 }),
        });
      } else {
        this.api.createExpenseRequest(req).subscribe({
          next: () => { this.snackBar.open('Request submitted', 'Close', { duration: 3000 }); this.loadAll(); },
          error: (e) => this.snackBar.open(e?.error?.message || 'Submit failed', 'Close', { duration: 4000 }),
        });
      }
    });
  }

  approveRequest(r: ExpenseRequest): void {
    if (!r.id) return;
    this.api.approveExpenseRequest(r.id, this.userName).subscribe({
      next: () => { this.snackBar.open('Request approved', 'Close', { duration: 3000 }); this.loadAll(); },
      error: (e) => this.snackBar.open(e?.error?.message || 'Approval failed', 'Close', { duration: 4000 }),
    });
  }

  rejectRequest(r: ExpenseRequest): void {
    if (!r.id || !confirm('Reject this request?')) return;
    this.api.rejectExpenseRequest(r.id).subscribe({
      next: () => { this.snackBar.open('Request rejected', 'Close', { duration: 3000 }); this.loadAll(); },
      error: (e) => this.snackBar.open(e?.error?.message || 'Reject failed', 'Close', { duration: 4000 }),
    });
  }

  payRequest(r: ExpenseRequest): void {
    if (!r.id) return;
    if (!confirm(`Pay this request (${etb(r.amount ?? r.amountPerPeriod ?? 0)})?`)) return;
    this.api.payExpenseRequest(r.id, this.defaultPaymentAccount(r.paymentAccountId), Date.now()).subscribe({
      next: () => { this.snackBar.open('Request paid — journals posted', 'Close', { duration: 3000 }); this.loadAll(); },
      error: (e) => this.snackBar.open(e?.error?.message || 'Pay failed', 'Close', { duration: 4000 }),
    });
  }

  deleteRequest(r: ExpenseRequest): void {
    if (!r.id || !confirm('Delete this request?')) return;
    this.api.deleteExpenseRequest(r.id).subscribe({
      next: () => { this.snackBar.open('Request deleted', 'Close', { duration: 3000 }); this.loadAll(); },
      error: (e) => this.snackBar.open(e?.error?.message || 'Delete failed', 'Close', { duration: 4000 }),
    });
  }

  // ─── Assets ─────────────────────────────────────────────────────────────

  isDisposed(a: FixedAsset): boolean {
    return a.status === 'DISPOSED';
  }

  activeAssets(): FixedAsset[] {
    return this.assets.filter((a) => !this.isDisposed(a));
  }

  assetDepreciation(assetId: string): DepreciationEntry[] {
    return this.depreciation.filter((d) => d.assetId === assetId);
  }

  assetAccumulated(assetId: string): number {
    const entries = this.assetDepreciation(assetId);
    return entries.sort((a, b) => (a.periodKey < b.periodKey ? -1 : 1)).at(-1)?.accumulated || 0;
  }

  openAssetDialog(asset?: FixedAsset): void {
    const ref = this.dialog.open(AssetFormComponent, {
      width: '640px',
      data: { asset },
    });
    ref.afterClosed().subscribe((data) => {
      if (!data) return;
      if (asset?.id) {
        this.api.updateFixedAsset(asset.id, data).subscribe({
          next: () => { this.snackBar.open('Asset updated', 'Close', { duration: 3000 }); this.loadAll(); },
          error: (e) => this.snackBar.open(e?.error?.message || 'Update failed', 'Close', { duration: 4000 }),
        });
      } else {
        this.api.addFixedAsset(data).subscribe({
          next: () => { this.snackBar.open('Asset registered', 'Close', { duration: 3000 }); this.loadAll(); },
          error: (e) => this.snackBar.open(e?.error?.message || 'Save failed', 'Close', { duration: 4000 }),
        });
      }
    });
  }

  deleteAsset(a: FixedAsset): void {
    if (!a.id || !confirm(`Delete asset "${a.name}"?`)) return;
    this.api.deleteFixedAsset(a.id).subscribe({
      next: () => { this.snackBar.open('Asset deleted', 'Close', { duration: 3000 }); this.loadAll(); },
      error: (e) => this.snackBar.open(e?.error?.message || 'Delete failed', 'Close', { duration: 4000 }),
    });
  }

  runDepreciation(a: FixedAsset): void {
    if (!a.id) return;
    this.api.runAssetDepreciation(a.id).subscribe({
      next: () => { this.snackBar.open('Depreciation posted', 'Close', { duration: 3000 }); this.loadAll(); },
      error: (e) => this.snackBar.open(e?.error?.message || 'Depreciation failed', 'Close', { duration: 4000 }),
    });
  }

  runAllDepreciation(): void {
    if (!confirm('Run depreciation for all active assets to today?')) return;
    this.api.runAllDepreciation().subscribe({
      next: () => { this.snackBar.open('Depreciation updated for all assets', 'Close', { duration: 3000 }); this.loadAll(); },
      error: (e) => this.snackBar.open(e?.error?.message || 'Depreciation failed', 'Close', { duration: 4000 }),
    });
  }

  disposeAsset(a: FixedAsset): void {
    const ref = this.dialog.open(DisposalFormComponent, {
      width: '560px',
      data: { asset: a },
    });
    ref.afterClosed().subscribe((data) => {
      if (!data || !a.id) return;
      this.api.disposeAsset(a.id, data).subscribe({
        next: () => { this.snackBar.open('Asset disposed — journals posted', 'Close', { duration: 3000 }); this.loadAll(); },
        error: (e) => this.snackBar.open(e?.error?.message || 'Disposal failed', 'Close', { duration: 4000 }),
      });
    });
  }

  // ─── Rentals ────────────────────────────────────────────────────────────

  openContractDialog(contract?: RentalContract): void {
    const ref = this.dialog.open(RentalContractFormComponent, {
      width: '640px',
      data: { contract },
    });
    ref.afterClosed().subscribe((data) => {
      if (!data) return;
      if (contract?.id) {
        this.api.updateRentalContract(contract.id, data).subscribe({
          next: () => { this.snackBar.open('Contract updated', 'Close', { duration: 3000 }); this.loadAll(); },
          error: (e) => this.snackBar.open(e?.error?.message || 'Update failed', 'Close', { duration: 4000 }),
        });
      } else {
        this.api.addRentalContract(data).subscribe({
          next: () => { this.snackBar.open('Contract saved', 'Close', { duration: 3000 }); this.loadAll(); },
          error: (e) => this.snackBar.open(e?.error?.message || 'Save failed', 'Close', { duration: 4000 }),
        });
      }
    });
  }

  deleteContract(c: RentalContract): void {
    if (!c.id || !confirm(`Delete contract "${c.propertyName}"?`)) return;
    this.api.deleteRentalContract(c.id).subscribe({
      next: () => { this.snackBar.open('Contract deleted', 'Close', { duration: 3000 }); this.loadAll(); },
      error: (e) => this.snackBar.open(e?.error?.message || 'Delete failed', 'Close', { duration: 4000 }),
    });
  }

  amortizeContract(c: RentalContract): void {
    if (!c.id) return;
    this.api.amortizeRentalContract(c.id).subscribe({
      next: () => { this.snackBar.open('Prepaid rent amortized', 'Close', { duration: 3000 }); this.loadAll(); },
      error: (e) => this.snackBar.open(e?.error?.message || 'Amortize failed', 'Close', { duration: 4000 }),
    });
  }

  contractName(id?: string): string {
    if (!id) return '—';
    return this.contracts.find((c) => c.id === id)?.propertyName ?? '—';
  }

  openPaymentDialog(payment?: RentalPayment): void {
    const ref = this.dialog.open(RentalPaymentFormComponent, {
      width: '640px',
      data: { payment, contracts: this.contracts },
    });
    ref.afterClosed().subscribe((data) => {
      if (!data) return;
      data.paidBy = data.paidBy || this.userName;
      this.api.addRentalPayment(data).subscribe({
        next: () => { this.snackBar.open('Payment recorded — journals posted', 'Close', { duration: 3000 }); this.loadAll(); },
        error: (e) => this.snackBar.open(e?.error?.message || 'Payment failed', 'Close', { duration: 4000 }),
      });
    });
  }

  deletePayment(p: RentalPayment): void {
    if (!p.id || !confirm('Delete this payment?')) return;
    this.api.deleteRentalPayment(p.id).subscribe({
      next: () => { this.snackBar.open('Payment deleted', 'Close', { duration: 3000 }); this.loadAll(); },
      error: (e) => this.snackBar.open(e?.error?.message || 'Delete failed', 'Close', { duration: 4000 }),
    });
  }

  paymentsFor(contractId: string): RentalPayment[] {
    return this.payments.filter((p) => p.contractId === contractId);
  }

  expensedPortion(p: RentalPayment): number {
    const from = p.paidFrom;
    const to = p.paidTo;
    const expensed = p.expensedThrough ?? Math.min(Math.max(Date.now(), from), to);
    const days = Math.max(1, Math.round((to - from) / 86_400_000));
    const expDays = Math.max(0, Math.round((expensed - from) / 86_400_000));
    return (p.amountPaid || 0) * (expDays / days);
  }
}