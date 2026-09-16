import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Store } from '@ngrx/store';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormsModule } from '@angular/forms';
import { AppState } from '../../../models/state.model';
import { loadMandatoryTrackerReport } from '../../../state/finance/finance.actions';
import {
  selectMandatoryTrackerReport,
  selectMandatoryTrackerReportLoading,
} from '../../../state/finance/finance.selectors';
import { MandatoryTrackerReport, TrackerMemberRow, TrackerMonthCell } from '@sacco/shared-models';
import { etb, num } from '../../../utils/finance-format';

export interface MonthBar {
  label: string;
  bw: number;
  requiredX: number;
  requiredY: number;
  requiredH: number;
  paidX: number;
  paidY: number;
  paidH: number;
  required: number;
  paid: number;
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
  selector: 'app-mandatory-tracker-report',
  standalone: true,
  imports: [CommonModule, MatSelectModule, MatProgressSpinnerModule, MatTooltipModule, MatButtonToggleModule, FormsModule],
  templateUrl: './mandatory-tracker-report.component.html',
  styleUrls: ['./mandatory-tracker-report.component.css'],
})
export class MandatoryTrackerReportComponent implements OnInit {
  private store = inject(Store<AppState>);
  private location = inject(Location);

  report$ = this.store.select(selectMandatoryTrackerReport);
  loading$ = this.store.select(selectMandatoryTrackerReportLoading);

  year = new Date().getFullYear();
  years: number[] = [];
  months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  readonly etb = etb;
  readonly num = num;

  view: 'TABLE' | 'CHART' = 'TABLE';
  readonly viewOptions: { id: 'TABLE' | 'CHART'; label: string; icon: string }[] = [
    { id: 'TABLE', label: 'Table', icon: 'table_rows' },
    { id: 'CHART', label: 'Charts', icon: 'bar_chart' },
  ];

  ngOnInit(): void {
    const current = new Date().getFullYear();
    for (let y = current; y >= 2019; y--) {
      this.years.push(y);
    }
    this.reload();
  }

  setView(id: string): void {
    this.view = id as 'TABLE' | 'CHART';
  }

  onYearChange(year: number): void {
    this.year = year;
    this.reload();
  }

  reload(): void {
    this.store.dispatch(loadMandatoryTrackerReport({ params: { year: this.year } }));
  }

  back(): void {
    this.location.back();
  }

  print(): void {
    window.print();
  }

  monthCell(row: TrackerMemberRow, month: number): TrackerMonthCell | null {
    return row.months.find((c) => c.month === month) ?? null;
  }

  cellText(cell: TrackerMonthCell | null): string {
    if (!cell) return '—';
    return `${num(cell.paid)} / ${num(cell.required)}`;
  }

  cellClass(cell: TrackerMonthCell | null): string {
    if (!cell) return 'tracker-cell-empty';
    switch (cell.status) {
      case 'PAID': return 'tracker-cell-paid';
      case 'PARTIAL': return 'tracker-cell-partial';
      case 'UNPAID': return 'tracker-cell-unpaid';
      default: return 'tracker-cell-empty';
    }
  }

  cellTitle(cell: TrackerMonthCell | null): string {
    if (!cell) return 'No obligation';
    const label = cell.status === 'PAID' ? 'Fully paid' : cell.status === 'PARTIAL' ? 'Partial' : 'In arrears';
    return `${label} · Paid ${etb(cell.paid)} of ${etb(cell.required)} requested`;
  }

  summaryCount(report: MandatoryTrackerReport | null): { paid: number; partial: number; unpaid: number } {
    if (!report) return { paid: 0, partial: 0, unpaid: 0 };
    const paid = report.members.filter((m) => m.status === 'PAID').length;
    const partial = report.members.filter((m) => m.status === 'PARTIAL').length;
    const unpaid = report.members.filter((m) => m.status === 'UNPAID').length;
    return { paid, partial, unpaid };
  }

  collectionRate(report: MandatoryTrackerReport | null): number {
    if (!report || report.totalRequired <= 0) return 0;
    return (report.totalPaid / report.totalRequired) * 100;
  }

  sumMonth(report: MandatoryTrackerReport | null, key: 'paidCount' | 'partialCount' | 'unpaidCount'): number {
    if (!report) return 0;
    return report.months.reduce((acc, m) => acc + (m[key] ?? 0), 0);
  }

  chartsEmpty(report: MandatoryTrackerReport | null): boolean {
    return !report || report.months.length === 0 || report.totalPaid <= 0;
  }

  monthBars(report: MandatoryTrackerReport | null): MonthBar[] {
    if (!report || report.months.length === 0) return [];
    const W = 640, H = 260, padL = 10, padR = 10, padT = 26, padB = 42;
    const months = report.months;
    const maxVal = Math.max(...months.map((m) => Math.max(m.required, m.paid)), 1);
    const innerW = W - padL - padR;
    const slot = innerW / months.length;
    const bw = Math.min(slot * 0.26, 20);
    const chartH = H - padT - padB;
    return months.map((m, i) => {
      const gx = padL + i * slot;
      const requiredH = (m.required / maxVal) * chartH;
      const paidH = (m.paid / maxVal) * chartH;
      return {
        label: m.label,
        bw,
        requiredX: gx + slot * 0.32 - bw / 2,
        requiredY: H - padB - requiredH,
        requiredH,
        paidX: gx + slot * 0.68 - bw / 2,
        paidY: H - padB - paidH,
        paidH,
        required: m.required,
        paid: m.paid,
      };
    });
  }

  complianceSlices(report: MandatoryTrackerReport | null): DonutSlice[] {
    const c = report ? this.summaryCount(report) : { paid: 0, partial: 0, unpaid: 0 };
    const items = [
      { name: 'Fully paid', value: c.paid, color: '#10b981' },
      { name: 'Partial', value: c.partial, color: '#f59e0b' },
      { name: 'In arrears', value: c.unpaid, color: '#dc2626' },
    ].filter((x) => x.value > 0);
    const total = items.reduce((s, i) => s + i.value, 0);
    if (total <= 0) return [];
    const r = 70, cw = 2 * Math.PI * r;
    let acc = 0;
    return items.map((it) => {
      const seg = (it.value / total) * cw;
      const rotate = (acc / total) * 360 - 90;
      acc += it.value;
      return { name: it.name, value: it.value, color: it.color, dash: `${seg} ${cw - seg}`, rotate, percent: (it.value / total) * 100 };
    });
  }

  topCollectors(report: MandatoryTrackerReport | null): TopRow[] {
    if (!report || report.members.length === 0) return [];
    const rows = [...report.members].sort((a, b) => b.paidTotal - a.paidTotal).slice(0, 7);
    if (rows.length === 0) return [];
    const maxVal = Math.max(...rows.map((r) => r.paidTotal), 1);
    const labelX = 148;
    const H = 24 + rows.length * 30;
    return rows.map((r, i) => ({
      name: r.memberName.length > 24 ? r.memberName.slice(0, 23) + '…' : r.memberName,
      number: r.memberNumber,
      value: r.paidTotal,
      x: labelX,
      y: 14 + i * 30,
      w: Math.max((r.paidTotal / maxVal) * (620 - labelX - 14), 4),
      h: 16,
      display: num(r.paidTotal, 0),
    }));
  }
}