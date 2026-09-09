import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';
import { AppState } from '../../../models/state.model';
import { loadGeneralLedger, clearFinanceData } from '../../../state/finance/finance.actions';
import { selectGeneralLedger, selectFinanceLoading } from '../../../state/finance/finance.selectors';
import { selectAllAccounts } from '../../../state/lookups/lookups.selectors';
import { loadAccounts } from '../../../state/lookups/lookups.actions';
import { Account, accountTypeLabel, GeneralLedgerReport } from '@sacco/shared-models';
import { etb, fmtDate, windowLabel } from '../../../utils/finance-format';

@Component({
  selector: 'app-account-ledger',
  standalone: true,
  imports: [CommonModule, RouterModule, MatProgressSpinnerModule, MatTooltipModule],
  templateUrl: './account-ledger.component.html',
  styleUrls: ['./account-ledger.component.css'],
})
export class AccountLedgerComponent implements OnInit, OnDestroy {
  private store = inject(Store<AppState>);
  private location = inject(Location);
  private route = inject(ActivatedRoute);

  report$ = this.store.select(selectGeneralLedger);
  loading$ = this.store.select(selectFinanceLoading);
  accounts$ = this.store.select(selectAllAccounts);

  accountId: string | null = null;
  from: number | null = null;
  to: number | null = null;

  readonly etb = etb;
  readonly fmtDate = fmtDate;
  readonly windowLabel = windowLabel;
  readonly accountTypeLabel = accountTypeLabel;

  private subs: Subscription[] = [];

  ngOnInit(): void {
    this.subs.push(
      this.route.paramMap.subscribe((params) => {
        this.accountId = params.get('accountId');
        this.reload();
      }),
      this.route.queryParamMap.subscribe((q) => {
        const rawFrom = q.get('from');
        const rawTo = q.get('to');
        this.from = rawFrom ? Number(rawFrom) : null;
        this.to = rawTo ? Number(rawTo) : null;
        this.reload();
      })
    );
    this.store.dispatch(loadAccounts({}));
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
    this.store.dispatch(clearFinanceData());
  }

  private reload(): void {
    if (!this.accountId) return;
    this.store.dispatch(
      loadGeneralLedger({ from: this.from, to: this.to, accountId: this.accountId })
    );
  }

  headerAccount(accounts: Account[] | null): Account | null {
    return accounts?.find((a) => a.id === this.accountId) ?? null;
  }

  fallbackName(report: GeneralLedgerReport | null): string {
    return report?.entries?.[0]?.accountName ?? 'Account';
  }

  fallbackNumber(report: GeneralLedgerReport | null): string {
    return report?.entries?.[0]?.accountNumber ?? '';
  }

  closingBalance(report: GeneralLedgerReport | null): number {
    const entries = report?.entries ?? [];
    if (entries.length === 0) return report?.openingBalance ?? 0;
    return entries[entries.length - 1].runningBalance ?? 0;
  }

  back(): void {
    this.location.back();
  }

  print(): void {
    window.print();
  }
}