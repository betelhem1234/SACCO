import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Store } from '@ngrx/store';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { AppState } from '../../../models/state.model';
import { loadWithdrawalReport } from '../../../state/finance/finance.actions';
import {
  selectWithdrawalReport,
  selectWithdrawalReportLoading,
  selectFinancePeriod,
} from '../../../state/finance/finance.selectors';
import { WithdrawalReport, WithdrawalTransactionRow } from '@sacco/shared-models';
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

export interface TrendBar {
  label: string;
  value: number;
  x: number;
  w: number;
  y: number;
  h: number;
  display: string;
}

export interface TypeColX {
  name: string;
  mandatory: boolean;
  bw: number;
  postedX: number;
  postedY: number;
  postedH: number;
  ledgerX: number;
  ledgerY: number;
  ledgerH: number;
  postedDisplay: string;
  ledgerDisplay: string;
}

export interface DonutSlice {
  name: string;
  value: number;
  color: string;
  dash: string;
  rotate: number;
  percent: number;
}

export interface TopRow {
  name: string;
  number: string;
  value: number;
  x: number;
  y: number;
  w: number;
  h: number;
  display: string;
}

@Component({
  selector: 'app-withdrawal-report',
  standalone: true,
  imports: [CommonModule, MatSelectModule, MatButtonToggleModule, MatProgressSpinnerModule, MatTooltipModule, FormsModule],
  templateUrl: './withdrawal-report.component.html',
  styleUrls: ['./withdrawal-report.component.css'],
})
export class WithdrawalReportComponent implements OnInit {
  private store = inject(Store<AppState>);
  private location = inject(Location);

  report$ = this.store.select(selectWithdrawalReport);
  loading$ = this.store.select(selectWithdrawalReportLoading);
  period$ = this.store.select(selectFinancePeriod);

  presetId = 'all';
  readonly presets = PERIOD_PRESETS;
  readonly etb = etb;
  readonly num = num;
  readonly fmtDate = fmtDate;
  readonly periodLabel = periodLabel;
  readonly windowLabel = windowLabel;

  sortAsc = false;
  readonly sortIcon = sortIcon;

  view: 'TABLE' | 'CHART' = 'TABLE';
  readonly viewOptions: { id: 'TABLE' | 'CHART'; label: string; icon: string }[] = [
    { id: 'TABLE', label: 'Table', icon: 'table_rows' },
    { id: 'CHART', label: 'Charts', icon: 'bar_chart' },
  ];
  readonly palette = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#f43f5e', '#84cc16', '#6366f1', '#14b8a6'];

  toggleDateSort(): void {
    this.sortAsc = !this.sortAsc;
  }

  sortedTransactions(report: WithdrawalReport | null): WithdrawalTransactionRow[] {
    if (!report) return [];
    return sortRows(report.transactions, 'date', this.sortAsc);
  }

  ngOnInit(): void {
    this.reload();
  }

  onPeriodChange(id: string): void {
    this.presetId = id;
    this.reload();
  }

  setView(id: string): void {
    this.view = id as 'TABLE' | 'CHART';
  }

  reload(): void {
    const w: PeriodWindow = periodWindow(this.presetId);
    this.store.dispatch(loadWithdrawalReport(w));
  }

  back(): void {
    this.location.back();
  }

  print(): void {
    window.print();
  }

  hasTransactions(report: WithdrawalReport | null): boolean {
    return !!report && (report.transactionCount > 0 || report.pendingTotal > 0 || report.byMember.length > 0);
  }

  typeLabel(mandatory: boolean): string {
    return mandatory ? 'Mandatory' : 'Voluntary';
  }

  chartsEmpty(report: WithdrawalReport | null): boolean {
    return !report || (report.grandTotal + report.pendingTotal) <= 0;
  }

  monthlyTrend(report: WithdrawalReport | null): TrendBar[] {
    if (!report || report.transactions.length === 0) return [];
    const W = 640, H = 260, padL = 10, padR = 10, padT = 26, padB = 42;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const map = new Map<string, number>();
    for (const tx of report.transactions) {
      if ((tx.status !== 'POSTED' && tx.status !== 'DISBURSED') || tx.date == null) continue;
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

  typeColumns(report: WithdrawalReport | null): TypeColX[] {
    if (!report || report.types.length === 0) return [];
    const W = 640, H = 260, padL = 10, padR = 10, padT = 26, padB = 42;
    const types = report.types.filter((t) => t.postedAmount > 0 || t.ledgerDebits > 0);
    if (types.length === 0) return [];
    const maxVal = Math.max(...types.map((t) => Math.max(t.postedAmount, t.ledgerDebits)), 1);
    const innerW = W - padL - padR;
    const gw = innerW / types.length;
    const bw = Math.min(gw * 0.26, 22);
    const chartH = H - padT - padB;
    return types.map((t, i) => {
      const gx = padL + i * gw;
      const postedH = (t.postedAmount / maxVal) * chartH;
      const ledgerH = (t.ledgerDebits / maxVal) * chartH;
      return {
        name: t.name.length > 14 ? t.name.slice(0, 13) + '…' : t.name,
        mandatory: t.mandatory,
        bw,
        postedX: gx + gw * 0.32 - bw / 2,
        postedY: H - padB - postedH,
        postedH,
        ledgerX: gx + gw * 0.68 - bw / 2,
        ledgerY: H - padB - ledgerH,
        ledgerH,
        postedDisplay: num(t.postedAmount, 0),
        ledgerDisplay: num(t.ledgerDebits, 0),
      };
    });
  }

  donutSlices(report: WithdrawalReport | null): DonutSlice[] {
    if (!report || report.types.length === 0) return [];
    const r = 70, cw = 2 * Math.PI * r;
    const items = report.types.filter((t) => t.postedAmount > 0);
    const total = items.reduce((s, t) => s + t.postedAmount, 0);
    if (total <= 0) return [];
    let acc = 0;
    return items.map((t, i) => {
      const seg = (t.postedAmount / total) * cw;
      const rotate = (acc / total) * 360 - 90;
      acc += t.postedAmount;
      return {
        name: t.name,
        value: t.postedAmount,
        color: this.palette[i % this.palette.length],
        dash: `${seg} ${cw - seg}`,
        rotate,
        percent: (t.postedAmount / total) * 100,
      };
    });
  }

  topWithdrawals(report: WithdrawalReport | null): TopRow[] {
    if (!report || report.byMember.length === 0) return [];
    const byMember = new Map<string, { name: string; number: string; value: number }>();
    for (const r of report.byMember) {
      const e = byMember.get(r.memberName) ?? { name: r.memberName, number: r.memberNumber, value: 0 };
      e.value += r.postedAmount;
      byMember.set(r.memberName, e);
    }
    const rows = [...byMember.values()].sort((a, b) => b.value - a.value).slice(0, 7);
    if (rows.length === 0) return [];
    const maxVal = Math.max(...rows.map((r) => r.value), 1);
    const labelX = 148;
    const H = 24 + rows.length * 30;
    return rows.map((r, i) => ({
      name: r.name.length > 24 ? r.name.slice(0, 23) + '…' : r.name,
      number: r.number,
      value: r.value,
      x: labelX,
      y: 14 + i * 30,
      w: Math.max((r.value / maxVal) * (620 - labelX - 14), 4),
      h: 16,
      display: num(r.value, 0),
    }));
  }

  abs(value: number): number {
    return Math.abs(value || 0);
  }

  statusClass(status: string): string {
    switch (status) {
      case 'POSTED': return 'fin-chip fin-chip-posted';
      case 'DISBURSED': return 'fin-chip fin-chip-posted';
      case 'PENDING': return 'fin-chip fin-chip-pending';
      case 'APPROVED': return 'fin-chip fin-chip-approved';
      case 'REJECTED': return 'fin-chip fin-chip-rejected';
      default: return 'fin-chip';
    }
  }
}