import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, map, Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Withdrawal } from '@sacco/shared-models';
import { AppState } from '../../models/state.model';
import { deleteWithdrawal, loadWithdrawals, approveWithdrawal, rejectWithdrawal } from '../../state/withdrawals/withdrawals.actions';
import { selectAllWithdrawals } from '../../state/withdrawals/withdrawals.selectors';
import { selectAllMembers } from '../../state/members/members.selectors';
import { selectAllAccounts, selectAllSavingTypes } from '../../state/lookups/lookups.selectors';
import { WithdrawalFormComponent } from '../withdrawal-form/withdrawal-form.component';
import { GenericDetailDialogComponent, DetailDialogData } from '../generic-detail-dialog/generic-detail-dialog.component';

@Component({
  selector: 'app-withdrawal-list',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTableModule, MatPaginatorModule, MatDialogModule, MatTooltipModule],
  templateUrl: './withdrawal-list.component.html',
  styleUrls: ['./withdrawal-list.component.css']
})
export class WithdrawalListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['memberName', 'savingTypeName', 'amount', 'ftp', 'bankName', 'date', 'status', 'actions'];
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;

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
    ).subscribe(rows => {
      this.dataSource.data = rows;
      this.dataSource.paginator = this.paginator;
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  onAdd() {
    this.dialog.open(WithdrawalFormComponent, { width: '90vw', maxWidth: '1000px' });
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
        { key: 'status', label: 'Status', type: 'text' },
        { key: 'remark', label: 'Remark', type: 'text' },
      ]
    };
    this.dialog.open(GenericDetailDialogComponent, { data: dialogData });
  }

  onEdit(row: any) {
    this.dialog.open(WithdrawalFormComponent, { width: '90vw', maxWidth: '1000px', data: { withdrawal: row as Withdrawal } });
  }

  onDelete(row: any) {
    if (!row.id) return;
    if (confirm(`Delete withdrawal of ${row.amount} ETB for "${row.memberName}"? This cannot be undone.`)) {
      this.store.dispatch(deleteWithdrawal({ id: row.id }));
    }
  }

  onApprove(row: any) {
    if (row.id && confirm(`Approve this withdrawal of ${row.amount} ETB for "${row.memberName}" and post to ledger?`)) {
      this.store.dispatch(approveWithdrawal({ id: row.id }));
    }
  }

  onReject(row: any) {
    if (row.id && confirm(`Reject this withdrawal of ${row.amount} ETB for "${row.memberName}"?`)) {
      this.store.dispatch(rejectWithdrawal({ id: row.id }));
    }
  }

  getStatusBadgeStyle(status?: string): Record<string, string> {
    switch (status ?? 'POSTED') {
      case 'PENDING':
        return { background: '#fef3c7', color: '#b45309' };
      case 'REJECTED':
        return { background: '#fee2e2', color: '#b91c1c' };
      default:
        return { background: '#d1fae5', color: '#047857' };
    }
  }
}
