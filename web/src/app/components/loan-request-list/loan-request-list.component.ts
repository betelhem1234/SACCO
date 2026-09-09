import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';

import { LoanRequest, Member, SharedLoanType } from '@sacco/shared-models';
import { AppState } from '../../models/state.model';
import { loadLoanRequests, approveLoanRequest } from '../../state/loan/loans.actions';
import { selectAllRequests } from '../../state/loan/loans.selectors';
import { selectAllMembers } from '../../state/members/members.selectors';
import { selectAllLoanTypes } from '../../state/lookups/lookups.selectors';
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
    MatPaginatorModule,
    MatDialogModule,
    MatChipsModule
  ],
  templateUrl: './loan-request-list.component.html',
  styleUrls: ['./loan-request-list.component.css']
})
export class LoanRequestListComponent implements OnInit, AfterViewInit {
  requests$!: Observable<EnrichedLoanRequest[]>;
  members$!: Observable<Member[]>;
  loanTypes$!: Observable<SharedLoanType[]>;

  displayedColumns: string[] = ['date', 'member', 'loanType', 'amount', 'months', 'status', 'actions'];
  dataSource = new MatTableDataSource<EnrichedLoanRequest>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;

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
      this.dataSource.paginator = this.paginator;
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  onAdd() {
    this.dialog.open(LoanRequestFormComponent, { width: '90vw', maxWidth: '1000px' });
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
