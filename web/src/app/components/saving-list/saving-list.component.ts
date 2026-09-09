import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Saving, Member, SavingType } from '@sacco/shared-models';
import { AppState } from '../../models/state.model';
import { deleteSaving, approveSaving, rejectSaving } from '../../state/savings/savings.actions';
import { selectAllSavings } from '../../state/savings/savings.selectors';
import { selectAllMembers } from '../../state/members/members.selectors';
import { selectAllAccounts, selectAllSavingTypes } from '../../state/lookups/lookups.selectors';
import { combineLatest, map } from 'rxjs';
import { SavingFormComponent } from '../saving-form/saving-form.component';
import { GenericDetailDialogComponent, DetailDialogData } from '../generic-detail-dialog/generic-detail-dialog.component';

interface EnrichedSaving extends Saving {
  /** Human-readable member id (e.g. M-001) from Member.idNumbe */
  memberNumber: string;
  memberName: string;
  savingTypeName: string;
  accountDisplayName: string;
}

@Component({
  selector: 'app-saving-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatDialogModule,
    MatTooltipModule
  ],
  templateUrl: './saving-list.component.html',
  styleUrls: ['./saving-list.component.css']
})
export class SavingListComponent implements OnInit, AfterViewInit {
  savings$!: Observable<EnrichedSaving[]>;
  displayedColumns: string[] = ['memberId', 'memberName', 'savingType', 'accountName', 'amount', 'ftp', 'date', 'status', 'actions'];
  dataSource = new MatTableDataSource<EnrichedSaving>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private store: Store<AppState>, private dialog: MatDialog) { }

  ngOnInit(): void {
    const rawSavings$ = this.store.select(selectAllSavings);
    const members$ = this.store.select(selectAllMembers);
    const savingTypes$ = this.store.select(selectAllSavingTypes);
    const accounts$ = this.store.select(selectAllAccounts);

    this.savings$ = combineLatest([rawSavings$, members$, savingTypes$, accounts$]).pipe(
      map(([savings, members, types, accounts]) => {
        return (savings || []).map(saving => {
          const member = members?.find(m => m.id === saving.memberId);
          const type = types?.find(t => t.id === saving.savingType);
          const account = accounts?.find(a => a.id === saving.accountId);
          const accountDisplayName = account
            ? `${account.name}${account.accountNumber ? ' · ' + account.accountNumber : ''}`
            : 'Unknown account';
          return {
            ...saving,
            memberNumber: member?.idNumbe || member?.memberid || '—',
            memberName: member ? member.fullName : 'Unknown Member',
            savingTypeName: type ? type.name : 'Unknown Type',
            accountDisplayName
          };
        });
      })
    );

    this.savings$.subscribe(savings => {
      this.dataSource.data = savings;
      this.dataSource.paginator = this.paginator;
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  getTypeBadgeStyle(typeId: string): Record<string, string> {
    return { background: '#dbeafe', color: '#1d4ed8' };
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

  onApprove(row: EnrichedSaving) {
    if (row.id && confirm(`Approve this saving for ${row.memberName} and post to ledger?`)) {
      this.store.dispatch(approveSaving({ id: row.id }));
    }
  }

  onReject(row: EnrichedSaving) {
    if (row.id && confirm(`Reject this saving for ${row.memberName}?`)) {
      this.store.dispatch(rejectSaving({ id: row.id }));
    }
  }

  onAdd() {
    this.dialog.open(SavingFormComponent, { width: '90vw', maxWidth: '1000px' });
  }

  onView(row: EnrichedSaving) {
    const dialogData: DetailDialogData = {
      title: 'Saving Details',
      subTitle: row.memberName,
      icon: 'savings',
      data: row,
      fields: [
        { key: 'memberNumber', label: 'Member ID', type: 'text' },
        { key: 'memberName', label: 'Member Name', type: 'text' },
        { key: 'savingTypeName', label: 'Saving Type', type: 'text' },
        { key: 'accountDisplayName', label: 'Account', type: 'text' },
        { key: 'savingAmount', label: 'Amount', type: 'currency' },
        { key: 'ftp', label: 'FTP Ref', type: 'text' },
        { key: 'savingDate', label: 'Date', type: 'date' },
        { key: 'status', label: 'Status', type: 'text' },
        { key: 'remark', label: 'Remark', type: 'text' },
        { key: 'createdAt', label: 'Recorded At', type: 'date' },
      ]
    };
    this.dialog.open(GenericDetailDialogComponent, { data: dialogData });
  }

  onEdit(row: EnrichedSaving) {
    const saving: Saving = {
      id: row.id,
      memberId: row.memberId,
      savingAmount: row.savingAmount,
      savingDate: row.savingDate,
      ftp: row.ftp,
      savingType: row.savingType,
      accountId: row.accountId,
      remark: row.remark,
      createdAt: row.createdAt,
      status: row.status,
    };
    this.dialog.open(SavingFormComponent, { width: '90vw', maxWidth: '1000px', data: { saving } });
  }
  onPrint(saving: EnrichedSaving) {
    window.alert(`Printing CRV for ${saving.memberName} - Amount: ${saving.savingAmount}`);
  }

  onDelete(id: string) {
    if (confirm('Are you sure you want to delete this record?')) {
      this.store.dispatch(deleteSaving({ id }));
    }
  }
}
