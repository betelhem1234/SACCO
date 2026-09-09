import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Store } from '@ngrx/store';
import { combineLatest, map } from 'rxjs';

import { Transfer, Member, SavingType, ShareTransfer } from '@sacco/shared-models';
import { AppState } from '../../models/state.model';
import { selectAllTransfers } from '../../state/saving-transfer/transfers.selectors';
import { selectAllMembers } from '../../state/members/members.selectors';
import { selectAllSavingTypes } from '../../state/lookups/lookups.selectors';
import { selectAllShareTransfers } from '../../state/share-transfer/share-transfers.selectors';
import { loadTransfers, deleteTransfer } from '../../state/saving-transfer/transfers.actions';
import { loadMembers } from '../../state/members/members.actions';
import { loadShareTransfers, deleteShareTransfer } from '../../state/share-transfer/share-transfers.actions';
import { TransferFormComponent } from '../transfer-form/transfer-form.component';
import { ShareTransferFormComponent } from '../share-transfer-form/share-transfer-form.component';

interface EnrichedSavingTransfer extends Transfer {
  sourceMemberName: string;
  sourceSavingTypeName: string;
  destMemberName: string;
  destSavingTypeName: string;
}

interface EnrichedShareTransfer extends ShareTransfer {
  sourceMemberName: string;
  destMemberName: string;
}

@Component({
  selector: 'app-transfer',
  standalone: true,
  imports: [
    CommonModule, MatButtonModule, MatIconModule, MatTableModule,
    MatPaginatorModule, MatTabsModule, MatDialogModule, MatTooltipModule
  ],
  templateUrl: './transfer.component.html',
  styleUrls: ['./transfer.component.css']
})
export class TransferComponent implements OnInit {
  private dialog = inject(MatDialog);
  private store = inject(Store<AppState>);

  savingColumns: string[] = ['sourceMember', 'sourceType', 'destMember', 'destType', 'amount', 'date', 'actions'];
  savingDataSource = new MatTableDataSource<EnrichedSavingTransfer>();
  @ViewChild('savingPaginator') savingPaginator!: MatPaginator;

  shareColumns: string[] = ['sourceMember', 'destMember', 'units', 'amount', 'date', 'actions'];
  shareDataSource = new MatTableDataSource<EnrichedShareTransfer>();
  @ViewChild('sharePaginator') sharePaginator!: MatPaginator;

  ngOnInit(): void {
    this.store.dispatch(loadTransfers());
    this.store.dispatch(loadShareTransfers());
    this.store.dispatch(loadMembers());

    combineLatest([
      this.store.select(selectAllTransfers),
      this.store.select(selectAllMembers),
      this.store.select(selectAllSavingTypes),
    ]).subscribe(([transfers, members, savingTypes]) => {
      const list = members ?? [];
      const st = savingTypes ?? [];
      this.savingDataSource.data = (transfers ?? []).map(tr => ({
        ...tr,
        sourceMemberName: list.find(m => m.id === tr.sourceMemberId)?.fullName ?? 'Unknown',
        sourceSavingTypeName: st.find(s => s.id === tr.sourceSavingTypeId)?.name ?? 'Unknown',
        destMemberName: list.find(m => m.id === tr.destinationMemberId)?.fullName ?? 'Unknown',
        destSavingTypeName: st.find(s => s.id === tr.destinationSavingTypeId)?.name ?? 'Unknown',
      }));
      if (this.savingPaginator) this.savingDataSource.paginator = this.savingPaginator;
    });

    combineLatest([
      this.store.select(selectAllShareTransfers),
      this.store.select(selectAllMembers),
    ]).subscribe(([shareTransfers, members]) => {
      const list = members ?? [];
      this.shareDataSource.data = (shareTransfers ?? []).map(st => ({
        ...st,
        sourceMemberName: list.find(m => m.id === st.sourceMemberId)?.fullName ?? 'Unknown',
        destMemberName: list.find(m => m.id === st.destinationMemberId)?.fullName ?? 'Unknown',
      }));
      if (this.sharePaginator) this.shareDataSource.paginator = this.sharePaginator;
    });
  }

  onAddSavingTransfer() {
    this.dialog.open(TransferFormComponent, { width: '90vw', maxWidth: '1000px' });
  }

  onAddShareTransfer() {
    this.dialog.open(ShareTransferFormComponent, { width: '90vw', maxWidth: '1000px' });
  }

  deleteSavingTransfer(row: any) {
    if (!confirm('Delete this saving transfer?')) return;
    this.store.dispatch(deleteTransfer({ id: row.id }));
  }

  deleteShareTransfer(row: any) {
    if (!confirm('Delete this share transfer?')) return;
    this.store.dispatch(deleteShareTransfer({ id: row.id }));
  }
}
