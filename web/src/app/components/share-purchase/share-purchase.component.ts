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
import { Store } from '@ngrx/store';
import { AppState } from '../../models/state.model';
import { selectAllMembers } from '../../state/members/members.selectors';
import { loadMembers } from '../../state/members/members.actions';
import { selectAllShareSubscriptions } from '../../state/share-subscription/share-subscriptions.selectors';
import { selectAllSharePurchases } from '../../state/share-purchase/share-purchases.selectors';
import { loadShareSubscriptions, deleteShareSubscription } from '../../state/share-subscription/share-subscriptions.actions';
import { loadSharePurchases, deleteSharePurchase } from '../../state/share-purchase/share-purchases.actions';

interface SubscriptionRow extends ShareSubscription {
  memberName?: string;
  memberIdNumber?: string;
}

interface PurchaseRow extends SharePurchase {
  memberName?: string;
  memberIdNumber?: string;
}

@Component({
  selector: 'app-share-purchase',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTableModule, MatPaginatorModule, MatTabsModule, MatDialogModule, MatTooltipModule],
  templateUrl: './share-purchase.component.html',
  styleUrls: ['./share-purchase.component.css']
})
export class SharePurchaseComponent implements OnInit {
  @ViewChild('subPaginator') subPaginator!: MatPaginator;
  @ViewChild('purchasePaginator') purchasePaginator!: MatPaginator;

  subscriptionColumns = ['memberIdNumber', 'memberName', 'units', 'totalAmount', 'subscriptionDate', 'actions'];
  purchaseColumns = ['memberIdNumber', 'memberName', 'units', 'totalAmount', 'serviceFee', 'transactionReference', 'purchaseDate', 'actions'];

  subscriptionDataSource = new MatTableDataSource<SubscriptionRow>();
  purchaseDataSource = new MatTableDataSource<PurchaseRow>();

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
      this.subscriptionDataSource.data = rows;
      this.subscriptionDataSource.paginator = this.subPaginator;
    });

    this.store.select(selectAllSharePurchases).subscribe(list => {
      const rows = (list || []).map(r => this.enrichMember(r));
      this.purchaseDataSource.data = rows;
      this.purchaseDataSource.paginator = this.purchasePaginator;
    });
  }

  private enrichMember(row: any): any {
    const member = this.allMembers.find(m => m.id === row.memberId);
    return {
      ...row,
      memberName: member?.fullName || 'Unknown',
      memberIdNumber: member?.idNumbe || member?.memberid || '—',
    };
  }

  onTabChange(event: any) {
    if (event.index === 0) {
      this.subscriptionDataSource.paginator = this.subPaginator;
    } else {
      this.purchaseDataSource.paginator = this.purchasePaginator;
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
}
