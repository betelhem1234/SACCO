import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from '../../../services/api.service';
import { AppState } from '../../../models/state.model';
import { loadMonthlyReport, loadWeeklyReport } from '../../../state/finance/finance.actions';
import {
  selectMonthlyReport,
  selectWeeklyReport,
  selectMonthlyReportLoading,
  selectWeeklyReportLoading,
} from '../../../state/finance/finance.selectors';
import {
  MonthlyFinanceReport,
  WeeklyFinanceReport,
  FinanceAccountPeriodRow,
  ReportDetail,
} from '@sacco/shared-models';
import { etb } from '../../../utils/finance-format';
import { FinanceReportDetailComponent } from './finance-report-detail/finance-report-detail.component';

interface ExpenseGroup {
  parent: string;
  names: string[];
}

@Component({
  selector: 'app-finance-report',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatIconModule,
    FormsModule,
  ],
  templateUrl: './finance-report.component.html',
  styleUrls: ['./finance-report.component.css'],
})
export class FinanceReportComponent implements OnInit {
  private store = inject(Store<AppState>);
  private dialog = inject(MatDialog);
  private api = inject(ApiService);

  readonly etb = etb;
  readonly months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  readonly renderedMonthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  years: number[] = this.buildYears();
  selectedYear = new Date().getFullYear();
  selectedTabIndex = 0;

  // Weekly Report tab filters (own controls, independent of the monthly/year filter)
  weeklyYear = new Date().getFullYear();
  weeklyMonth: number | null = null;
  weeklyWeek: number | null = null;

  monthly$ = this.store.select(selectMonthlyReport);
  weekly$ = this.store.select(selectWeeklyReport);
  monthlyLoading$ = this.store.select(selectMonthlyReportLoading);
  weeklyLoading$ = this.store.select(selectWeeklyReportLoading);

  // Monthly snapshot fields for template helpers
  monthlyReport: MonthlyFinanceReport | null = null;
  weeklyReport: WeeklyFinanceReport | null = null;

  // Derived names / groups
  incomeAccountNames: string[] = [];
  expenseAccountNames: string[] = [];
  expenseGroups: ExpenseGroup[] = [];
  weeklyIncomeAccountNames: string[] = [];
  weeklyExpenseAccountNames: string[] = [];

  ngOnInit(): void {
    this.store.dispatch(loadMonthlyReport({ params: { year: this.selectedYear } }));
    this.store.dispatch(loadWeeklyReport({ params: { year: this.selectedYear } }));
    this.monthly$.subscribe((r) => {
      this.monthlyReport = r;
      this.deriveMonthly();
    });
    this.weekly$.subscribe((r) => {
      this.weeklyReport = r;
      this.deriveWeekly();
    });
  }

  onYearChange(): void {
    this.store.dispatch(loadMonthlyReport({ params: { year: this.selectedYear } }));
    this.weeklyYear = this.selectedYear;
    this.store.dispatch(loadWeeklyReport({ params: { year: this.selectedYear } }));
  }

  /** Weekly Report tab's own year filter: refetch the weekly data for the new year. */
  onWeeklyYearChange(): void {
    this.weeklyMonth = null;
    this.weeklyWeek = null;
    this.store.dispatch(loadWeeklyReport({ params: { year: this.weeklyYear } }));
  }

  onWeeklyMonthChange(): void {
    this.weeklyWeek = null;
  }

  onWeeklyWeekChange(): void {
    // handled via visibleWeeklyData filtering; no reload needed
  }

  private deriveMonthly(): void {
    const acc = this.monthlyReport?.incomeAccounts || [];
    const exp = this.monthlyReport?.expenseAccounts || [];
    this.incomeAccountNames = [...new Set<string>(acc.map((r) => r.accountName || ''))]
      .filter((n) => n)
      .sort();
    this.expenseAccountNames = [...new Set<string>(exp.map((r) => r.accountName || ''))]
      .filter((n) => n)
      .sort();

    const parentMap = new Map<string, Set<string>>();
    exp.forEach((r) => {
      const parent = r.parentName || 'Other Expense';
      if (!parentMap.has(parent)) parentMap.set(parent, new Set());
      parentMap.get(parent)!.add(r.accountName || '');
    });
    this.expenseGroups = Array.from(parentMap.entries())
      .map(([parent, names]) => ({ parent, names: [...names].filter((n) => n).sort() }))
      .sort((a, b) => a.parent.localeCompare(b.parent));
  }

  private deriveWeekly(): void {
    const acc = this.weeklyReport?.incomeAccounts || [];
    const exp = this.weeklyReport?.expenseAccounts || [];
    this.weeklyIncomeAccountNames = [...new Set<string>(acc.map((r) => r.accountName || ''))]
      .filter((n) => n)
      .sort();
    this.weeklyExpenseAccountNames = [...new Set<string>(exp.map((r) => r.accountName || ''))]
      .filter((n) => n)
      .sort();
  }

  // ─── Monthly helpers ─────────────────────────────────────────────────────────

  getTotal(field: keyof MonthlyFinanceReport['monthlyData'][number]): number {
    return (this.monthlyReport?.monthlyData || []).reduce((sum, r) => sum + (r[field] || 0), 0);
  }

  getAccountMonthAmount(accounts: FinanceAccountPeriodRow[], name: string, month: number): number {
    const row = accounts.find((r) => r.accountName === name && +(r.month ?? 0) === month);
    return row ? row.amount || 0 : 0;
  }

  getAccountTotal(accounts: FinanceAccountPeriodRow[], name: string): number {
    return accounts
      .filter((r) => r.accountName === name)
      .reduce((sum, r) => sum + (r.amount || 0), 0);
  }

  getGroupMonthTotal(accounts: FinanceAccountPeriodRow[], names: string[], month: number): number {
    return names.reduce((sum, name) => sum + this.getAccountMonthAmount(accounts, name, month), 0);
  }

  getGroupTotal(accounts: FinanceAccountPeriodRow[], names: string[]): number {
    return names.reduce((sum, name) => sum + this.getAccountTotal(accounts, name), 0);
  }

  // ─── Weekly helpers ──────────────────────────────────────────────────────────

  /** ISO week number for a Date (Monday-start), matching Java's IsoFields. */
  private isoWeek(d: Date): number {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }

  /** The set of ISO week numbers whose days fall inside the given month (ethiotrit logic). */
  weeksOfMonth(year: number, month: number): number[] {
    const weeks = new Set<number>();
    const daysInMonth = new Date(year, month, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      weeks.add(this.isoWeek(new Date(year, month - 1, d)));
    }
    return [...weeks].sort((a, b) => a - b);
  }

  /** Weeks available in the weekly data, optionally within the selected month. */
  weeklyWeekOptions(): number[] {
    const data = this.weeklyReport?.weeklyData || [];
    let weeks = data.map((r) => r.period);
    if (this.weeklyMonth != null) {
      const monthWeeks = new Set(this.weeksOfMonth(this.weeklyYear, this.weeklyMonth));
      weeks = weeks.filter((w) => monthWeeks.has(w));
    }
    return [...new Set(weeks)].sort((a, b) => a - b);
  }

  /** Weekly rows after applying the month + week filters. */
  get visibleWeeklyData(): WeeklyFinanceReport['weeklyData'] {
    const data = this.weeklyReport?.weeklyData || [];
    if (this.weeklyMonth != null) {
      const monthWeeks = new Set(this.weeksOfMonth(this.weeklyYear, this.weeklyMonth));
      let filtered = data.filter((r) => monthWeeks.has(r.period));
      if (this.weeklyWeek != null) {
        filtered = filtered.filter((r) => r.period === this.weeklyWeek);
      }
      return filtered;
    }
    return this.weeklyWeek != null ? data.filter((r) => r.period === this.weeklyWeek) : data;
  }

  get visibleWeeks(): Set<number> {
    return new Set(this.visibleWeeklyData.map((r) => r.period));
  }

  getWeeklyTotal(field: keyof WeeklyFinanceReport['weeklyData'][number]): number {
    return this.visibleWeeklyData.reduce((sum, r) => sum + (r[field] || 0), 0);
  }

  getAccountWeekAmount(accounts: FinanceAccountPeriodRow[], name: string, week: number): number {
    const row = accounts.find((r) => r.accountName === name && +(r.week ?? 0) === week);
    return row ? row.amount || 0 : 0;
  }

  /** Year total for a weekly account limited to the visible weeks. */
  getWeeklyAccountTotal(accounts: FinanceAccountPeriodRow[], name: string): number {
    return accounts
      .filter((r) => r.accountName === name && this.visibleWeeks.has(r.week ?? -1))
      .reduce((sum, r) => sum + (r.amount || 0), 0);
  }

  // ─── Report Cell Drill-down ────────────────────────────────────────────────

  /** Open a dialog listing the transactions behind a specific report cell. */
  openDetail(category: string, accountName: string | null, label: string,
             from: number, to: number): void {
    this.api.getPeriodDetail({ from, to, category, accountName: accountName ?? undefined })
      .subscribe({
        next: (detail: ReportDetail) => {
          this.dialog.open(FinanceReportDetailComponent, {
            width: '90vw',
            maxWidth: '1000px',
            data: { ...detail, title: detail.title || label },
          });
        },
        error: () => {
          const detail: ReportDetail = { title: label, rows: [], total: 0 };
          this.dialog.open(FinanceReportDetailComponent, {
            width: '90vw',
            maxWidth: '1000px',
            data: detail,
          });
        },
      });
  }

  /** Drill into a monthly report cell (a specific month column). */
  openMonthDetail(category: string, accountName: string | null, label: string,
                  period: number): void {
    const { from, to } = this.monthWindow(this.selectedYear, period);
    this.openDetail(category, accountName, label, from, to);
  }

  /** Drill into a weekly report cell (a specific week column). */
  openWeekDetail(category: string, accountName: string | null, label: string,
                 period: number): void {
    const { from, to } = this.weekWindow(this.weeklyYear, period);
    this.openDetail(category, accountName, label, from, to);
  }

  /** Drill into a full-year total by clicking the row label. */
  openYearDetail(category: string, accountName: string | null, label: string,
                 year?: number): void {
    const { from, to } = this.yearWindow(year ?? this.selectedYear);
    this.openDetail(category, accountName, label, from, to);
  }

  /** [from, to] (ms) window for a specific month (1..12) of a year. */
  private monthWindow(year: number, month: number): { from: number; to: number } {
    const from = new Date(year, month - 1, 1).getTime();
    const to = new Date(year, month, 1).getTime() - 1;
    return { from, to };
  }

  /** Whole selected year (used when clicking the row label). */
  private yearWindow(year: number): { from: number; to: number } {
    const from = new Date(year, 0, 1).getTime();
    const to = new Date(year, 11, 31, 23, 59, 59, 999).getTime();
    return { from, to };
  }

  /** [from, to] (ms) window for an ISO week (Monday 00:00 → Sunday 23:59:59). */
  private weekWindow(year: number, week: number): { from: number; to: number } {
    const jan1 = new Date(year, 0, 1);
    const dayOffset = (jan1.getDay() + 6) % 7; // 0 = Monday
    const firstMondayOffset = dayOffset === 0 ? 0 : 7 - dayOffset;
    const monday = new Date(year, 0, 1 + firstMondayOffset + (week - 1) * 7);
    const from = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate()).getTime();
    return { from, to: from + 7 * 24 * 60 * 60 * 1000 - 1 };
  }

  // ─── CSV Export ──────────────────────────────────────────────────────────────

  exportToExcel(): void {
    let rows: any[][] = [];
    let title = '';

    const mkMonthRow = (label: string, field?: keyof MonthlyFinanceReport['monthlyData'][number]) => {
      const cells: any[] = [label];
      for (let i = 0; i < this.months.length; i++) {
        const d = this.monthlyReport?.monthlyData?.[i] || undefined;
        cells.push(field ? d?.[field] ?? 0 : 0);
      }
      cells.push(field ? this.getTotal(field) : 0);
      return cells;
    };

    const mkMonthAccountRow = (name: string, accounts: FinanceAccountPeriodRow[]) => {
      const cells: any[] = [name];
      for (let i = 0; i < this.months.length; i++) {
        cells.push(this.getAccountMonthAmount(accounts, name, i + 1));
      }
      cells.push(this.getAccountTotal(accounts, name));
      return cells;
    };

    const mkWeekRow = (label: string, field?: keyof WeeklyFinanceReport['weeklyData'][number]) => {
      const cells: any[] = [label];
      for (const d of this.visibleWeeklyData) {
        cells.push(field ? d[field] ?? 0 : 0);
      }
      cells.push(field ? this.getWeeklyTotal(field) : 0);
      return cells;
    };

    switch (this.selectedTabIndex) {
      case 0: {
        rows = [
          ['Compulsory Saving'],
          mkMonthRow('Compulsory saving From New Members', 'new_compulsory'),
          mkMonthRow('Compulsory saving From Existing Members', 'old_compulsory'),
          mkMonthRow('Total Compulsory saving collected', 'total_compulsory'),
          ['Voluntary Saving'],
          mkMonthRow('Voluntary saving From New Members', 'new_voluntary'),
          mkMonthRow('Voluntary saving From Existing Members', 'old_voluntary'),
          mkMonthRow('Total voluntary saving collected', 'total_voluntary'),
          ['Share'],
          mkMonthRow('Initial share Sold for new Members', 'new_share'),
          mkMonthRow('Additional share Sold for Existing Members', 'old_share'),
          mkMonthRow('Total Share Sold', 'total_share'),
          ['Income'],
          ...this.incomeAccountNames.map((n) => mkMonthAccountRow(n, this.monthlyReport?.incomeAccounts || [])),
          mkMonthRow('Income Total', 'income_total'),
        ];
        title = `Collection_Report_${this.selectedYear}`;
        break;
      }
      case 1: {
        rows = [
          ['Transfer Report'],
          mkMonthRow('Transfer from Voluntary to Mandatory', 'transfer_voluntary_to_mandatory'),
          mkMonthRow('Transfer from Voluntary to Voluntary', 'transfer_voluntary_to_voluntary'),
          mkMonthRow('Transfer from Voluntary to Share', 'transfer_voluntary_to_share'),
          mkMonthRow('Transfer from Share to Share', 'transfer_share_to_share'),
          mkMonthRow('Transfer Total', 'transfer_total'),
          ['Saving Withdrawal'],
          mkMonthRow('Withdraw from Mandatory', 'withdrawal_mandatory'),
          mkMonthRow('Withdraw from Voluntary', 'withdrawal_voluntary'),
          mkMonthRow('Withdrawal Total', 'withdrawal_total'),
        ];
        this.expenseGroups.forEach((group) => {
          rows.push([group.parent]);
          group.names.forEach((name) => rows.push(mkMonthAccountRow(name, this.monthlyReport?.expenseAccounts || [])));
          rows.push(mkMonthRow(`${group.parent} Total`));
          // subtotal over group names
          const sub = rows.pop()!;
          const cells: any[] = [`${group.parent} Total`];
          for (let i = 0; i < this.months.length; i++) {
            cells.push(this.getGroupMonthTotal(this.monthlyReport?.expenseAccounts || [], group.names, i + 1));
          }
          cells.push(this.getGroupTotal(this.monthlyReport?.expenseAccounts || [], group.names));
          rows.push(cells);
        });
        title = `Transfer_Withdrawal_Expense_${this.selectedYear}`;
        break;
      }
      case 2: {
        rows = [mkMonthRow('Monthly Disbursement', 'disbursement_total')];
        title = `Loan_Disbursement_${this.selectedYear}`;
        break;
      }
      case 3: {
        rows = [
          ['Income'],
          ...this.incomeAccountNames.map((n) => mkMonthAccountRow(n, this.monthlyReport?.incomeAccounts || [])),
          mkMonthRow('Total Income', 'income_total'),
          ['Expense'],
          ...this.expenseAccountNames.map((n) => mkMonthAccountRow(n, this.monthlyReport?.expenseAccounts || [])),
          mkMonthRow('Total Expense', 'expense_total'),
        ];
        const net: any[] = ['Net Profit/Loss'];
        for (let i = 0; i < this.months.length; i++) {
          const d = this.monthlyReport?.monthlyData?.[i] || undefined;
          net.push((d?.income_total ?? 0) - (d?.expense_total ?? 0));
        }
        net.push(this.getTotal('income_total') - this.getTotal('expense_total'));
        rows.push(net);
        title = `Income_Statement_${this.selectedYear}`;
        break;
      }
      case 4: {
        rows = [mkMonthRow('Loan Attachment Total')];
        title = `Loan_Attachment_${this.selectedYear}`;
        break;
      }
      case 5: {
        rows = [
          ['Compulsory Saving'],
          mkWeekRow('New Compulsory Saving', 'new_compulsory'),
          mkWeekRow('Old Compulsory Saving', 'old_compulsory'),
          mkWeekRow('Total Compulsory', 'total_compulsory'),
          ['Voluntary Saving'],
          mkWeekRow('New Voluntary Saving', 'new_voluntary'),
          mkWeekRow('Old Voluntary Saving', 'old_voluntary'),
          mkWeekRow('Total Voluntary', 'total_voluntary'),
          ['Share'],
          mkWeekRow('New Share', 'new_share'),
          mkWeekRow('Old Share', 'old_share'),
          mkWeekRow('Total Share', 'total_share'),
          ['Transfer Report'],
          mkWeekRow('Transfer from Voluntary to Mandatory', 'transfer_voluntary_to_mandatory'),
          mkWeekRow('Transfer from Voluntary to Voluntary', 'transfer_voluntary_to_voluntary'),
          mkWeekRow('Transfer from Voluntary to Share', 'transfer_voluntary_to_share'),
          mkWeekRow('Transfer from Share to Share', 'transfer_share_to_share'),
          mkWeekRow('Transfer Total', 'transfer_total'),
          ['Saving Withdrawal'],
          mkWeekRow('Withdraw from Mandatory', 'withdrawal_mandatory'),
          mkWeekRow('Withdraw from Voluntary', 'withdrawal_voluntary'),
          mkWeekRow('Withdrawal Total', 'withdrawal_total'),
          ['Expense'],
          ...this.weeklyExpenseAccountNames.map((n) => {
            const cells: any[] = [n];
            for (const d of this.visibleWeeklyData) {
              cells.push(this.getAccountWeekAmount(this.weeklyReport?.expenseAccounts || [], n, d.period));
            }
            cells.push(this.getWeeklyAccountTotal(this.weeklyReport?.expenseAccounts || [], n));
            return cells;
          }),
          mkWeekRow('Expense Total', 'expense_total'),
          mkWeekRow('Monthly Disbursement', 'disbursement_total'),
          ['Income'],
          ...this.weeklyIncomeAccountNames.map((n) => {
            const cells: any[] = [n];
            for (const d of this.visibleWeeklyData) {
              cells.push(this.getAccountWeekAmount(this.weeklyReport?.incomeAccounts || [], n, d.period));
            }
            cells.push(this.getWeeklyAccountTotal(this.weeklyReport?.incomeAccounts || [], n));
            return cells;
          }),
          mkWeekRow('Total Income', 'income_total'),
          mkWeekRow('Total Expense', 'expense_total'),
        ];
        const netWeek: any[] = ['Net Profit/Loss'];
        for (const d of this.visibleWeeklyData) {
          netWeek.push((d.income_total ?? 0) - (d.expense_total ?? 0));
        }
        netWeek.push(this.getWeeklyTotal('income_total') - this.getWeeklyTotal('expense_total'));
        rows.push(netWeek);
        title = `Wkly_Report_${this.weeklyYear}`;
        break;
      }
    }

    this.downloadCsv(rows, title);
  }

  private downloadCsv(rows: any[][], title: string): void {
    const header: any[] = ['Category', ...this.months, 'Total'];
    if (this.selectedTabIndex === 5) {
      header.splice(1, header.length - 2, ...this.visibleWeeklyData.map((d) => `Week ${d.period}`));
    }
    const lines: string[] = [header.map((h) => this.csvCell(h)).join(',')];
    for (const row of rows) {
      lines.push(row.map((c) => this.csvCell(c)).join(','));
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private csvCell(value: any): string {
    if (value == null) return '';
    const s = String(value);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }

  private buildYears(): number[] {
    const current = new Date().getFullYear();
    const list: number[] = [];
    for (let i = current; i >= current - 5; i--) {
      list.push(i);
    }
    return list;
  }
}
