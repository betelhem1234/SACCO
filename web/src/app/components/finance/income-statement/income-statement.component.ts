import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { AppState } from '../../../models/state.model';
import { loadIncomeStatement } from '../../../state/finance/finance.actions';
import { selectIncomeStatement, selectFinanceLoading } from '../../../state/finance/finance.selectors';
import { etb, PERIOD_PRESETS, periodWindow, PeriodWindow, periodLabel } from '../../../utils/finance-format';

@Component({
  selector: 'app-income-statement',
  standalone: true,
  imports: [CommonModule, RouterModule, MatSelectModule, MatProgressSpinnerModule, MatTooltipModule, FormsModule],
  templateUrl: './income-statement.component.html',
  styleUrls: ['./income-statement.component.css'],
})
export class IncomeStatementComponent implements OnInit {
  private store = inject(Store<AppState>);
  private location = inject(Location);

  report$ = this.store.select(selectIncomeStatement);
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
    this.store.dispatch(loadIncomeStatement(w));
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

  margin(revenue: number, netIncome: number): string {
    if (revenue <= 0) return '0%';
    return ((netIncome / revenue) * 100).toFixed(1) + '%';
  }
}