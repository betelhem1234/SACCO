import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, map, Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Withdrawal } from '@sacco/shared-models';
import { AppState } from '../../models/state.model';
import { deleteWithdrawal, loadWithdrawals } from '../../state/withdrawals.actions';
import { selectAllWithdrawals } from '../../state/withdrawals.selectors';
import { selectAllMembers } from '../../state/members.selectors';
import { selectAllAccounts, selectAllSavingTypes } from '../../state/lookups.selectors';
import { WithdrawalFormComponent } from '../withdrawal-form/withdrawal-form.component';
import { GenericDetailDialogComponent, DetailDialogData } from '../generic-detail-dialog/generic-detail-dialog.component';

@Component({
  selector: 'app-withdrawal-list',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTableModule, MatDialogModule, MatTooltipModule],
  template: `
    <section class="p-6" style="background:#f0f4f8;min-height:100%">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                 style="background:linear-gradient(135deg,#7c3aed,#5b21b6)">
              <span class="material-icons text-white" style="font-size:20px">payments</span>
            </div>
            <div>
              <h1 class="text-xl font-bold" style="color:#1e293b">Withdrawal Register</h1>
              <p class="text-xs" style="color:#64748b">Manage member withdrawals</p>
            </div>
          </div>
          <button (click)="onAdd()"
                  class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-0 cursor-pointer text-white"
                  style="background:linear-gradient(135deg,#7c3aed,#5b21b6)">
            <span class="material-icons" style="font-size:18px">add</span> Add Withdrawal
          </button>
        </div>

        <!-- Table -->
        <div class="bg-white rounded-2xl overflow-hidden shadow-sm border" style="border-color:#e2e8f0">
          <table mat-table [dataSource]="dataSource" class="w-full">

            <ng-container matColumnDef="memberName">
              <th mat-header-cell *matHeaderCellDef class="pl-6">Member</th>
              <td mat-cell *matCellDef="let row" class="pl-6 font-medium">{{ row.memberName }}</td>
            </ng-container>

            <ng-container matColumnDef="savingTypeName">
              <th mat-header-cell *matHeaderCellDef>Saving Type</th>
              <td mat-cell *matCellDef="let row">
                <span class="text-xs font-mono px-2 py-0.5 rounded" style="background:#f1f5f9;color:#475569">
                  {{ row.savingTypeName }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef>Amount (ETB)</th>
              <td mat-cell *matCellDef="let row">
                <span class="font-semibold" style="color:#7c3aed">{{ row.amount | number:'1.2-2' }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="ftp">
              <th mat-header-cell *matHeaderCellDef>FTP Ref</th>
              <td mat-cell *matCellDef="let row">{{ row.ftp }}</td>
            </ng-container>

            <ng-container matColumnDef="bankName">
              <th mat-header-cell *matHeaderCellDef>Credit Bank Account</th>
              <td mat-cell *matCellDef="let row">{{ row.bankName }}</td>
            </ng-container>

            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let row">{{ row.date | date:'yyyy-MM-dd' }}</td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef class="text-right pr-6">Actions</th>
              <td mat-cell *matCellDef="let row" class="text-right pr-6 gap-1">
                <button mat-icon-button matTooltip="View" (click)="onView(row)" class="!w-8 !h-8" style="color:#059669">
                  <span class="material-icons" style="font-size:18px">visibility</span>
                </button>
                <button mat-icon-button matTooltip="Edit" (click)="onEdit(row)" class="!w-8 !h-8" style="color:#7c3aed">
                  <span class="material-icons" style="font-size:18px">edit</span>
                </button>
                <button mat-icon-button matTooltip="Delete" (click)="onDelete(row)" class="!w-8 !h-8" style="color:#ef4444">
                  <span class="material-icons" style="font-size:18px">delete_outline</span>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>

          <div *ngIf="dataSource.data.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
            <span class="material-icons mb-3" style="font-size:48px;color:#cbd5e1">payments</span>
            <p class="font-medium" style="color:#64748b">No withdrawals recorded yet</p>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: []
})
export class WithdrawalListComponent implements OnInit {
  displayedColumns: string[] = ['memberName', 'savingTypeName', 'amount', 'ftp', 'bankName', 'date', 'actions'];
  dataSource = new MatTableDataSource<any>();

  constructor(private store: Store<AppState>, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.store.dispatch(loadWithdrawals());

    combineLatest([
      this.store.select(selectAllWithdrawals),
      this.store.select(selectAllMembers),
      this.store.select(selectAllSavingTypes),
      this.store.select(selectAllAccounts),
    ]).pipe(
      map(([withdrawals, members, savingTypes, accounts]) =>
        (withdrawals ?? []).map(w => ({
          ...w,
          memberName: members?.find(m => m.id === w.memberId)?.fullName ?? 'Unknown',
          savingTypeName: savingTypes?.find(s => s.id === w.savingTypeId)?.name ?? 'Unknown',
          bankName: accounts?.find(a => a.id === w.bankId)?.name ?? 'Unknown',
        }))
      )
    ).subscribe(rows => this.dataSource.data = rows);
  }

  onAdd() {
    this.dialog.open(WithdrawalFormComponent, { width: '560px' });
  }

  onView(row: any) {
    const dialogData: DetailDialogData = {
      title: 'Withdrawal Info',
      subTitle: row.memberName,
      icon: 'payments',
      data: row,
      fields: [
        { key: 'memberName', label: 'Member Name', type: 'text' },
        { key: 'savingTypeName', label: 'Saving Type', type: 'text' },
        { key: 'amount', label: 'Amount', type: 'currency' },
        { key: 'ftp', label: 'FTP Ref', type: 'text' },
        { key: 'bankName', label: 'Credit Account', type: 'text' },
        { key: 'date', label: 'Date', type: 'date' },
        { key: 'remark', label: 'Remark', type: 'text' },
      ]
    };
    this.dialog.open(GenericDetailDialogComponent, { data: dialogData });
  }

  onEdit(row: any) {
    this.dialog.open(WithdrawalFormComponent, { width: '560px', data: { withdrawal: row as Withdrawal } });
  }

  onDelete(row: any) {
    if (!row.id) return;
    if (confirm(`Delete withdrawal of ${row.amount} ETB for "${row.memberName}"? This cannot be undone.`)) {
      this.store.dispatch(deleteWithdrawal({ id: row.id }));
    }
  }
}
