import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { AppState } from '../../../models/state.model';
import {
  loadFinanceSummary,
  setFinancePeriod,
} from '../../../state/finance/finance.actions';
import { selectFinanceSummary, selectFinanceLoading } from '../../../state/finance/finance.selectors';
import { FinanceSummaryReport } from '@sacco/shared-models';
import { PeriodWindow, PERIOD_PRESETS, periodWindow, periodLabel, etb, numShort } from '../../../utils/finance-format';

interface ReportLink {
  path: string;
  title: string;
  subtitle: string;
  icon: string;
  gradient: string;
}

interface Kpi {
  key: keyof FinanceSummaryReport;
  label: string;
  icon: string;
  gradient: string;
  badge?: string;
  badgeBg?: string;
  badgeColor?: string;
  format: (v: number) => string;
}

@Component({
  selector: 'app-finance-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatSelectModule, MatProgressSpinnerModule, FormsModule],
  templateUrl: './finance-dashboard.component.html',
  styleUrls: ['./finance-dashboard.component.css'],
})
export class FinanceDashboardComponent implements OnInit {
  private store = inject(Store<AppState>);

  summary$ = this.store.select(selectFinanceSummary);
  loading$ = this.store.select(selectFinanceLoading);

  presetId = 'all';
  readonly presets = PERIOD_PRESETS;
  readonly periodLabel = periodLabel;

  kpis: Kpi[] = [
    { key: 'totalAssets', label: 'Total Assets', icon: 'account_balance', gradient: 'linear-gradient(135deg,#3b82f6,#1e40af)', format: etb },
    { key: 'totalLiabilities', label: 'Total Liabilities', icon: 'home_work', gradient: 'linear-gradient(135deg,#f59e0b,#b45309)', format: etb },
    { key: 'netWorth', label: 'Net Worth', icon: 'shield', gradient: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', format: etb },
    { key: 'netIncome', label: 'Net Income', icon: 'trending_up', gradient: 'linear-gradient(135deg,#10b981,#047857)', format: etb },
    { key: 'cashAndBankBalance', label: 'Cash & Bank', icon: 'payments', gradient: 'linear-gradient(135deg,#06b6d4,#0e7490)', format: etb },
    { key: 'loanPortfolio', label: 'Loan Portfolio', icon: 'request_quote', gradient: 'linear-gradient(135deg,#ef4444,#b91c1c)', badge: 'ACTIVE', badgeBg: '#fee2e2', badgeColor: '#991b1b', format: (v) => `${etb(v)} · ${numShort(v)}` },
  ];

  reports: ReportLink[] = [
    {
      path: '/finance/trial-balance',
      title: 'Trial Balance',
      subtitle: 'Account balances with debit and credit totals',
      icon: 'balance',
      gradient: 'linear-gradient(135deg,#3b82f6,#1e40af)',
    },
    {
      path: '/finance/income-statement',
      title: 'Income Statement',
      subtitle: 'Revenue, expenses and net income',
      icon: 'trending_up',
      gradient: 'linear-gradient(135deg,#10b981,#047857)',
    },
    {
      path: '/finance/balance-sheet',
      title: 'Balance Sheet',
      subtitle: 'Assets, liabilities and equity position',
      icon: 'account_balance',
      gradient: 'linear-gradient(135deg,#8b5cf6,#6d28d9)',
    },
    {
      path: '/finance/cash-flow',
      title: 'Cash Flow Statement',
      subtitle: 'Cash and bank inflows & outflows',
      icon: 'currency_exchange',
      gradient: 'linear-gradient(135deg,#f59e0b,#b45309)',
    },
    {
      path: '/finance/general-ledger',
      title: 'General Ledger',
      subtitle: 'All journal entries across the ledger',
      icon: 'menu_book',
      gradient: 'linear-gradient(135deg,#ef4444,#b91c1c)',
    },
    {
      path: '/finance/retained-earnings',
      title: 'Retained Earnings',
      subtitle: 'Roll-forward of cumulative net income',
      icon: 'savings',
      gradient: 'linear-gradient(135deg,#0d9488,#115e59)',
    },
    {
      path: '/finance/finance-report',
      title: 'Finance Report',
      subtitle: 'Monthly & daily collections, share, withdrawals and transfers',
      icon: 'assessment',
      gradient: 'linear-gradient(135deg,#2563eb,#1e3a5f)',
    },
  ];

  ngOnInit(): void {
    this.store.dispatch(loadFinanceSummary({ from: null, to: null }));
    this.store.dispatch(setFinancePeriod({ from: null, to: null }));
  }

  onPeriodChange(id: string): void {
    const w: PeriodWindow = periodWindow(id);
    this.store.dispatch(setFinancePeriod(w));
    this.store.dispatch(loadFinanceSummary(w));
  }

  kpiValue(value: FinanceSummaryReport | null, key: keyof FinanceSummaryReport): number {
    return value ? (value[key] as number) ?? 0 : 0;
  }
}