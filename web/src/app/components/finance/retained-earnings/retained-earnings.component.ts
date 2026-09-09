import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { AppState } from '../../../models/state.model';
import { loadStatementOfChangesInEquity } from '../../../state/finance/finance.actions';
import { selectStatementOfChangesInEquity, selectStatementOfChangesInEquityLoading } from '../../../state/finance/finance.selectors';
import { StatementOfChangesInEquityReport, EquityStatementRow } from '@sacco/shared-models';
import { etb, PERIOD_PRESETS, periodWindow, PeriodWindow, periodLabel, windowLabel, fmtDate } from '../../../utils/finance-format';

@Component({
  selector: 'app-retained-earnings',
  standalone: true,
  imports: [CommonModule, RouterModule, MatSelectModule, MatProgressSpinnerModule, MatTooltipModule, FormsModule],
  templateUrl: './retained-earnings.component.html',
  styleUrls: ['./retained-earnings.component.css'],
})
export class RetainedEarningsComponent implements OnInit {
  private store = inject(Store<AppState>);
  private location = inject(Location);

  report$ = this.store.select(selectStatementOfChangesInEquity);
  loading$ = this.store.select(selectStatementOfChangesInEquityLoading);

  presetId = 'all';
  private from: number | null = null;
  private to: number | null = null;

  readonly presets = PERIOD_PRESETS;
  readonly etb = etb;
  readonly periodLabel = periodLabel;
  readonly windowLabel = windowLabel;
  readonly fmtDate = fmtDate;

  ngOnInit(): void {
    this.onPeriodChange(this.presetId);
  }

  onPeriodChange(id: string): void {
    const w: PeriodWindow = periodWindow(id);
    this.from = w.from;
    this.to = w.to;
    this.store.dispatch(loadStatementOfChangesInEquity(w));
  }

  back(): void {
    this.location.back();
  }

  print(): void {
    window.print();
  }

  hasRows(report: StatementOfChangesInEquityReport | null): boolean {
    return !!report && report.rows.length > 0;
  }

  isBalanceRow(row: EquityStatementRow): boolean {
    return !row.detail && (row.description || '').toLowerCase().includes('balance');
  }

  /** Dash display for null / zero cells, ethiotrit-style. */
  cell(value: number | null | undefined): string {
    if (value == null || value === 0) return '—';
    return etb(value);
  }

  negative(value: number | null | undefined): boolean {
    return value != null && value < 0;
  }

  /** Build the routerLink for an equity statement row's drill-down. */
  rowLink(report: StatementOfChangesInEquityReport | null, row: EquityStatementRow): string[] | null {
    if (!row.detail || !report) return null;
    switch (row.detail) {
      case 'net_surplus':
        return ['/finance/income-statement'];
      case 'share_capital':
        return report.shareAccountId ? ['/finance/account-ledger', report.shareAccountId] : null;
      case 'statutory_reserve':
        return report.reserveAccountId ? ['/finance/account-ledger', report.reserveAccountId] : null;
      default:
        return null;
    }
  }

  rowQuery(report: StatementOfChangesInEquityReport | null, row: EquityStatementRow): Record<string, number | string> | null {
    if (!row.detail || !report) return null;
    const q: Record<string, number | string> = {};
    if (this.from != null) q['from'] = this.from;
    if (this.to != null) q['to'] = this.to;
    return q;
  }
}
