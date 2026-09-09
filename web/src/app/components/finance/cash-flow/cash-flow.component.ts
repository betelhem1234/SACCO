import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { FormsModule } from '@angular/forms';
import { AppState } from '../../../models/state.model';
import { loadCashFlow, loadCashFlowStatement } from '../../../state/finance/finance.actions';
import {
  selectCashFlow,
  selectCashFlowStatement,
  selectFinanceLoading,
  selectCashFlowStatementLoading,
} from '../../../state/finance/finance.selectors';
import { CashFlowActivityRow } from '@sacco/shared-models';
import { etb, fmtDate, fmtDateTime, PERIOD_PRESETS, periodWindow, PeriodWindow, periodLabel } from '../../../utils/finance-format';

@Component({
  selector: 'app-cash-flow',
  standalone: true,
  imports: [CommonModule, RouterModule, MatSelectModule, MatProgressSpinnerModule, MatTooltipModule, MatTabsModule, FormsModule],
  templateUrl: './cash-flow.component.html',
  styleUrls: ['./cash-flow.component.css'],
})
export class CashFlowComponent implements OnInit {
  private store = inject(Store<AppState>);
  private location = inject(Location);

  report$ = this.store.select(selectCashFlow);
  statement$ = this.store.select(selectCashFlowStatement);
  loading$ = this.store.select(selectFinanceLoading);
  statementLoading$ = this.store.select(selectCashFlowStatementLoading);

  presetId = 'all';
  readonly presets = PERIOD_PRESETS;
  readonly etb = etb;
  readonly fmtDate = fmtDate;
  readonly fmtDateTime = fmtDateTime;
  readonly periodLabel = periodLabel;

  ngOnInit(): void {
    this.onPeriodChange(this.presetId);
  }

  onPeriodChange(id: string): void {
    const w: PeriodWindow = periodWindow(id);
    this.presetId = id;
    this.store.dispatch(loadCashFlow(w));
    this.store.dispatch(loadCashFlowStatement(w));
  }

  back(): void {
    this.location.back();
  }

  ledgerParams(): Record<string, number | null> {
    const w: PeriodWindow = periodWindow(this.presetId);
    return { from: w.from, to: w.to };
  }

  hasActivity(rows: CashFlowActivityRow[]): boolean {
    return Array.isArray(rows) && rows.length > 0;
  }

  print(): void {
    window.print();
  }
}