import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { AppState } from '../../../models/state.model';
import { loadBalanceSheet } from '../../../state/finance/finance.actions';
import { selectBalanceSheet, selectFinanceLoading } from '../../../state/finance/finance.selectors';
import { BalanceSheetReport } from '@sacco/shared-models';
import { etb, PERIOD_PRESETS, periodWindow, PeriodWindow, periodLabel } from '../../../utils/finance-format';

@Component({
  selector: 'app-balance-sheet',
  standalone: true,
  imports: [CommonModule, RouterModule, MatSelectModule, MatProgressSpinnerModule, MatTooltipModule, FormsModule],
  templateUrl: './balance-sheet.component.html',
  styleUrls: ['./balance-sheet.component.css'],
})
export class BalanceSheetComponent implements OnInit {
  private store = inject(Store<AppState>);
  private location = inject(Location);

  report$ = this.store.select(selectBalanceSheet);
  loading$ = this.store.select(selectFinanceLoading);

  presetId = 'all';
  readonly presets = PERIOD_PRESETS;
  readonly etb = etb;
  readonly periodLabel = periodLabel;

  ngOnInit(): void {
    this.onPeriodChange(this.presetId);
  }

  onPeriodChange(id: string): void {
    const w: PeriodWindow = periodWindow(id);
    this.store.dispatch(loadBalanceSheet(w));
  }

  back(): void {
    this.location.back();
  }

  ledgerParams(): Record<string, number | null> {
    const w: PeriodWindow = periodWindow(this.presetId);
    return { from: w.from, to: w.to };
  }

  print(): void {
    window.print();
  }

  private share(total: number, assets: number): number {
    if (assets <= 0) return 0;
    return (total / assets) * 100;
  }

  liabilityShare(report: BalanceSheetReport): string {
    return this.share(report.totalLiabilities, report.totalAssets).toFixed(0);
  }

  equityShare(report: BalanceSheetReport): string {
    return this.share(report.totalEquity, report.totalAssets).toFixed(0);
  }

  liabilitySharePct(report: BalanceSheetReport): number {
    return this.share(report.totalLiabilities, report.totalAssets);
  }
}