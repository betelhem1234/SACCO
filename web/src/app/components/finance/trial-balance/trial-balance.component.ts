import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { AppState } from '../../../models/state.model';
import { loadTrialBalance } from '../../../state/finance/finance.actions';
import { selectTrialBalance, selectFinanceLoading, selectFinancePeriod } from '../../../state/finance/finance.selectors';
import { TrialBalanceReport, TrialBalanceGroup, TrialBalanceRow } from '@sacco/shared-models';
import { etb, PERIOD_PRESETS, periodWindow, PeriodWindow, periodLabel } from '../../../utils/finance-format';

@Component({
  selector: 'app-trial-balance',
  standalone: true,
  imports: [CommonModule, RouterModule, MatSelectModule, MatProgressSpinnerModule, MatTooltipModule, FormsModule],
  templateUrl: './trial-balance.component.html',
  styleUrls: ['./trial-balance.component.css'],
})
export class TrialBalanceComponent implements OnInit {
  private store = inject(Store<AppState>);
  private location = inject(Location);

  report$ = this.store.select(selectTrialBalance);
  loading$ = this.store.select(selectFinanceLoading);
  period$ = this.store.select(selectFinancePeriod);

  presetId = 'all';
  readonly presets = PERIOD_PRESETS;
  readonly etb = etb;
  readonly periodLabel = periodLabel;

  ngOnInit(): void {
    const w = periodWindow(this.presetId);
    this.store.dispatch(loadTrialBalance(w));
  }

  onPeriodChange(id: string): void {
    const w: PeriodWindow = periodWindow(id);
    this.store.dispatch(loadTrialBalance(w));
  }

  back(): void {
    this.location.back();
  }

  print(): void {
    window.print();
  }

  groupRows(report: TrialBalanceReport | null, name: string): TrialBalanceRow[] {
    return report?.groups?.find((g) => g.name === name)?.rows ?? [];
  }

  ledgerParams(): Record<string, number | null> {
    const w: PeriodWindow = periodWindow(this.presetId);
    return { from: w.from, to: w.to };
  }

  hasRows(report: TrialBalanceReport | null): boolean {
    return !!report?.groups?.some((g) => g.rows.length > 0);
  }

  group(report: TrialBalanceReport | null, name: string): TrialBalanceGroup | undefined {
    return report?.groups?.find((g) => g.name === name);
  }

  /** Balance sign as displayed: positive values with the account's normal balance. */
  rowBalance(row: TrialBalanceRow): number {
    return row.balance;
  }

  groupColor(name: string): string {
    switch (name) {
      case 'ASSET': return '#3b82f6';
      case 'LIABILITY': return '#f59e0b';
      case 'EQUITY': return '#8b5cf6';
      case 'REVENUE': return '#10b981';
      case 'EXPENSE': return '#ef4444';
      default: return '#94a3b8';
    }
  }

  groupBadgeBg(name: string): string {
    switch (name) {
      case 'ASSET': return '#dbeafe';
      case 'LIABILITY': return '#fef3c7';
      case 'EQUITY': return '#ede9fe';
      case 'REVENUE': return '#d1fae5';
      case 'EXPENSE': return '#fee2e2';
      default: return '#f1f5f9';
    }
  }

  groupBadgeColor(name: string): string {
    switch (name) {
      case 'ASSET': return '#1e40af';
      case 'LIABILITY': return '#92400e';
      case 'EQUITY': return '#5b21b6';
      case 'REVENUE': return '#065f46';
      case 'EXPENSE': return '#991b1b';
      default: return '#475569';
    }
  }

  private groupBalance(report: TrialBalanceReport | null, name: string): number {
    return report?.groups?.find((g) => g.name === name)?.balance ?? 0;
  }

  equityBalance(report: TrialBalanceReport | null): number {
    return this.groupBalance(report, 'EQUITY');
  }

  liabilityBalance(report: TrialBalanceReport | null): number {
    return this.groupBalance(report, 'LIABILITY');
  }

  netIncome(report: TrialBalanceReport | null): number {
    return this.groupBalance(report, 'REVENUE') - this.groupBalance(report, 'EXPENSE');
  }
}