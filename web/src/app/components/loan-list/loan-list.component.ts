import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { Router } from '@angular/router';

import { Loan, Member, SharedLoanType } from '@sacco/shared-models';
import { AppState } from '../../models/state.model';
import { loadLoans } from '../../state/loan/loans.actions';
import { selectAllLoans } from '../../state/loan/loans.selectors';
import { selectAllMembers } from '../../state/members/members.selectors';
import { selectAllLoanTypes } from '../../state/lookups/lookups.selectors';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-loan-list',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatTableModule,
        MatPaginatorModule,
        MatChipsModule
    ],
    templateUrl: './loan-list.component.html',
  styleUrls: ['./loan-list.component.css']
})
export class LoanListComponent implements OnInit, AfterViewInit {
    loans$!: Observable<Loan[]>;
    members$!: Observable<Member[]>;

    displayedColumns: string[] = ['date', 'member', 'amount', 'interest', 'disbursed', 'status', 'actions'];
    dataSource = new MatTableDataSource<Loan>();
    @ViewChild(MatPaginator) paginator!: MatPaginator;

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
            this.dataSource.paginator = this.paginator;
        });
    }

    ngAfterViewInit(): void {
        this.dataSource.paginator = this.paginator;
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
