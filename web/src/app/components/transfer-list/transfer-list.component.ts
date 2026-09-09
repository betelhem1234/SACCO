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

import { Transfer } from '@sacco/shared-models';
import { AppState } from '../../models/state.model';
import { deleteTransfer } from '../../state/saving-transfer/transfers.actions';
import { selectAllTransfers } from '../../state/saving-transfer/transfers.selectors';
import { selectAllMembers } from '../../state/members/members.selectors';
import { selectAllSavingTypes } from '../../state/lookups/lookups.selectors';
import { TransferFormComponent } from '../transfer-form/transfer-form.component';
import { GenericDetailDialogComponent, DetailDialogData } from '../generic-detail-dialog/generic-detail-dialog.component';

interface EnrichedTransfer extends Transfer {
  sourceMemberName: string;
  sourceSavingTypeName: string;
  destMemberName: string;
  destSavingTypeName: string;
}

@Component({
  selector: 'app-transfer-list',
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
  templateUrl: './transfer-list.component.html',
  styleUrls: ['./transfer-list.component.css']
})
export class TransferListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['sourceMember', 'sourceType', 'destMember', 'destType', 'amount', 'ftp', 'date', 'actions'];
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private store: Store<AppState>, private dialog: MatDialog) { }

  ngOnInit(): void {
    combineLatest([
      this.store.select(selectAllTransfers),
      this.store.select(selectAllMembers),
      this.store.select(selectAllSavingTypes),
    ]).pipe(
      map(([transfers, members, savingTypes]) =>
        (transfers ?? []).map(t => ({
          ...t,
          sourceMemberName: members?.find(m => m.id === t.sourceMemberId)?.fullName ?? 'Unknown',
          sourceSavingTypeName: savingTypes?.find(s => s.id === t.sourceSavingTypeId)?.name ?? 'Unknown',
          destMemberName: members?.find(m => m.id === t.destinationMemberId)?.fullName ?? 'Unknown',
          destSavingTypeName: savingTypes?.find(s => s.id === t.destinationSavingTypeId)?.name ?? 'Unknown',
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
    this.dialog.open(TransferFormComponent, { width: '90vw', maxWidth: '1000px' });
  }

  onView(row: any) {
    const dialogData: DetailDialogData = {
      title: 'Transfer Info',
      subTitle: `${row.sourceMemberName} → ${row.destMemberName}`,
      icon: 'swap_horiz',
      data: row,
      fields: [
        { key: 'sourceMemberName', label: 'Source Member', type: 'text' },
        { key: 'sourceSavingTypeName', label: 'Source Type', type: 'text' },
        { key: 'destMemberName', label: 'Destination Member', type: 'text' },
        { key: 'destSavingTypeName', label: 'Destination Type', type: 'text' },
        { key: 'amount', label: 'Amount', type: 'currency' },
        { key: 'ftp', label: 'FTP Ref', type: 'text' },
        { key: 'date', label: 'Date', type: 'date' },
        { key: 'remark', label: 'Remark', type: 'text' },
      ]
    };
    this.dialog.open(GenericDetailDialogComponent, { data: dialogData });
  }

  onEdit(row: any) {
    this.dialog.open(TransferFormComponent, { width: '90vw', maxWidth: '1000px', data: { transfer: row as Transfer } });
  }

  onDelete(row: any) {
    if (!row.id) return;
    if (confirm(`Delete transfer of ${row.amount} ETB from "${row.sourceMemberName}" to "${row.destMemberName}"?`)) {
      this.store.dispatch(deleteTransfer({ id: row.id }));
    }
  }
}
