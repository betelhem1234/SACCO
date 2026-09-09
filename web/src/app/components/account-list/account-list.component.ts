import { Component, OnDestroy, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

import {
  Account,
  AccountType,
  AccountCategory,
  AccountClassification,
  ACCOUNT_TYPE_OPTIONS,
  ACCOUNT_CATEGORY_OPTIONS,
  accountTypeLabel,
  accountCategoryLabel,
} from '@sacco/shared-models';
import { AppState } from '../../models/state.model';
import { deleteAccount, loadAccounts, loadAccountClassifications } from '../../state/lookups/lookups.actions';
import { Subject, takeUntil } from 'rxjs';
import { selectAllAccounts, selectAllAccountClassifications } from '../../state/lookups/lookups.selectors';
import { AccountFormComponent } from '../account-form/account-form.component';
import { GenericDetailDialogComponent, DetailDialogData } from '../generic-detail-dialog/generic-detail-dialog.component';

interface AccountRow extends Account {
  classificationName?: string;
}

@Component({
  selector: 'app-account-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatDialogModule,
    MatTooltipModule,
    MatSelectModule,
    MatFormFieldModule,
  ],
  templateUrl: './account-list.component.html',
  styleUrls: ['./account-list.component.css']
})
export class AccountListComponent implements OnInit, OnDestroy, AfterViewInit {
  displayedColumns: string[] = ['name', 'accountNumber', 'accountType', 'accountCategory', 'classification', 'isActive', 'actions'];
  dataSource = new MatTableDataSource<AccountRow>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  filterAccountType: AccountType | null = null;
  filterAccountCategory: AccountCategory | null = null;
  filterClassificationId: string | null = null;
  readonly typeOptions = ACCOUNT_TYPE_OPTIONS;
  readonly categoryOptions = ACCOUNT_CATEGORY_OPTIONS;
  classifications: AccountClassification[] = [];

  private destroy$ = new Subject<void>();
  private allAccounts: Account[] = [];

  constructor(private store: Store<AppState>, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.store.dispatch(loadAccounts({}));
    this.store.dispatch(loadAccountClassifications());
    this.store
      .select(selectAllAccountClassifications)
      .pipe(takeUntil(this.destroy$))
      .subscribe((classifications) => {
        this.classifications = classifications ?? [];
        this.applyFilters();
      });
    this.store
      .select(selectAllAccounts)
      .pipe(takeUntil(this.destroy$))
      .subscribe((accounts) => {
        this.allAccounts = accounts ?? [];
        this.applyFilters();
      });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  applyFilters(): void {
    const filtered = this.allAccounts.filter((a) => {
      if (this.filterAccountType != null && a.accountType !== this.filterAccountType) {
        return false;
      }
      if (this.filterAccountCategory != null && a.accountCategory !== this.filterAccountCategory) {
        return false;
      }
      if (this.filterClassificationId != null && a.classificationId !== this.filterClassificationId) {
        return false;
      }
      return true;
    });
    this.dataSource.data = filtered.map((a) => {
      const classification = this.classifications?.find((c) => c.id === a.classificationId);
      return { ...a, classificationName: classification?.name };
    });
    this.dataSource.paginator = this.paginator;
  }

  classificationLabel(row: AccountRow): string {
    return row.classificationName ?? '—';
  }

  clearFilters(): void {
    this.filterAccountType = null;
    this.filterAccountCategory = null;
    this.filterClassificationId = null;
    this.applyFilters();
  }

  typeLabel(t: AccountType): string {
    return accountTypeLabel(t);
  }

  categoryLabel(c: AccountCategory): string {
    return accountCategoryLabel(c);
  }

  onAdd() {
    this.dialog.open(AccountFormComponent, { width: '90vw', maxWidth: '1000px' });
  }

  onView(account: Account) {
    const dialogData: DetailDialogData = {
      title: 'Account Information',
      subTitle: account.name,
      icon: 'account_balance_wallet',
      data: account,
      fields: [
        { key: 'name', label: 'Name', type: 'text' },
        { key: 'accountNumber', label: 'Number', type: 'text' },
        { key: 'accountType', label: 'Type', type: 'custom', formatFn: () => this.typeLabel(account.accountType) },
        { key: 'accountCategory', label: 'Category', type: 'custom', formatFn: () => this.categoryLabel(account.accountCategory) },
        { key: 'classification', label: 'Classification', type: 'custom', formatFn: () => this.classificationLabel(account as AccountRow) },
        { key: 'isActive', label: 'Active', type: 'boolean' },
      ]
    };
    this.dialog.open(GenericDetailDialogComponent, { data: dialogData });
  }

  onEdit(account: Account) {
    this.dialog.open(AccountFormComponent, { width: '90vw', maxWidth: '1000px', data: { account } });
  }

  onDelete(account: Account) {
    if (!account.id) return;
    if (confirm(`Delete account "${account.name}"? This cannot be undone.`)) {
      this.store.dispatch(deleteAccount({ id: account.id }));
    }
  }
}
