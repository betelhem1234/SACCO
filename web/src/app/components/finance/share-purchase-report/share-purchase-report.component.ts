import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Store } from '@ngrx/store';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormsModule } from '@angular/forms';
import { AppState } from '../../../models/state.model';
import { loadSharePurchaseReport } from '../../../state/finance/finance.actions';
import {
  selectSharePurchaseReport,
  selectSharePurchaseReportLoading,
  selectFinancePeriod,
} from '../../../state/finance/finance.selectors';
import { SharePurchaseReport, SharePurchaseTransactionRow } from '@sacco/shared-models';
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

export interface MonthTrend {
  label: string;
  amount: number;
  units: number;
  x: number;
  w: number;
  y: number;
  h: number;
  display: string;
}

export interface DonutSlice {
  name: string;
  value: number;
  color: string;
  dash: string;
  rotate: number;
  percent: number;
}

export interface CapitalPosition {
  authorized: number;
  subscribed: number;
  purchased: number;
  outstanding: number;
  available: number;
  purchasedPct: number;
  outstandingPct: number;
  availablePct: number;
  paidPct: number;
}

export interface CapitalSeg {
  name: string;
  value: number;
  pct: number;
  color: string;
  x: number;
  w: number;
  display: string;
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
  selector: 'app-share-purchase-report',
  standalone: true,
  imports: [CommonModule, MatSelectModule, MatProgressSpinnerModule, MatTooltipModule, MatButtonToggleModule, FormsModule],
  templateUrl: './share-purchase-report.component.html',
  styleUrls: ['./share-purchase-report.component.css'],
})
export class SharePurchaseReportComponent implements OnInit {
  private store = inject(Store<AppState>);
  private location = inject(Location);

  report$ = this.store.select(selectSharePurchaseReport);
  loading$ = this.store.select(selectSharePurchaseReportLoading);
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

  toggleDateSort(): void {
    this.sortAsc = !this.sortAsc;
  }

  sortedTransactions(report: SharePurchaseReport | null): SharePurchaseTransactionRow[] {
    if (!report) return [];
    return sortRows(report.transactions, 'date', this.sortAsc);
  }

  ngOnInit(): void {
    this.reload();
  }

  setView(id: string): void {
    this.view = id as 'TABLE' | 'CHART';
  }

  onPeriodChange(id: string): void {
    this.presetId = id;
    this.reload();
  }

  reload(): void {
    const w: PeriodWindow = periodWindow(this.presetId);
    this.store.dispatch(loadSharePurchaseReport(w));
  }

  back(): void {
    this.location.back();
  }

  print(): void {
    window.print();
  }

  hasData(report: SharePurchaseReport | null): boolean {
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

  chartsEmpty(report: SharePurchaseReport | null): boolean {
    return !report || (report.grandTotal <= 0 && report.subscribedAmountTotal <= 0);
  }

  purchaseTrend(report: SharePurchaseReport | null): MonthTrend[] {
    if (!report || report.transactions.length === 0) return [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const map = new Map<string, { amount: number; units: number }>();
    for (const tx of report.transactions) {
      if (tx.date == null) continue;
      const d = new Date(tx.date);
      if (isNaN(d.getTime())) continue;
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      const e = map.get(key) ?? { amount: 0, units: 0 };
      e.amount += tx.shareAmount ?? 0;
      e.units += tx.units ?? 0;
      map.set(key, e);
    }
    const pts = [...map.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([k, v]) => {
        const [y, m] = k.split('-').map(Number);
        return { label: `${monthNames[m - 1]} ${y}`, amount: v.amount, units: v.units };
      });
    if (pts.length === 0) return [];
    const W = 640, H = 260, padL = 10, padR = 10, padT = 26, padB = 42;
    const maxVal = Math.max(...pts.map((p) => p.amount), 1);
    const slot = (W - padL - padR) / pts.length;
    const bw = Math.min(slot * 0.55, 46);
    return pts.map((p, i) => {
      const h = Math.max((p.amount / maxVal) * (H - padT - padB), 2);
      const x = padL + i * slot + (slot - bw) / 2;
      return { label: p.label, amount: p.amount, units: p.units, x, w: bw, y: H - padB - h, h, display: num(p.amount, 0) };
    });
  }

  issueSlices(report: SharePurchaseReport | null): DonutSlice[] {
    if (!report) return [];
    const subscribed = report.subscribedCapitalTotal || 0;
    const purchased = report.purchasedCapitalTotal || 0;
    const outstanding = Math.max(report.outstandingCapitalTotal || 0, 0);
    if (subscribed <= 0) return [];
    const items = [
      { name: 'Purchased', value: purchased, color: '#10b981' },
      { name: 'Outstanding', value: outstanding, color: '#f59e0b' },
    ].filter((x) => x.value > 0);
    const r = 70, cw = 2 * Math.PI * r;
    let acc = 0;
    return items.map((it) => {
      const seg = (it.value / subscribed) * cw;
      const rotate = (acc / subscribed) * 360 - 90;
      acc += it.value;
      return { name: it.name, value: it.value, color: it.color, dash: `${seg} ${cw - seg}`, rotate, percent: (it.value / subscribed) * 100 };
    });
  }

  capitalPosition(report: SharePurchaseReport | null): CapitalPosition {
    const z: CapitalPosition = { authorized: 0, subscribed: 0, purchased: 0, outstanding: 0, available: 0, purchasedPct: 0, outstandingPct: 0, availablePct: 0, paidPct: 0 };
    if (!report) return z;
    const authorized = report.authorizedCapital || 0;
    const subscribed = report.subscribedCapitalTotal || 0;
    const purchased = report.purchasedCapitalTotal || 0;
    const outstanding = Math.max(report.outstandingCapitalTotal || 0, 0);
    const available = Math.max(authorized - subscribed, 0);
    const denom = Math.max(authorized, subscribed, 1);
    return {
      authorized,
      subscribed,
      purchased,
      outstanding,
      available,
      purchasedPct: Math.min((purchased / denom) * 100, 100),
      outstandingPct: Math.min((outstanding / denom) * 100, 100),
      availablePct: Math.max((available / denom) * 100, 0),
      paidPct: subscribed > 0 ? (purchased / subscribed) * 100 : 0,
    };
  }

  capitalSegs(report: SharePurchaseReport | null): CapitalSeg[] {
    const pos = this.capitalPosition(report);
    if (pos.authorized <= 0) return [];
    const W = 620;
    const denom = Math.max(pos.authorized, pos.subscribed);
    const segs = [
      { name: 'Purchased', value: pos.purchased, color: '#10b981' },
      { name: 'Outstanding', value: pos.outstanding, color: '#f59e0b' },
      { name: 'Available', value: pos.available, color: '#cbd5e1' },
    ];
    let x = 0;
    return segs.map((s) => {
      const w = s.value > 0 ? Math.max((s.value / denom) * (W - 6), 2) : 0;
      const seg = { name: s.name, value: s.value, pct: (s.value / denom) * 100, color: s.color, x, w, display: num(s.value, 0) };
      x += w;
      return seg;
    });
  }

  topBuyers(report: SharePurchaseReport | null): TopRow[] {
    if (!report || report.byMember.length === 0) return [];
    const rows = [...report.byMember].sort((a, b) => b.purchaseAmount - a.purchaseAmount).slice(0, 7);
    if (rows.length === 0) return [];
    const maxVal = Math.max(...rows.map((r) => r.purchaseAmount), 1);
    const labelX = 148;
    const H = 24 + rows.length * 30;
    return rows.map((r, i) => ({
      name: r.memberName.length > 24 ? r.memberName.slice(0, 23) + '…' : r.memberName,
      number: r.memberNumber,
      value: r.purchaseAmount,
      x: labelX,
      y: 14 + i * 30,
      w: Math.max((r.purchaseAmount / maxVal) * (620 - labelX - 14), 4),
      h: 16,
      display: num(r.purchaseAmount, 0),
    }));
  }
}