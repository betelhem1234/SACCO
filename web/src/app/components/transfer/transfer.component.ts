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
import { selectAllSavingTypes, selectAllAccounts } from '../../state/lookups/lookups.selectors';
import { selectAllShareTransfers } from '../../state/share-transfer/share-transfers.selectors';
import { loadTransfers, deleteTransfer, approveTransfer, rejectTransfer, executeTransfer, payTransferFee } from '../../state/saving-transfer/transfers.actions';
import { loadMembers } from '../../state/members/members.actions';
import { loadShareTransfers, deleteShareTransfer } from '../../state/share-transfer/share-transfers.actions';
import { TransferFormComponent } from '../transfer-form/transfer-form.component';
import { ShareTransferFormComponent } from '../share-transfer-form/share-transfer-form.component';
import { GenericDetailDialogComponent, DetailDialogData } from '../generic-detail-dialog/generic-detail-dialog.component';
import { SettingsService } from '../../services/settings.service';

interface EnrichedSavingTransfer extends Transfer {
  sourceMemberName: string;
  sourceSavingTypeName: string;
  destMemberName: string;
  destSavingTypeName: string;
  bankName: string;
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
  private settingsService = inject(SettingsService);

  savingColumns: string[] = ['sourceMember', 'sourceType', 'destMember', 'destType', 'amount', 'fee', 'date', 'status', 'actions'];
  savingDataSource = new MatTableDataSource<EnrichedSavingTransfer>();
  @ViewChild('savingPaginator') savingPaginator!: MatPaginator;

  shareColumns: string[] = ['sourceMember', 'destMember', 'units', 'amount', 'date', 'actions'];
  shareDataSource = new MatTableDataSource<EnrichedShareTransfer>();
  @ViewChild('sharePaginator') sharePaginator!: MatPaginator;

  ngOnInit(): void {
    this.store.dispatch(loadTransfers());
    this.store.dispatch(loadShareTransfers());
    this.store.dispatch(loadMembers());
    this.settingsService.load();

    combineLatest([
      this.store.select(selectAllTransfers),
      this.store.select(selectAllMembers),
      this.store.select(selectAllSavingTypes),
      this.store.select(selectAllAccounts),
    ]).subscribe(([transfers, members, savingTypes, accounts]) => {
      const list = members ?? [];
      const st = savingTypes ?? [];
      const acc = accounts ?? [];
      this.savingDataSource.data = (transfers ?? []).map(tr => ({
        ...tr,
        sourceMemberName: list.find(m => m.id === tr.sourceMemberId)?.fullName ?? 'Unknown',
        sourceSavingTypeName: st.find(s => s.id === tr.sourceSavingTypeId)?.name ?? 'Unknown',
        destMemberName: list.find(m => m.id === tr.destinationMemberId)?.fullName ?? 'Unknown',
        destSavingTypeName: st.find(s => s.id === tr.destinationSavingTypeId)?.name ?? 'Unknown',
        bankName: tr.bankId ? acc.find(a => a.id === tr.bankId)?.name ?? '' : '',
        status: tr.status || 'POSTED',
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

  // ─── Settings-driven workflow ────────────────────────────────────────────

  get requiresApproval(): boolean {
    return this.settingsService.get('transfer_requires_approval') === 'true';
  }

  get requiresServiceFee(): boolean {
    return this.settingsService.get('transfer_requires_service_fee') === 'true';
  }

  get feeFirst(): boolean {
    return this.settingsService.get('transfer_fee_payment_stage') === 'FEE_FIRST';
  }

  feePayableFor(row: any): boolean {
    return this.requiresServiceFee
      && (Number(this.settingsService.get('transfer_service_fee_flat') || 0) > 0
        || Number(this.settingsService.get('transfer_service_fee_percentage') || 0) > 0)
      && !!this.settingsService.get('transfer_service_fee_account_id')
      && (row?.serviceFee ?? 0) > 0;
  }

  // ─── Actions ─────────────────────────────────────────────────────────────

  onAddSavingTransfer() {
    this.dialog.open(TransferFormComponent, { width: '90vw', maxWidth: '1000px' });
  }

  onAddShareTransfer() {
    this.dialog.open(ShareTransferFormComponent, { width: '90vw', maxWidth: '1000px' });
  }

  onView(row: any) {
    const data: DetailDialogData = {
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
        { key: 'serviceFee', label: 'Service Fee', type: 'currency' },
        { key: 'feeSource', label: 'Fee Paid From', type: 'text' },
        { key: 'bankName', label: 'Fee Bank Account', type: 'text' },
        { key: 'ftp', label: 'FTP Ref', type: 'text' },
        { key: 'date', label: 'Date', type: 'date' },
        { key: 'status', label: 'Status', type: 'text' },
        { key: 'remark', label: 'Remark', type: 'text' },
        { key: 'feePaidAt', label: 'Fee Paid At', type: 'date' },
        { key: 'feeReference', label: 'Fee Reference', type: 'text' },
        { key: 'executedAt', label: 'Executed At', type: 'date' },
      ]
    };
    this.dialog.open(GenericDetailDialogComponent, { data });
  }

  onEdit(row: any) {
    this.dialog.open(TransferFormComponent, { width: '90vw', maxWidth: '1000px', data: { transfer: row as Transfer } });
  }

  deleteSavingTransfer(row: any) {
    if (this.savingLocked(row)) {
      window.alert('Posted or approved transfers cannot be deleted.');
      return;
    }
    if (!confirm(`Delete this saving transfer of ${row.amount} ETB from "${row.sourceMemberName}" to "${row.destMemberName}"?`)) return;
    this.store.dispatch(deleteTransfer({ id: row.id }));
  }

  onApproveSavingTransfer(row: any) {
    if (this.feeFirst && this.feePayableFor(row) && row.status === 'PENDING' && !row.feePaidAt) {
      window.alert('The service fee must be paid before the transfer can be approved.');
      return;
    }
    if (!confirm(`Approve this saving transfer of ${row.amount} ETB from "${row.sourceMemberName}" to "${row.destMemberName}"?`)) return;
    this.store.dispatch(approveTransfer({ id: row.id }));
  }

  onPayFee(row: any) {
    if (!confirm(`Record the service fee of ${(row.serviceFee ?? 0).toFixed(2)} ETB for this transfer from "${row.sourceMemberName}"?`)) return;
    const reference = prompt('Fee reference (optional):')?.trim() || undefined;
    this.store.dispatch(payTransferFee({ id: row.id, feeReference: reference }));
  }

  onExecuteSavingTransfer(row: any) {
    if (!confirm(`Execute this saving transfer of ${row.amount} ETB from "${row.sourceMemberName}" to "${row.destMemberName}"? This posts it to the ledger.`)) return;
    this.store.dispatch(executeTransfer({ id: row.id }));
  }

  onRejectSavingTransfer(row: any) {
    if (!confirm(`Reject this saving transfer of ${row.amount} ETB?`)) return;
    this.store.dispatch(rejectTransfer({ id: row.id }));
  }

  deleteShareTransfer(row: any) {
    if (!confirm('Delete this share transfer?')) return;
    this.store.dispatch(deleteShareTransfer({ id: row.id }));
  }

  // ─── State helpers ───────────────────────────────────────────────────────

  savingLocked(row: any): boolean {
    return ['POSTED', 'APPROVED'].includes(row.status);
  }

  canPayFee(row: any): boolean {
    return row.status === 'PENDING' && this.feeFirst && this.feePayableFor(row);
  }

  canApprove(row: any): boolean {
    return this.requiresApproval && (row.status === 'PENDING' || row.status === 'FEE_PAID');
  }

  canExecute(row: any): boolean {
    return row.status === 'APPROVED' || (row.status === 'FEE_PAID' && !this.requiresApproval);
  }

  canReject(row: any): boolean {
    return row.status === 'PENDING' || row.status === 'FEE_PAID';
  }

  getStatusBadgeStyle(status?: string): Record<string, string> {
    switch (status ?? 'POSTED') {
      case 'PENDING':
        return { background: '#fef3c7', color: '#b45309' };
      case 'FEE_PAID':
        return { background: '#ecfeff', color: '#0e7490' };
      case 'APPROVED':
        return { background: '#f5f3ff', color: '#6d28d9' };
      case 'REJECTED':
        return { background: '#fee2e2', color: '#b91c1c' };
      default:
        return { background: '#d1fae5', color: '#047857' };
    }
  }

  feeSourceLabel(source?: string): string {
    switch (source) {
      case 'SAVING': return 'From savings';
      case 'BANK': return 'From bank';
      default: return '—';
    }
  }
}