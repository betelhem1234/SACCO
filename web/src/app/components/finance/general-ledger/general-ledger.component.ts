import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil, timeout } from 'rxjs/operators';
import { ApiService } from '../../../services/api.service';
import { Account, accountTypeLabel, ACCOUNT_TYPE_OPTIONS, GeneralLedgerReport, LedgerRow } from '@sacco/shared-models';
import { etb, fmtDate, fmtDateTime, PERIOD_PRESETS, periodWindow, PeriodWindow, periodLabel } from '../../../utils/finance-format';

@Component({
  selector: 'app-general-ledger',
  standalone: true,
  imports: [CommonModule, RouterModule, MatSelectModule, MatProgressSpinnerModule, MatTooltipModule, FormsModule],
  templateUrl: './general-ledger.component.html',
  styleUrls: ['./general-ledger.component.css'],
})
export class GeneralLedgerComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private location = inject(Location);
  private destroy$ = new Subject<void>();

  private reportSubject = new BehaviorSubject<GeneralLedgerReport | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private accountsSubject = new BehaviorSubject<Account[]>([]);
  private errorSubject = new BehaviorSubject<string | null>(null);

  report$ = this.reportSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();
  accounts$ = this.accountsSubject.asObservable();
  error$ = this.errorSubject.asObservable();

  presetId = 'all';
  accountId: string = '';
  sortCol: keyof LedgerRow = 'date';
  sortAsc = true;

  readonly presets = PERIOD_PRESETS;
  readonly accountGroups: { typ: number; label: string }[] = ACCOUNT_TYPE_OPTIONS.map((o) => ({ typ: o.value, label: o.label }));
  readonly etb = etb;
  readonly fmtDate = fmtDate;
  readonly fmtDateTime = fmtDateTime;
  readonly periodLabel = periodLabel;
  readonly accountTypeLabel = accountTypeLabel;

  ngOnInit(): void {
    this.loadAccounts();
    this.reload();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadAccounts(): void {
    this.api.getAccounts().pipe(takeUntil(this.destroy$)).subscribe({
      next: (accounts) => this.accountsSubject.next(accounts ?? []),
      error: () => this.accountsSubject.next([]),
    });
  }

  onPeriodChange(id: string): void {
    this.presetId = id;
    this.reload();
  }

  onAccountChange(): void {
    this.reload();
  }

  private reload(): void {
    const w: PeriodWindow = periodWindow(this.presetId);
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    this.api.getGeneralLedger(w.from, w.to, this.accountId ?? undefined)
      .pipe(timeout(60000), takeUntil(this.destroy$))
      .subscribe({
      next: (report) => {
        this.reportSubject.next(report);
        this.loadingSubject.next(false);
      },
      error: (err) => {
        this.loadingSubject.next(false);
        this.errorSubject.next(this.errorMessage(err));
      },
    });
  }

  sortBy(col: keyof LedgerRow): void {
    if (this.sortCol === col) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortCol = col;
      this.sortAsc = col !== 'date';
    }
  }

  sortIcon(col: keyof LedgerRow): string {
    if (this.sortCol !== col) return 'unfold_more';
    return this.sortAsc ? 'arrow_upward' : 'arrow_downward';
  }

  sortedEntries(report: GeneralLedgerReport): LedgerRow[] {
    const rows = [...(report.entries ?? [])];
    const dir = this.sortAsc ? 1 : -1;
    rows.sort((a, b) => {
      const av = a[this.sortCol];
      const bv = b[this.sortCol];
      if (typeof av === 'number' && typeof bv === 'number') return ((av as number) - (bv as number)) * dir;
      return String(av ?? '').localeCompare(String(bv ?? '')) * dir;
    });
    return rows;
  }

  retry(): void {
    this.reload();
  }

  private errorMessage(err: unknown): string {
    if (err && typeof err === 'object') {
      const anyErr = err as { status?: number; message?: string; error?: { message?: string } | string };
      if (anyErr.status === 401) return 'Your session has expired. Please log in again.';
      const detail = typeof anyErr.error === 'string' ? anyErr.error
        : anyErr.error?.message || anyErr.message;
      if (detail) return `Unable to load general ledger. ${detail}`;
    }
    return 'Unable to load general ledger. Please try again.';
  }

  clearAccount(): void {
    this.accountId = '';
    this.reload();
  }

  isFiltered(): boolean {
    return !!this.accountId;
  }

  byType(accounts: Account[], typ: number): Account[] {
    return accounts.filter((a) => a.accountType === typ);
  }

  selectedAccountLabel(accounts: Account[] | null): string {
    if (!this.accountId) return 'All accounts';
    const acc = accounts?.find((a) => a.id === this.accountId);
    return acc ? `${acc.accountNumber ?? ''} — ${acc.name ?? acc.accountNumber ?? 'Account'}` : 'Select account';
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
}