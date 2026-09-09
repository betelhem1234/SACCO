import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { combineLatest } from 'rxjs';

import { ApiService } from '../../services/api.service';
import {
  Member, Saving, Withdrawal, Transfer, ShareTransfer, ShareSubscription, SharePurchase,
  Account, SavingType
} from '@sacco/shared-models';
import { Store } from '@ngrx/store';
import { selectAllRegions, selectAllSubcities, selectAllEducations, selectAllAccounts, selectAllSavingTypes } from '../../state/lookups/lookups.selectors';
import { loadRegions, loadSubcities, loadEducations, loadAccounts, loadSavingTypes, LookupItem } from '../../state/lookups/lookups.actions';
import { AppState } from '../../models/state.model';
import { SavingFormComponent } from '../saving-form/saving-form.component';
import { WithdrawalFormComponent } from '../withdrawal-form/withdrawal-form.component';
import { TransferFormComponent } from '../transfer-form/transfer-form.component';
import { ShareTransferFormComponent } from '../share-transfer-form/share-transfer-form.component';
import { SubscriptionFormComponent } from '../share-subscription-form/subscription-form.component';
import { PurchaseFormComponent } from '../share-purchase-form/purchase-form.component';
import { loadSavings, deleteSaving } from '../../state/savings/savings.actions';
import { selectAllSavings } from '../../state/savings/savings.selectors';
import { loadWithdrawals, deleteWithdrawal } from '../../state/withdrawals/withdrawals.actions';
import { selectAllWithdrawals } from '../../state/withdrawals/withdrawals.selectors';
import { loadTransfers, deleteTransfer } from '../../state/saving-transfer/transfers.actions';
import { selectAllTransfers } from '../../state/saving-transfer/transfers.selectors';
import { loadShareTransfers, deleteShareTransfer } from '../../state/share-transfer/share-transfers.actions';
import { selectAllShareTransfers } from '../../state/share-transfer/share-transfers.selectors';
import { loadShareSubscriptions, deleteShareSubscription } from '../../state/share-subscription/share-subscriptions.actions';
import { selectAllShareSubscriptions } from '../../state/share-subscription/share-subscriptions.selectors';
import { loadSharePurchases, deleteSharePurchase } from '../../state/share-purchase/share-purchases.actions';
import { selectAllSharePurchases } from '../../state/share-purchase/share-purchases.selectors';
import { loadMembers } from '../../state/members/members.actions';
import { selectAllMembers } from '../../state/members/members.selectors';

type TabKey = 'saving' | 'withdrawal' | 'transfer' | 'shareTransfer' | 'shareSubscription' | 'sharePurchase' | 'mandatoryTracker';

@Component({
  selector: 'app-member-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule, MatDividerModule, MatChipsModule, MatTableModule, MatProgressSpinnerModule, MatDialogModule, MatTooltipModule],
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css']
})
export class MemberDetailComponent implements OnInit {
  member: Member | null = null;
  loading = true;
  error = '';
  status = 0;
  regions: LookupItem[] = [];
  subcities: LookupItem[] = [];
  educations: LookupItem[] = [];
  currentYear = new Date().getFullYear();

  beneficiaryColumns = ['name', 'isMale', 'relationType', 'telephone', 'region', 'subcity'];
  referralColumns = ['name', 'isMale', 'telephone', 'region', 'subcity'];

  tabs: { key: TabKey; label: string; icon: string; color: string }[] = [
    { key: 'saving', label: 'Saving', icon: 'savings', color: '#059669' },
    { key: 'withdrawal', label: 'Withdrawal', icon: 'payments', color: '#7c3aed' },
    { key: 'transfer', label: 'Transfer', icon: 'swap_horiz', color: '#2563eb' },
    { key: 'shareTransfer', label: 'Share Transfer', icon: 'precision_manufacturing', color: '#db2777' },
    { key: 'shareSubscription', label: 'Share Subscription', icon: 'assignment', color: '#ea580c' },
    { key: 'sharePurchase', label: 'Share Purchase', icon: 'shopping_cart', color: '#0f766e' },
    { key: 'mandatoryTracker', label: 'Mandatory Tracker', icon: 'calendar_month', color: '#2563eb' },
  ];

  activeTab: TabKey | null = 'saving';
  activeRows: any[] = [];

  totalSavings = 0;
  totalWithdrawals = 0;
  totalShares = 0;
  totalSubscriptions = 0;

  savingColumns = ['date', 'savingType', 'account', 'amount', 'ftp', 'actions'];
  withdrawalColumns = ['date', 'savingType', 'amount', 'ftp', 'bankName', 'actions'];
  transferColumns = ['date', 'source', 'sourceType', 'dest', 'destType', 'amount', 'actions'];
  shareTransferColumns = ['transferDate', 'source', 'dest', 'units', 'amount', 'ftp', 'actions'];
  shareSubscriptionColumns = ['subscriptionDate', 'units', 'amount', 'actions'];
  sharePurchaseColumns = ['purchaseDate', 'units', 'amount', 'fee', 'ref', 'actions'];

  /** Per-month tracker rows for the mandatory saving type. */
  trackerData: { label: string; requiredAmount: number; paidAmount: number; remaining: number; status: string }[] = [];
  trackerLoading = false;

  private allSavings: Saving[] = [];
  private allWithdrawals: Withdrawal[] = [];
  private allTransfers: Transfer[] = [];
  private allShareTransfers: ShareTransfer[] = [];
  private allShareSubscriptions: ShareSubscription[] = [];
  private allSharePurchases: SharePurchase[] = [];
  private allMembers: Member[] = [];
  private savingTypes: SavingType[] = [];
  private accounts: Account[] = [];

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private store: Store<AppState>,
    private dialog: MatDialog
  ) {
    console.log('CTOR_CALLED');
  }

  ngOnInit(): void {
    console.log('MEMBER_DETAIL_NGONINIT');
    (window as any).__ngOnInitCalled = true;
    this.store.dispatch(loadRegions());
    this.store.dispatch(loadSubcities());
    this.store.dispatch(loadEducations());
    this.store.select(selectAllRegions).subscribe(r => this.regions = r);
    this.store.select(selectAllSubcities).subscribe(s => this.subcities = s);
    this.store.select(selectAllEducations).subscribe(e => this.educations = e);

    this.store.dispatch(loadSavings());
    this.store.dispatch(loadWithdrawals());
    this.store.dispatch(loadTransfers());
    this.store.dispatch(loadShareTransfers());
    this.store.dispatch(loadShareSubscriptions());
    this.store.dispatch(loadSharePurchases());
    this.store.dispatch(loadAccounts({}));
    this.store.dispatch(loadSavingTypes());
    this.store.dispatch(loadMembers());

    combineLatest([
      this.store.select(selectAllSavings),
      this.store.select(selectAllWithdrawals),
      this.store.select(selectAllTransfers),
      this.store.select(selectAllShareTransfers),
      this.store.select(selectAllShareSubscriptions),
      this.store.select(selectAllSharePurchases),
      this.store.select(selectAllMembers),
      this.store.select(selectAllSavingTypes),
      this.store.select(selectAllAccounts),
    ]).subscribe(([savings, withdrawals, transfers, shareTransfers, shareSubs, sharePurchases, members, types, accounts]) => {
      this.allSavings = savings ?? [];
      this.allWithdrawals = withdrawals ?? [];
      this.allTransfers = transfers ?? [];
      this.allShareTransfers = shareTransfers ?? [];
      this.allShareSubscriptions = shareSubs ?? [];
      this.allSharePurchases = sharePurchases ?? [];
      this.allMembers = members ?? [];
      this.savingTypes = types ?? [];
      this.accounts = accounts ?? [];
      this.computeTotals();
      this.buildActiveRows();
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'No member ID provided';
      this.loading = false;
      return;
    }
    this.apiService.getMember(id).subscribe({
      next: (m: Member) => {
        this.member = m;
        this.status = m.status ?? m.membersipStatus ?? 0;
        this.loading = false;
        this.computeTotals();
        this.buildActiveRows();
        this.loadTracker();
        if ((m.memberType ?? m.member_type) === 2) {
          this.apiService.getMemberGroups(id).subscribe({
            next: (groups) => {
              if (this.member) this.member.memberGroups = groups;
            },
            error: (err) => {
              console.error('Failed to load group members:', err);
              if (this.member) this.member.memberGroups = [];
            }
          });
        }
      },
      error: (err) => {
        this.error = err.message || 'Unknown error';
        this.loading = false;
      }
    });
  }

  fullName(): string {
    return this.member?.fullName || '';
  }

  memberTypeLabel(): string {
    const t = this.member?.memberType;
    return t === 0 ? 'Child' : t === 2 ? 'Company' : 'Adult';
  }

  memberTypeColor(): string {
    const t = this.member?.memberType;
    return t === 0 ? '#f59e0b' : t === 2 ? '#8b5cf6' : '#059669';
  }

  maritalStatusLabel(): string {
    const s = this.member?.marital_status;
    const labels: Record<number, string> = { 0: 'Single', 1: 'Married', 2: 'Divorced', 3: 'Widowed' };
    return s != null ? (labels[s] || String(s)) : '-';
  }

  membershipTypeLabel(): string {
    const t = this.member?.membership_type;
    return t === 0 ? 'Regular' : t === 1 ? 'Associate' : '-';
  }

  relationLabel(t?: number): string {
    const labels: Record<number, string> = { 1: 'Spouse', 2: 'Child', 3: 'Parent', 4: 'Sibling', 5: 'Other' };
    return t != null ? (labels[t] || String(t)) : '-';
  }

  parentFullName(): string {
    const m = this.member;
    if (!m) return '-';
    if (m.is_member && m.parent_id) return 'Member ID: ' + m.parent_id.slice(0, 8);
    return m.immediate_contact_full_name || '-';
  }

  hasParentInfo(): boolean {
    const m = this.member;
    if (!m) return false;
    return !!(m.is_member && m.parent_id) || !!(m.immediate_contact_full_name || m.telephone);
  }

  hasImmediateContact(): boolean {
    const m = this.member;
    if (!m) return false;
    return !!(m.immediate_contact_full_name || m.immediate_contact_phone);
  }

  calculateAge(): number {
    if (!this.member?.birthDate) return 0;
    const year = new Date(this.member.birthDate).getFullYear();
    return this.currentYear - year;
  }

  formatDate(ts: number | undefined | null): string {
    if (!ts) return '-';
    const d = new Date(ts);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  lookupName(list: LookupItem[], id: string | undefined | null): string {
    if (!id) return '-';
    const found = list.find(item => item.id === id);
    return found?.name || id.slice(0, 8) + '...';
  }

  selectTab(key: TabKey) {
    this.activeTab = this.activeTab === key ? null : key;
    this.buildActiveRows();
    if (this.activeTab === 'mandatoryTracker') this.loadTracker();
  }

  private activeTabDef(): { label: string; icon: string; color: string } | undefined {
    return this.tabs.find(t => t.key === this.activeTab);
  }

  activeTabLabel(): string { return this.activeTabDef()?.label ?? ''; }
  activeTabIcon(): string { return this.activeTabDef()?.icon ?? ''; }
  activeTabColor(): string { return this.activeTabDef()?.color ?? '#1e293b'; }

  private buildActiveRows() {
    this.activeRows = [];
    const id = this.member?.id;
    if (!id || !this.activeTab) return;

    switch (this.activeTab) {
      case 'saving':
        this.activeRows = this.allSavings
          .filter(s => s.memberId === id)
          .map(s => ({
            id: s.id,
            savingAmount: s.savingAmount,
            savingDate: s.savingDate,
            ftp: s.ftp,
            savingTypeName: this.savingTypes.find(t => t.id === s.savingType)?.name ?? 'Unknown',
            accountDisplayName: this.accountDisplayName(s.accountId),
            remark: s.remark,
          }));
        break;
      case 'withdrawal':
        this.activeRows = this.allWithdrawals
          .filter(w => w.memberId === id)
          .map(w => ({
            id: w.id,
            amount: w.amount,
            date: w.date,
            ftp: w.ftp,
            savingTypeName: this.savingTypes.find(t => t.id === w.savingTypeId)?.name ?? 'Unknown',
            bankName: this.accounts.find(a => a.id === w.bankId)?.name ?? 'Unknown',
            remark: w.remark,
          }));
        break;
      case 'transfer':
        this.activeRows = this.allTransfers
          .filter(t => t.sourceMemberId === id || t.destinationMemberId === id)
          .map(t => ({
            id: t.id,
            amount: t.amount,
            date: t.date,
            ftp: t.ftp,
            sourceMemberName: this.memberName(t.sourceMemberId),
            sourceSavingTypeName: this.savingTypes.find(s => s.id === t.sourceSavingTypeId)?.name ?? 'Unknown',
            destMemberName: this.memberName(t.destinationMemberId),
            destSavingTypeName: this.savingTypes.find(s => s.id === t.destinationSavingTypeId)?.name ?? 'Unknown',
            remark: t.remark,
          }));
        break;
      case 'shareTransfer':
        this.activeRows = this.allShareTransfers
          .filter(t => t.sourceMemberId === id || t.destinationMemberId === id)
          .map(t => ({
            id: t.id,
            units: t.units,
            totalAmount: t.totalAmount,
            transferDate: t.transferDate,
            ftp: t.ftp,
            sourceMemberName: this.memberName(t.sourceMemberId),
            destMemberName: this.memberName(t.destinationMemberId),
            remark: t.remark,
          }));
        break;
      case 'shareSubscription':
        this.activeRows = this.allShareSubscriptions
          .filter(s => s.memberId === id)
          .map(s => ({
            id: s.id,
            units: s.units,
            totalAmount: s.totalAmount,
            subscriptionDate: s.subscriptionDate,
            remark: s.remark,
          }));
        break;
      case 'sharePurchase':
        this.activeRows = this.allSharePurchases
          .filter(p => p.memberId === id)
          .map(p => ({
            id: p.id,
            units: p.units,
            totalAmount: p.totalAmount,
            serviceFee: p.serviceFee,
            transactionReference: p.transactionReference,
            purchaseDate: p.purchaseDate,
            bankName: this.accounts.find(a => a.id === p.bankId)?.name ?? '-',
            remark: p.remark,
          }));
        break;
      case 'mandatoryTracker':
        this.activeRows = this.trackerData.map(t => ({
          id: t.label,
          label: t.label,
          requiredAmount: t.requiredAmount,
          paidAmount: t.paidAmount,
          remaining: t.remaining,
          status: t.status,
          savingTypeName: '',
          accountDisplayName: '',
        }));
        break;
    }
  }

  private computeTotals() {
    const id = this.member?.id;
    if (!id) {
      this.totalSavings = 0;
      this.totalWithdrawals = 0;
      this.totalShares = 0;
      this.totalSubscriptions = 0;
      return;
    }
    this.totalSavings = this.allSavings
      .filter(s => s.memberId === id)
      .reduce((sum, s) => sum + (s.savingAmount || 0), 0);
    this.totalWithdrawals = this.allWithdrawals
      .filter(w => w.memberId === id)
      .reduce((sum, w) => sum + (w.amount || 0), 0);
    this.totalShares = this.allSharePurchases
      .filter(p => p.memberId === id)
      .reduce((sum, p) => sum + (p.totalAmount || 0), 0);
    this.totalSubscriptions = this.allShareSubscriptions
      .filter(s => s.memberId === id)
      .reduce((sum, s) => sum + (s.totalAmount || 0), 0);
  }

  private accountDisplayName(accountId?: string): string {
    const a = this.accounts.find(acc => acc.id === accountId);
    return a ? `${a.name || 'Account'}${a.accountNumber ? ' · ' + a.accountNumber : ''}` : 'Unknown';
  }

  private memberName(memberId: string): string {
    const m = this.allMembers.find(mm => mm.id === memberId);
    return m ? m.fullName : 'Unknown';
  }

  addRecord() {
    if (!this.member?.id) return;
    if (this.activeTab === 'mandatoryTracker') return;
    const memberId = this.member.id;
    const options = { width: '90vw', maxWidth: '1000px' };
    switch (this.activeTab) {
      case 'saving': this.dialog.open(SavingFormComponent, { ...options, data: { memberId } }); break;
      case 'withdrawal': this.dialog.open(WithdrawalFormComponent, { ...options, data: { memberId } }); break;
      case 'transfer': this.dialog.open(TransferFormComponent, { ...options, data: { memberId } }); break;
      case 'shareTransfer': this.dialog.open(ShareTransferFormComponent, { ...options, data: { memberId } }); break;
      case 'shareSubscription': this.dialog.open(SubscriptionFormComponent, { ...options, data: { memberId } }); break;
      case 'sharePurchase': this.dialog.open(PurchaseFormComponent, { ...options, data: { memberId } }); break;
    }
  }

  editRecord(row: any) {
    if (!row?.id) return;
    if (this.activeTab === 'mandatoryTracker') return;
    const options = { width: '90vw', maxWidth: '1000px' };
    switch (this.activeTab) {
      case 'saving': this.dialog.open(SavingFormComponent, { ...options, data: { saving: this.allSavings.find(s => s.id === row.id) } }); break;
      case 'withdrawal': this.dialog.open(WithdrawalFormComponent, { ...options, data: { withdrawal: this.allWithdrawals.find(w => w.id === row.id) } }); break;
      case 'transfer': this.dialog.open(TransferFormComponent, { ...options, data: { transfer: this.allTransfers.find(t => t.id === row.id) } }); break;
      case 'shareTransfer': this.dialog.open(ShareTransferFormComponent, { ...options, data: { transfer: this.allShareTransfers.find(t => t.id === row.id) } }); break;
      case 'shareSubscription': this.dialog.open(SubscriptionFormComponent, { ...options, data: { subscription: this.allShareSubscriptions.find(s => s.id === row.id) } }); break;
      case 'sharePurchase': this.dialog.open(PurchaseFormComponent, { ...options, data: { purchase: this.allSharePurchases.find(p => p.id === row.id) } }); break;
    }
  }

  deleteRecord(row: any) {
    if (!row?.id) return;
    if (this.activeTab === 'mandatoryTracker') return;
    const label = this.activeTabLabel();
    if (!confirm(`Delete this ${label} record? This cannot be undone.`)) return;
    switch (this.activeTab) {
      case 'saving': this.store.dispatch(deleteSaving({ id: row.id })); break;
      case 'withdrawal': this.store.dispatch(deleteWithdrawal({ id: row.id })); break;
      case 'transfer': this.store.dispatch(deleteTransfer({ id: row.id })); break;
      case 'shareTransfer': this.store.dispatch(deleteShareTransfer({ id: row.id })); break;
      case 'shareSubscription': this.store.dispatch(deleteShareSubscription({ id: row.id })); break;
      case 'sharePurchase': this.store.dispatch(deleteSharePurchase({ id: row.id })); break;
    }
  }

  private loadTracker(): void {
    const id = this.member?.id;
    if (!id || this.activeTab !== 'mandatoryTracker') return;
    this.trackerLoading = true;
    this.apiService.getTracker(id).subscribe({
      next: (data) => {
        this.trackerData = (data as { label: string; requiredAmount: number; paidAmount: number; remaining: number; status: string }[]) ?? [];
        this.trackerLoading = false;
      },
      error: () => { this.trackerLoading = false; },
    });
  }
}
