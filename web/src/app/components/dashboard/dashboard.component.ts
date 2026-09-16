import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { Member, Saving, Loan, LoanRequest, Withdrawal, SharePurchase } from '@sacco/shared-models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);

  loading = true;
  totalMembers = 0;
  totalSavings = 0;
  activeLoans = 0;
  outstandingLoans = 0;
  shareCapital = 0;
  pendingApprovals = 0;
  recentMembers: Member[] = [];

  ngOnInit() {
    forkJoin({
      members: this.api.getMembers(),
      savings: this.api.getSavings(),
      loans: this.api.getLoans(),
      loanRequests: this.api.getLoanRequests(),
      withdrawals: this.api.getWithdrawals(),
      sharePurchases: this.api.getSharePurchases(),
    }).subscribe({
      next: ({ members, savings, loans, loanRequests, withdrawals, sharePurchases }) => {
        const posted = (s: Saving) => (s.status ?? 'POSTED') === 'POSTED';
        this.totalMembers = members.length;
        this.totalSavings = savings.filter(posted).reduce((sum, s) => sum + (s.savingAmount ?? 0), 0);
        const active: Loan[] = loans.filter(l => l.status === 'ACTIVE');
        this.activeLoans = active.length;
        this.outstandingLoans = active.reduce((sum, l) => sum + (l.approvedAmount ?? 0), 0);
        this.shareCapital = (sharePurchases ?? []).reduce((sum, p: SharePurchase) => sum + (p.totalAmount ?? 0), 0);
        this.pendingApprovals =
          savings.filter(s => s.status === 'PENDING').length +
          withdrawals.filter((w: Withdrawal) => (w.status ?? 'POSTED') === 'PENDING').length +
          loanRequests.filter((r: LoanRequest) => r.status === 'PENDING').length;
        this.recentMembers = [...members]
          .sort((a, b) => (b.registrationDate ?? 0) - (a.registrationDate ?? 0))
          .slice(0, 5);
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  money(n: number): string {
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}