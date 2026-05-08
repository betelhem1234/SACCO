import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

import {
  Account,
  AccountType,
  AccountCategory,
  ACCOUNT_TYPE_OPTIONS,
  ACCOUNT_CATEGORY_OPTIONS,
  accountTypeLabel,
  accountCategoryLabel,
} from '@sacco/shared-models';
import { AppState } from '../../models/state.model';
import { deleteAccount, loadAccounts } from '../../state/lookups.actions';
import { Subject, takeUntil } from 'rxjs';
import { selectAllAccounts } from '../../state/lookups.selectors';
import { AccountFormComponent } from '../account-form/account-form.component';
import { GenericDetailDialogComponent, DetailDialogData } from '../generic-detail-dialog/generic-detail-dialog.component';

@Component({
  selector: 'app-account-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDialogModule,
    MatTooltipModule,
    MatSelectModule,
    MatFormFieldModule,
  ],
  template: `
    <section class="p-6" style="background:#f0f4f8;min-height:100%">
      <div class="max-w-7xl mx-auto">
        <div class="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background:linear-gradient(135deg,#3b82f6,#1d4ed8)">
              <span class="material-icons text-white" style="font-size:20px">account_balance_wallet</span>
            </div>
            <div>
              <h1 class="text-xl font-bold" style="color:#1e293b">Chart of accounts</h1>
              <p class="text-xs" style="color:#64748b">Assets, liabilities, equity, revenue, and expense accounts</p>
            </div>
          </div>
          <button (click)="onAdd()" class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-0 cursor-pointer text-white" style="background:linear-gradient(135deg,#3b82f6,#1d4ed8)">
            <span class="material-icons" style="font-size:18px">add</span> Add account
          </button>
        </div>

        <div class="flex flex-wrap items-end gap-4 mb-4 p-4 rounded-2xl bg-white border shadow-sm" style="border-color:#e2e8f0">
          <mat-form-field appearance="outline" class="min-w-[180px]" subscriptSizing="dynamic">
            <mat-label>Account type</mat-label>
            <mat-select [(ngModel)]="filterAccountType" (selectionChange)="applyFilters()">
              <mat-option [value]="null">All types</mat-option>
              <mat-option *ngFor="let o of typeOptions" [value]="o.value">{{ o.label }}</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" class="min-w-[200px]" subscriptSizing="dynamic">
            <mat-label>Account category</mat-label>
            <mat-select [(ngModel)]="filterAccountCategory" (selectionChange)="applyFilters()">
              <mat-option [value]="null">All categories</mat-option>
              <mat-option *ngFor="let o of categoryOptions" [value]="o.value">{{ o.label }}</mat-option>
            </mat-select>
          </mat-form-field>
          <button mat-button type="button" (click)="clearFilters()" style="color:#64748b">Clear filters</button>
        </div>

        <div class="bg-white rounded-2xl overflow-hidden shadow-sm border" style="border-color:#e2e8f0">
          <table mat-table [dataSource]="dataSource" class="w-full">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef class="pl-6">Name</th>
              <td mat-cell *matCellDef="let a" class="pl-6 font-medium">{{ a.name }}</td>
            </ng-container>
            <ng-container matColumnDef="accountNumber">
              <th mat-header-cell *matHeaderCellDef>Number</th>
              <td mat-cell *matCellDef="let a" class="font-mono text-sm">{{ a.accountNumber }}</td>
            </ng-container>
            <ng-container matColumnDef="accountType">
              <th mat-header-cell *matHeaderCellDef>Type</th>
              <td mat-cell *matCellDef="let a">{{ typeLabel(a.accountType) }}</td>
            </ng-container>
            <ng-container matColumnDef="accountCategory">
              <th mat-header-cell *matHeaderCellDef>Category</th>
              <td mat-cell *matCellDef="let a">{{ categoryLabel(a.accountCategory) }}</td>
            </ng-container>
            <ng-container matColumnDef="isActive">
              <th mat-header-cell *matHeaderCellDef>Active</th>
              <td mat-cell *matCellDef="let a">
                <span class="text-xs font-semibold px-2 py-0.5 rounded-full"
                      [style.background]="a.isActive ? '#d1fae5' : '#fee2e2'"
                      [style.color]="a.isActive ? '#065f46' : '#991b1b'">{{ a.isActive ? 'Yes' : 'No' }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef class="text-right pr-6">Actions</th>
              <td mat-cell *matCellDef="let a" class="text-right pr-6 gap-1">
                <button mat-icon-button matTooltip="View" (click)="onView(a)" class="!w-8 !h-8" style="color:#059669">
                  <span class="material-icons" style="font-size:18px">visibility</span>
                </button>
                <button mat-icon-button matTooltip="Edit" (click)="onEdit(a)" class="!w-8 !h-8" style="color:#1e3a5f">
                  <span class="material-icons" style="font-size:18px">edit</span>
                </button>
                <button mat-icon-button matTooltip="Delete" (click)="onDelete(a)" class="!w-8 !h-8" style="color:#ef4444">
                  <span class="material-icons" style="font-size:18px">delete_outline</span>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
          <div *ngIf="dataSource.data.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
            <p class="font-medium" style="color:#64748b">No accounts match the current filters</p>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: []
})
export class AccountListComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['name', 'accountNumber', 'accountType', 'accountCategory', 'isActive', 'actions'];
  dataSource = new MatTableDataSource<Account>();

  filterAccountType: AccountType | null = null;
  filterAccountCategory: AccountCategory | null = null;
  readonly typeOptions = ACCOUNT_TYPE_OPTIONS;
  readonly categoryOptions = ACCOUNT_CATEGORY_OPTIONS;

  private destroy$ = new Subject<void>();
  private allAccounts: Account[] = [];

  constructor(private store: Store<AppState>, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.store.dispatch(loadAccounts({}));
    this.store
      .select(selectAllAccounts)
      .pipe(takeUntil(this.destroy$))
      .subscribe((accounts) => {
        this.allAccounts = accounts ?? [];
        this.applyFilters();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  applyFilters(): void {
    this.dataSource.data = this.allAccounts.filter((a) => {
      if (this.filterAccountType != null && a.accountType !== this.filterAccountType) {
        return false;
      }
      if (this.filterAccountCategory != null && a.accountCategory !== this.filterAccountCategory) {
        return false;
      }
      return true;
    });
  }

  clearFilters(): void {
    this.filterAccountType = null;
    this.filterAccountCategory = null;
    this.applyFilters();
  }

  typeLabel(t: AccountType): string {
    return accountTypeLabel(t);
  }

  categoryLabel(c: AccountCategory): string {
    return accountCategoryLabel(c);
  }

  onAdd() {
    this.dialog.open(AccountFormComponent, { width: '520px' });
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
        { key: 'isActive', label: 'Active', type: 'boolean' },
      ]
    };
    this.dialog.open(GenericDetailDialogComponent, { data: dialogData });
  }

  onEdit(account: Account) {
    this.dialog.open(AccountFormComponent, { width: '520px', data: { account } });
  }

  onDelete(account: Account) {
    if (!account.id) return;
    if (confirm(`Delete account "${account.name}"? This cannot be undone.`)) {
      this.store.dispatch(deleteAccount({ id: account.id }));
    }
  }
}
