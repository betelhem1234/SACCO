import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Store } from '@ngrx/store';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { AppState } from '../../../models/state.model';
import { loadTransferReport } from '../../../state/finance/finance.actions';
import {
  selectTransferReport,
  selectTransferReportLoading,
  selectFinancePeriod,
} from '../../../state/finance/finance.selectors';
import { TransferReport, TransferTransactionRow, TransferMemberRow } from '@sacco/shared-models';
import {
  etb,
  num,
  fmtDate,
  PERIOD_PRESETS,
  periodWindow,
  PeriodWindow,
  periodLabel,
  windowLabel,
  sortIcon,
  sortRows,
} from '../../../utils/finance-format';

type TransferTypeFilter = 'ALL' | 'SAVING' | 'SHARE';

export interface TransferFilteredSummary {
  transactionCount: number;
  savingCount: number;
  shareCount: number;
  grandTotal: number;
  shareUnitsTotal: number;
  sourceLedgerTotal: number;
  destinationLedgerTotal: number;
  difference: number;
}

export interface TransferTrendBar {
  label: string;
  value: number;
  x: number;
  w: number;
  y: number;
  h: number;
  display: string;
}

export interface TransferDonutSlice {
  name: string;
  value: number;
  color: string;
  dash: string;
  rotate: number;
  percent: number;
}

export interface TransferTopRow {
  name: string;
  number: string;
  value: number;
  net: number;
  x: number;
  y: number;
  w: number;
  h: number;
  display: string;
}

@Component({
  selector: 'app-transfer-report',
  standalone: true,
  imports: [CommonModule, MatSelectModule, MatButtonToggleModule, MatProgressSpinnerModule, MatTooltipModule, FormsModule],
  templateUrl: './transfer-report.component.html',
  styleUrls: ['./transfer-report.component.css'],
})
export class TransferReportComponent implements OnInit {
  private store = inject(Store<AppState>);
  private location = inject(Location);

  report$ = this.store.select(selectTransferReport);
  loading$ = this.store.select(selectTransferReportLoading);
  period$ = this.store.select(selectFinancePeriod);

  presetId = 'all';
  typeFilter: TransferTypeFilter = 'ALL';
  readonly presets = PERIOD_PRESETS;
  readonly typeFilters: { id: TransferTypeFilter; label: string }[] = [
    { id: 'ALL', label: 'All transfers' },
    { id: 'SAVING', label: 'Saving transfers' },
    { id: 'SHARE', label: 'Share transfers' },
  ];
  readonly etb = etb;
  readonly num = num;
  readonly fmtDate = fmtDate;
  readonly periodLabel = periodLabel;
  readonly windowLabel = windowLabel;

  sortAsc = false;
  readonly sortIcon = sortIcon;

  toggleDateSort(): void {
    this.sortAsc = !this.sortAsc;
  }

  sortedTxs(report: TransferReport): TransferTransactionRow[] {
    const filtered = this.filteredTxs(report);
    return sortRows(filtered, 'date', this.sortAsc);
  }

  view: 'TABLE' | 'CHART' = 'TABLE';
  readonly viewOptions: { id: 'TABLE' | 'CHART'; label: string; icon: string }[] = [
    { id: 'TABLE', label: 'Table', icon: 'table_rows' },
    { id: 'CHART', label: 'Charts', icon: 'bar_chart' },
  ];
  readonly palette = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#f43f5e', '#84cc16', '#6366f1', '#14b8a6'];

  ngOnInit(): void {
    this.reload();
  }

  onPeriodChange(id: string): void {
    this.presetId = id;
    this.reload();
  }

  setTypeFilter(id: TransferTypeFilter): void {
    this.typeFilter = id;
  }

  setView(id: string): void {
    this.view = id as 'TABLE' | 'CHART';
  }

  reload(): void {
    const w: PeriodWindow = periodWindow(this.presetId);
    this.store.dispatch(loadTransferReport(w));
  }

  back(): void {
    this.location.back();
  }

  print(): void {
    window.print();
  }

  hasData(report: TransferReport | null): boolean {
    return !!report && (report.transactionCount > 0 || report.byMember.length > 0);
  }

  abs(value: number): number {
    return Math.abs(value || 0);
  }

  reconciledClass(reconciled: boolean): string {
    return reconciled ? 'fin-chip fin-chip-posted' : 'fin-chip fin-chip-rejected';
  }

  reconciledLabel(reconciled: boolean): string {
    return reconciled ? 'Reconciled' : 'Mismatch';
  }

  typeLabel(type?: string): string {
    return type === 'SHARE' ? 'Share' : 'Saving';
  }

  typeClass(type?: string): string {
    return type === 'SHARE' ? 'fin-chip fin-chip-info' : 'fin-chip fin-chip-posted';
  }

  filteredTxs(report: TransferReport): TransferTransactionRow[] {
    if (this.typeFilter === 'ALL') {
      return report.transactions;
    }
    return report.transactions.filter((t) => t.type === this.typeFilter);
  }

  filteredMembers(report: TransferReport): TransferMemberRow[] {
    const rows: TransferMemberRow[] = [];
    const byKey = new Map<string, TransferMemberRow>();
    for (const tx of this.filteredTxs(report)) {
      const sides = [
        { id: tx.sourceMemberId, name: tx.sourceMemberName, number: tx.sourceMemberNumber, isSource: true },
        { id: tx.destinationMemberId, name: tx.destinationMemberName, number: tx.destinationMemberNumber, isSource: false },
      ];
      for (const s of sides) {
        const key = s.id ?? s.name;
        let row = byKey.get(key);
        if (!row) {
          row = { memberId: s.id, memberName: s.name, memberNumber: s.number, sourceCount: 0, sourceAmount: 0, destinationCount: 0, destinationAmount: 0, netAmount: 0 };
          byKey.set(key, row);
        }
        if (s.isSource) {
          row.sourceCount++;
          row.sourceAmount = this.round2(row.sourceAmount + tx.amount);
        } else {
          row.destinationCount++;
          row.destinationAmount = this.round2(row.destinationAmount + tx.amount);
        }
      }
    }
    Array.from(byKey.values()).forEach((r) => {
      r.netAmount = this.round2(r.destinationAmount - r.sourceAmount);
      rows.push(r);
    });
    rows.sort((a, b) => (a.memberName || '').localeCompare(b.memberName || ''));
    return rows;
  }

  filteredSummary(report: TransferReport): TransferFilteredSummary {
    let savingCount = 0;
    let shareCount = 0;
    let grandTotal = 0;
    let shareUnitsTotal = 0;
    let sourceLedgerTotal = 0;
    let destinationLedgerTotal = 0;
    for (const tx of this.filteredTxs(report)) {
      grandTotal = this.round2(grandTotal + tx.amount);
      sourceLedgerTotal = this.round2(sourceLedgerTotal + (tx.sourceLedger ?? tx.amount));
      destinationLedgerTotal = this.round2(destinationLedgerTotal + (tx.destinationLedger ?? tx.amount));
      if (tx.type === 'SHARE') {
        shareCount++;
        shareUnitsTotal = this.round2(shareUnitsTotal + (tx.units || 0));
      } else {
        savingCount++;
      }
    }
    return {
      transactionCount: this.filteredTxs(report).length,
      savingCount,
      shareCount,
      grandTotal,
      shareUnitsTotal,
      sourceLedgerTotal,
      destinationLedgerTotal,
      difference: this.round2(grandTotal - sourceLedgerTotal),
    };
  }

  chartsEmpty(report: TransferReport | null): boolean {
    return !report || report.transactions.length === 0;
  }

  monthlyTrend(report: TransferReport | null): TransferTrendBar[] {
    const txs = report ? this.filteredTxs(report) : [];
    if (txs.length === 0) return [];
    const W = 640, H = 260, padL = 10, padR = 10, padT = 26, padB = 42;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const map = new Map<string, number>();
    for (const tx of txs) {
      if (tx.date == null) continue;
      const d = new Date(tx.date);
      if (isNaN(d.getTime())) continue;
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      map.set(key, (map.get(key) || 0) + tx.amount);
    }
    const points = [...map.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([k, v]) => {
        const [y, m] = k.split('-').map(Number);
        return { label: `${months[m - 1]} ${y}`, value: v };
      });
    const maxVal = Math.max(...points.map((p) => p.value), 1);
    const slot = (W - padL - padR) / points.length;
    const bw = Math.min(slot * 0.55, 46);
    return points.map((p, i) => {
      const h = Math.max((p.value / maxVal) * (H - padT - padB), 2);
      const x = padL + i * slot + (slot - bw) / 2;
      return { label: p.label, value: p.value, x, w: bw, y: H - padB - h, h, display: num(p.value, 0) };
    });
  }

  splitSlices(report: TransferReport | null): TransferDonutSlice[] {
    const txs = report ? this.filteredTxs(report) : [];
    if (txs.length === 0) return [];
    const saving = txs.filter((t) => t.type !== 'SHARE').reduce((s, t) => s + t.amount, 0);
    const shares = txs.filter((t) => t.type === 'SHARE').reduce((s, t) => s + t.amount, 0);
    const r = 70, cw = 2 * Math.PI * r;
    const items = [
      { name: 'Saving transfers', value: saving, color: '#f59e0b' },
      { name: 'Share transfers', value: shares, color: '#3b82f6' },
    ].filter((i) => i.value > 0);
    const total = items.reduce((s, i) => s + i.value, 0);
    if (total <= 0) return [];
    let acc = 0;
    return items.map((i) => {
      const seg = (i.value / total) * cw;
      const rotate = (acc / total) * 360 - 90;
      acc += i.value;
      return { name: i.name, value: i.value, color: i.color, dash: `${seg} ${cw - seg}`, rotate, percent: (i.value / total) * 100 };
    });
  }

  topTransfer(report: TransferReport | null): TransferTopRow[] {
    if (!report || report.transactions.length === 0) return [];
    const rows = this.filteredMembers(report)
      .map((r) => ({ name: r.memberName, number: r.memberNumber, gross: r.sourceAmount + r.destinationAmount, net: r.netAmount }))
      .filter((r) => r.gross > 0)
      .sort((a, b) => b.gross - a.gross)
      .slice(0, 7);
    if (rows.length === 0) return [];
    const maxVal = Math.max(...rows.map((r) => r.gross), 1);
    const labelX = 148;
    const H = 24 + rows.length * 30;
    return rows.map((r, i) => ({
      name: r.name.length > 24 ? r.name.slice(0, 23) + '…' : r.name,
      number: r.number,
      value: r.gross,
      net: r.net,
      x: labelX,
      y: 14 + i * 30,
      w: Math.max((r.gross / maxVal) * (620 - labelX - 14), 4),
      h: 16,
      display: num(r.gross, 0),
    }));
  }

  private round2(value: number): number {
    return Math.round(value * 100) / 100;
  }
}