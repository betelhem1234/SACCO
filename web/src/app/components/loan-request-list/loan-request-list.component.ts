import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';

import { LoanRequest, Member, SharedLoanType } from '@sacco/shared-models';
import { AppState } from '../../models/state.model';
import { loadLoanRequests, approveLoanRequest } from '../../state/loans.actions';
import { selectAllRequests } from '../../state/loans.selectors';
import { selectAllMembers } from '../../state/members.selectors';
import { selectAllLoanTypes } from '../../state/lookups.selectors';
import { LoanRequestFormComponent } from '../loan-request-form/loan-request-form.component';
import { map } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { GenericDetailDialogComponent, DetailDialogData } from '../generic-detail-dialog/generic-detail-dialog.component';

export interface EnrichedLoanRequest extends LoanRequest {
  memberName: string;
  loanTypeName: string;
}

@Component({
  selector: 'app-loan-request-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDialogModule,
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
              <span class="material-icons text-white" style="font-size:20px">request_quote</span>
            </div>
            <div>
              <h1 class="text-xl font-bold" style="color:#1e293b">Loan Requests</h1>
              <p class="text-xs" style="color:#64748b">Manage member loan applications</p>
            </div>
          </div>
          <button (click)="onAdd()"
                  class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-0 cursor-pointer"
                  style="background:linear-gradient(135deg,#3b82f6,#1d4ed8);color:white;box-shadow:0 4px 12px rgba(59,130,246,0.35)">
            <span class="material-icons" style="font-size:18px">add</span>
            New Request
          </button>
        </div>

        <!-- Table Card -->
        <div class="bg-white rounded-2xl overflow-hidden shadow-sm border" style="border-color:#e2e8f0">
          <table mat-table [dataSource]="dataSource" class="w-full">

            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef class="pl-6">Date</th>
              <td mat-cell *matCellDef="let row" class="pl-6">
                <span class="text-sm" style="color:#475569">{{ row.createdAt | date:'shortDate' }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="member">
              <th mat-header-cell *matHeaderCellDef>Member</th>
              <td mat-cell *matCellDef="let row">
                <span class="text-sm font-medium" style="color:#1e293b">{{ row.memberName }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="loanType">
              <th mat-header-cell *matHeaderCellDef>Loan Type</th>
              <td mat-cell *matCellDef="let row">
                <span class="text-sm" style="color:#475569">{{ row.loanTypeName }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef>Amount</th>
              <td mat-cell *matCellDef="let row">
                <span class="text-sm font-mono font-bold text-blue-600">{{ row.requestedAmount | number }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="months">
              <th mat-header-cell *matHeaderCellDef>Term</th>
              <td mat-cell *matCellDef="let row">
                <span class="text-sm" style="color:#475569">{{ row.requestedMonths }} months</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let row">
                <mat-chip [color]="row.status === 'PENDING' ? 'accent' : (row.status === 'APPROVED' ? 'primary' : 'warn')" selected>
                  <span class="font-bold text-xs">{{ row.status }}</span>
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let row">
                <div class="flex items-center gap-1">
                  <button mat-icon-button matTooltip="View Details" (click)="onView(row)" class="!w-8 !h-8 mr-2" style="color:#059669">
                    <span class="material-icons" style="font-size:18px">visibility</span>
                  </button>
                  <button *ngIf="row.status === 'PENDING'" mat-button color="primary" (click)="onApprove(row.id!)" class="text-sm font-semibold">
                    APPROVE
                  </button>
                </div>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="transition-all duration-150 relative cursor-default hover:bg-slate-50"></tr>
          </table>

          <div *ngIf="dataSource.data.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
            <span class="material-icons mb-3" style="font-size:48px;color:#cbd5e1">request_quote</span>
            <p class="font-medium" style="color:#64748b">No loan requests found</p>
            <p class="text-sm mt-1" style="color:#94a3b8">Click "New Request" to create one</p>
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
export class LoanRequestListComponent implements OnInit {
  requests$!: Observable<EnrichedLoanRequest[]>;
  members$!: Observable<Member[]>;
  loanTypes$!: Observable<SharedLoanType[]>;

  displayedColumns: string[] = ['date', 'member', 'loanType', 'amount', 'months', 'status', 'actions'];
  dataSource = new MatTableDataSource<EnrichedLoanRequest>();

  constructor(private store: Store<AppState>, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.store.dispatch(loadLoanRequests());

    this.requests$ = combineLatest([
      this.store.select(selectAllRequests),
      this.store.select(selectAllMembers),
      this.store.select(selectAllLoanTypes)
    ]).pipe(
      map(([reqs, members, types]) => {
        return (reqs || []).map(r => ({
          ...r,
          memberName: members?.find(m => m.id === r.memberId)?.fullName || 'Unknown',
          loanTypeName: types?.find(t => t.id === r.loanTypeId)?.name || 'Unknown'
        }));
      })
    );

    this.requests$.subscribe(reqs => {
      // Sort by createdAt descending
      this.dataSource.data = [...(reqs ?? [])].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    });
  }

  onAdd() {
    this.dialog.open(LoanRequestFormComponent, { width: '500px' });
  }

  onView(row: EnrichedLoanRequest) {
    const dialogData: DetailDialogData = {
      title: 'Loan Request Details',
      subTitle: row.memberName,
      icon: 'request_quote',
      data: row,
      fields: [
        { key: 'memberName', label: 'Member Name', type: 'text' },
        { key: 'loanTypeName', label: 'Loan Type', type: 'text' },
        { key: 'requestedAmount', label: 'Amount', type: 'currency' },
        { key: 'requestedMonths', label: 'Term Length', type: 'custom', formatFn: (v) => `${v} months` },
        { key: 'status', label: 'Status', type: 'text' },
        { key: 'purpose', label: 'Purpose', type: 'text' },
        { key: 'createdAt', label: 'Applied At', type: 'date' },
        { key: 'approvedAt', label: 'Approved At', type: 'date' },
      ]
    };
    this.dialog.open(GenericDetailDialogComponent, { data: dialogData });
  }

  onApprove(requestId: string) {
    if (confirm('Are you sure you want to approve this loan request?')) {
      // We pass a dummy approvedBy UUID or we could leave it undefined since api service sets it if available
      this.store.dispatch(approveLoanRequest({ requestId, approvedBy: '00000000-0000-0000-0000-000000000001' }));
    }
  }
}
