import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ShareSubscription, SharePurchase, Member } from '@sacco/shared-models';
import { SubscriptionFormComponent } from '../share-subscription-form/subscription-form.component';
import { PurchaseFormComponent } from '../share-purchase-form/purchase-form.component';
import { GenericDetailDialogComponent, DetailDialogData } from '../generic-detail-dialog/generic-detail-dialog.component';
import { Store } from '@ngrx/store';
import { AppState } from '../../models/state.model';
import { selectAllMembers } from '../../state/members/members.selectors';
import { loadMembers } from '../../state/members/members.actions';
import { selectAllShareSubscriptions } from '../../state/share-subscription/share-subscriptions.selectors';
import { selectAllSharePurchases } from '../../state/share-purchase/share-purchases.selectors';
import { loadShareSubscriptions, deleteShareSubscription, approveShareSubscription, rejectShareSubscription, reverseShareSubscription } from '../../state/share-subscription/share-subscriptions.actions';
import { loadSharePurchases, deleteSharePurchase, approveSharePurchase, rejectSharePurchase, reverseSharePurchase } from '../../state/share-purchase/share-purchases.actions';

interface SubscriptionRow extends ShareSubscription {
  memberName?: string;
  memberIdNumber?: string;
}

interface PurchaseRow extends SharePurchase {
  memberName?: string;
  memberIdNumber?: string;
  shareAmount?: number;
}

@Component({
  selector: 'app-share-purchase',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTableModule, MatPaginatorModule, MatTabsModule, MatDialogModule, MatTooltipModule],
  templateUrl: './share-purchase.component.html',
  styleUrls: ['./share-purchase.component.css']
})
export class SharePurchaseComponent implements OnInit {
  @ViewChild('subRequestsPaginator') subRequestsPaginator!: MatPaginator;
  @ViewChild('subApprovedPaginator') subApprovedPaginator!: MatPaginator;
  @ViewChild('purchaseRequestsPaginator') purchaseRequestsPaginator!: MatPaginator;
  @ViewChild('purchaseApprovedPaginator') purchaseApprovedPaginator!: MatPaginator;

  subscriptionColumns = ['memberIdNumber', 'memberName', 'units', 'totalAmount', 'subscriptionDate', 'status', 'actions'];
  purchaseColumns = ['memberIdNumber', 'memberName', 'units', 'totalAmount', 'serviceFee', 'transactionReference', 'purchaseDate', 'status', 'actions'];

  subRequestsDataSource = new MatTableDataSource<SubscriptionRow>();
  subApprovedDataSource = new MatTableDataSource<SubscriptionRow>();
  purchaseRequestsDataSource = new MatTableDataSource<PurchaseRow>();
  purchaseApprovedDataSource = new MatTableDataSource<PurchaseRow>();

  private allMembers: Member[] = [];

  constructor(
    private dialog: MatDialog,
    private store: Store<AppState>
  ) {}

  ngOnInit() {
    this.store.dispatch(loadMembers());
    this.store.dispatch(loadShareSubscriptions());
    this.store.dispatch(loadSharePurchases());

    this.store.select(selectAllMembers).subscribe(m => this.allMembers = m ?? []);

    this.store.select(selectAllShareSubscriptions).subscribe(list => {
      const rows = (list || []).map(r => this.enrichMember(r));
      this.subRequestsDataSource.data = rows.filter(r => !this.isPosted(r));
      this.subApprovedDataSource.data = rows.filter(r => this.isPosted(r));
      this.subRequestsDataSource.paginator = this.subRequestsPaginator;
      this.subApprovedDataSource.paginator = this.subApprovedPaginator;
    });

    this.store.select(selectAllSharePurchases).subscribe(list => {
      const rows = (list || []).map(r => this.enrichMember(r));
      this.purchaseRequestsDataSource.data = rows.filter(r => !this.isPosted(r));
      this.purchaseApprovedDataSource.data = rows.filter(r => this.isPosted(r));
      this.purchaseRequestsDataSource.paginator = this.purchaseRequestsPaginator;
      this.purchaseApprovedDataSource.paginator = this.purchaseApprovedPaginator;
    });
  }

  private enrichMember(row: any): any {
    const member = this.allMembers.find(m => m.id === row.memberId);
    return {
      ...row,
      memberName: member?.fullName || 'Unknown',
      memberIdNumber: member?.idNumbe || member?.memberid || '—',
      shareAmount: Math.max((row.totalAmount || 0) - (row.serviceFee || 0), 0),
      statusLabel: this.statusLabel(row.status),
    };
  }

  onTabChange(event: any) {
    if (event.index === 0) {
      this.subRequestsDataSource.paginator = this.subRequestsPaginator;
      this.subApprovedDataSource.paginator = this.subApprovedPaginator;
    } else {
      this.purchaseRequestsDataSource.paginator = this.purchaseRequestsPaginator;
      this.purchaseApprovedDataSource.paginator = this.purchaseApprovedPaginator;
    }
  }

  onSubInnerTabChange(index: number) {
    if (index === 0) {
      this.subRequestsDataSource.paginator = this.subRequestsPaginator;
    } else {
      this.subApprovedDataSource.paginator = this.subApprovedPaginator;
    }
  }

  onPurchaseInnerTabChange(index: number) {
    if (index === 0) {
      this.purchaseRequestsDataSource.paginator = this.purchaseRequestsPaginator;
    } else {
      this.purchaseApprovedDataSource.paginator = this.purchaseApprovedPaginator;
    }
  }

  onAddSubscription() {
    this.dialog.open(SubscriptionFormComponent, { width: '90vw', maxWidth: '1000px' });
  }

  onEditSubscription(row: SubscriptionRow) {
    this.dialog.open(SubscriptionFormComponent, { width: '90vw', maxWidth: '1000px', data: { subscription: row } });
  }

  onDeleteSubscription(row: SubscriptionRow) {
    if (!row.id) return;
    if (confirm(`Delete subscription for "${row.memberName}"?`)) {
      this.store.dispatch(deleteShareSubscription({ id: row.id }));
    }
  }

  onApproveSubscription(row: SubscriptionRow) {
    if (!row.id) return;
    this.store.dispatch(approveShareSubscription({ id: row.id }));
  }

  onRejectSubscription(row: SubscriptionRow) {
    if (!row.id) return;
    if (confirm(`Reject subscription for "${row.memberName}"?`)) {
      this.store.dispatch(rejectShareSubscription({ id: row.id }));
    }
  }

  onReverseSubscription(row: SubscriptionRow) {
    if (!row.id) return;
    if (confirm(`Reverse subscription for "${row.memberName}" back to pending?`)) {
      this.store.dispatch(reverseShareSubscription({ id: row.id }));
    }
  }

  onPrintSubscription(row: SubscriptionRow) {
    if (!row.id) return;
    window.alert(`Printing CRV for ${row.memberName} - Subscription: ${row.totalAmount}`);
  }

  onViewSubscription(row: SubscriptionRow) {
    const dialogData: DetailDialogData = {
      title: 'Share Subscription Details',
      subTitle: row.memberName,
      icon: 'precision_manufacturing',
      data: row,
      fields: [
        { key: 'memberIdNumber', label: 'Member ID', type: 'text' },
        { key: 'memberName', label: 'Member Name', type: 'text' },
        { key: 'units', label: 'Units', type: 'text' },
        { key: 'totalAmount', label: 'Total Amount', type: 'currency' },
        { key: 'subscriptionDate', label: 'Subscription Date', type: 'date' },
        { key: 'remark', label: 'Remark', type: 'text' },
        { key: 'statusLabel', label: 'Status', type: 'text' },
        { key: 'createdAt', label: 'Recorded At', type: 'date' },
      ]
    };
    this.dialog.open(GenericDetailDialogComponent, { data: dialogData });
  }

  onAddPurchase() {
    this.dialog.open(PurchaseFormComponent, { width: '90vw', maxWidth: '1000px' });
  }

  onEditPurchase(row: PurchaseRow) {
    this.dialog.open(PurchaseFormComponent, { width: '90vw', maxWidth: '1000px', data: { purchase: row } });
  }

  onDeletePurchase(row: PurchaseRow) {
    if (!row.id) return;
    if (confirm(`Delete purchase for "${row.memberName}"?`)) {
      this.store.dispatch(deleteSharePurchase({ id: row.id }));
    }
  }

  onApprovePurchase(row: PurchaseRow) {
    if (!row.id) return;
    this.store.dispatch(approveSharePurchase({ id: row.id }));
  }

  onRejectPurchase(row: PurchaseRow) {
    if (!row.id) return;
    if (confirm(`Reject purchase for "${row.memberName}"?`)) {
      this.store.dispatch(rejectSharePurchase({ id: row.id }));
    }
  }

  onReversePurchase(row: PurchaseRow) {
    if (!row.id) return;
    if (confirm(`Reverse purchase for "${row.memberName}" back to pending? This removes its ledger entries.`)) {
      this.store.dispatch(reverseSharePurchase({ id: row.id }));
    }
  }

  onPrintPurchase(row: PurchaseRow) {
    if (!row.id) return;
    window.alert(`Printing CRV for ${row.memberName} - Purchase: ${row.shareAmount ?? row.totalAmount}`);
  }

  onViewPurchase(row: PurchaseRow) {
    const dialogData: DetailDialogData = {
      title: 'Share Purchase Details',
      subTitle: row.memberName,
      icon: 'currency_exchange',
      data: row,
      fields: [
        { key: 'memberIdNumber', label: 'Member ID', type: 'text' },
        { key: 'memberName', label: 'Member Name', type: 'text' },
        { key: 'units', label: 'Units', type: 'text' },
        { key: 'totalAmount', label: 'Total Amount', type: 'currency' },
        { key: 'serviceFee', label: 'Service Fee', type: 'currency' },
        { key: 'shareAmount', label: 'Share Amount', type: 'currency' },
        { key: 'transactionReference', label: 'Transaction Ref', type: 'text' },
        { key: 'purchaseDate', label: 'Purchase Date', type: 'date' },
        { key: 'remark', label: 'Remark', type: 'text' },
        { key: 'statusLabel', label: 'Status', type: 'text' },
        { key: 'createdAt', label: 'Recorded At', type: 'date' },
      ]
    };
    this.dialog.open(GenericDetailDialogComponent, { data: dialogData });
  }

  statusLabel(status?: string): string {
    return status ? status.toUpperCase() : 'POSTED';
  }

  isPending(row: any): boolean {
    return row.status === 'PENDING';
  }

  isPosted(row: any): boolean {
    return !row.status || row.status === 'POSTED';
  }
}
