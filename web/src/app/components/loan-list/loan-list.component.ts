import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { Router } from '@angular/router';

import { Loan, Member, SharedLoanType } from '@sacco/shared-models';
import { AppState } from '../../models/state.model';
import { loadLoans } from '../../state/loans.actions';
import { selectAllLoans } from '../../state/loans.selectors';
import { selectAllMembers } from '../../state/members.selectors';
import { selectAllLoanTypes } from '../../state/lookups.selectors';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-loan-list',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatTableModule,
        MatChipsModule
    ],
    template: `
    <section class="p-6" style="background:#f0f4f8;min-height:100%">
      <div class="max-w-7xl mx-auto">

        <!-- Page Header -->
        <div class="flex justify-between items-center mb-6">
          <div class="flex items-center gap-3">
             <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                 style="background:linear-gradient(135deg,#3b82f6,#1d4ed8)">
              <span class="material-icons text-white" style="font-size:20px">account_balance_wallet</span>
            </div>
            <div>
              <h1 class="text-xl font-bold" style="color:#1e293b">Loans</h1>
              <p class="text-xs" style="color:#64748b">Manage all approved and active loans</p>
            </div>
          </div>
        </div>

        <!-- Table Card -->
        <div class="bg-white rounded-2xl overflow-hidden shadow-sm border" style="border-color:#e2e8f0">
          <table mat-table [dataSource]="dataSource" class="w-full">

            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef class="pl-6">Approved On</th>
              <td mat-cell *matCellDef="let row" class="pl-6">
                <span class="text-sm" style="color:#475569">{{ row.createdAt | date:'shortDate' }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="member">
              <th mat-header-cell *matHeaderCellDef>Member</th>
              <td mat-cell *matCellDef="let row">
                <span class="text-sm font-medium" style="color:#1e293b">{{ getMemberName(row.memberId) | async }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef>Approved Amount</th>
              <td mat-cell *matCellDef="let row">
                <span class="text-sm font-mono font-bold text-blue-600">{{ row.approvedAmount | number }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="interest">
              <th mat-header-cell *matHeaderCellDef>Interest Rate</th>
              <td mat-cell *matCellDef="let row">
                 <span class="text-sm border rounded px-2 py-0.5 bg-gray-50 text-gray-700 font-mono">{{ row.interestRate }}%</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="disbursed">
              <th mat-header-cell *matHeaderCellDef>Disbursed</th>
              <td mat-cell *matCellDef="let row">
                 <mat-icon [style.color]="row.isDisbursed ? '#10b981' : '#cbd5e1'">{{ row.isDisbursed ? 'check_circle' : 'pending' }}</mat-icon>
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let row">
                 <mat-chip [color]="row.status === 'APPROVED' ? 'accent' : (row.status === 'ACTIVE' ? 'primary' : 'default')" selected>
                  <span class="font-bold text-xs">{{ row.status }}</span>
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Details</th>
              <td mat-cell *matCellDef="let row">
                <button mat-button color="primary" (click)="viewDetails(row.id!)" class="text-sm font-semibold flex items-center">
                  <span>VIEW</span>
                  <mat-icon class="ml-1" style="font-size:16px;">arrow_forward</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="transition-all duration-150 relative cursor-default hover:bg-slate-50"></tr>
          </table>

          <div *ngIf="dataSource.data.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
            <span class="material-icons mb-3" style="font-size:48px;color:#cbd5e1">account_balance_wallet</span>
            <p class="font-medium" style="color:#64748b">No active loans found</p>
            <p class="text-sm mt-1" style="color:#94a3b8">Approve a new loan request to see it here</p>
          </div>
        </div>
      </div>
    </section>
  `,
    styles: [`
    td.mat-cell {
      border-bottom-width: 1px;
      border-bottom-style: solid;
    }
  `]
})
export class LoanListComponent implements OnInit {
    loans$!: Observable<Loan[]>;
    members$!: Observable<Member[]>;

    displayedColumns: string[] = ['date', 'member', 'amount', 'interest', 'disbursed', 'status', 'actions'];
    dataSource = new MatTableDataSource<Loan>();

    constructor(
        private store: Store<AppState>,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.store.dispatch(loadLoans());

        this.loans$ = this.store.select(selectAllLoans);
        this.members$ = this.store.select(selectAllMembers);

        this.loans$.subscribe(loans => {
            this.dataSource.data = [...(loans ?? [])].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        });
    }

    getMemberName(memberId: string): Observable<string> {
        return this.members$.pipe(
            map(members => members?.find(m => m.id === memberId)?.fullName || 'Unknown Member')
        );
    }

    viewDetails(loanId: string) {
        this.router.navigate(['/loans', loanId]);
    }
}
