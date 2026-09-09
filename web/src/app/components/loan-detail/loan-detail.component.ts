import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { ActivatedRoute, Router } from '@angular/router';

import { Loan, LoanSchedule, Member, Account, DisburseRequest, RepaymentRequest } from '@sacco/shared-models';
import { AppState } from '../../models/state.model';
import { loadLoanSchedule, disburseLoan, repayLoan } from '../../state/loan/loans.actions';
import { selectAllLoans, selectScheduleForLoan } from '../../state/loan/loans.selectors';
import { selectAllMembers } from '../../state/members/members.selectors';
import { selectAllAccounts } from '../../state/lookups/lookups.selectors';
import { ApiService } from '../../services/api.service';

@Component({
    selector: 'app-loan-detail',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatTableModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatChipsModule,
        ReactiveFormsModule
    ],
    templateUrl: './loan-detail.component.html',
  styleUrls: ['./loan-detail.component.css']
})
export class LoanDetailComponent implements OnInit {
    loanId!: string;
    loan$!: Observable<Loan | undefined>;
    memberName$!: Observable<string>;
    totalDue$ = new BehaviorSubject<number | null>(null);

    scheduleColumns = ['no', 'dueDate', 'principal', 'interest', 'total', 'paid', 'status'];
    scheduleDataSource = new MatTableDataSource<LoanSchedule>();

    accounts$!: Observable<Account[]>;

    disburseForm!: FormGroup;
    repayForm!: FormGroup;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private store: Store<AppState>,
        private fb: FormBuilder,
        private apiService: ApiService
    ) { }

    ngOnInit() {
        this.loanId = this.route.snapshot.paramMap.get('id')!;

        // Dispatch to load schedule
        this.store.dispatch(loadLoanSchedule({ loanId: this.loanId }));

        // Get lookups for forms
        this.accounts$ = this.store.select(selectAllAccounts);

        // Initialise forms
        this.disburseForm = this.fb.group({
            cashAccountId: ['', Validators.required],
            referenceNo: ['']
        });

        this.repayForm = this.fb.group({
            amount: [null, [Validators.required, Validators.min(1)]],
            cashAccountId: ['', Validators.required],
            referenceNo: ['']
        });

        // Select Loan from store
        this.loan$ = this.store.select(selectAllLoans).pipe(
            map(loans => loans?.find(l => l.id === this.loanId))
        );

        // Select member name
        const members$ = this.store.select(selectAllMembers);
        this.memberName$ = combineLatest([this.loan$, members$]).pipe(
            map(([loan, members]) => {
                if (!loan || !members) return 'Unknown Member';
                const m = members.find(m => m.id === loan.memberId);
                return m ? m.fullName : 'Unknown Member';
            })
        );

        // Subscribe to Schedule
        this.store.select(selectScheduleForLoan(this.loanId)).subscribe(schedule => {
            // Sort by installment number
            this.scheduleDataSource.data = [...(schedule ?? [])].sort((a, b) => a.installmentNo - b.installmentNo);
        });

        // Fetch dynamic total due
        this.apiService.getLoanDue(this.loanId).subscribe({
            next: (res) => this.totalDue$.next(res.totalDue),
            error: () => this.totalDue$.next(0)
        });
    }

    goBack() {
        this.router.navigate(['/loans']);
    }

    onDisburse(loanId: string) {
        if (this.disburseForm.invalid) return;
        const req: DisburseRequest = this.disburseForm.value;
        // Dispatch
        this.store.dispatch(disburseLoan({ loanId, payload: req }));
        // Also re-fetch the due amount after disbursement
        setTimeout(() => {
            this.apiService.getLoanDue(loanId).subscribe(res => this.totalDue$.next(res.totalDue));
        }, 1000);
    }

    onRepay(loanId: string) {
        if (this.repayForm.invalid) return;
        const req: RepaymentRequest = this.repayForm.value;
        // Dispatch
        this.store.dispatch(repayLoan({ loanId, payload: req }));
        // Reset form amount
        this.repayForm.patchValue({ amount: null });
        // Re-fetch the due amount and schedule
        setTimeout(() => {
            this.apiService.getLoanDue(loanId).subscribe(res => this.totalDue$.next(res.totalDue));
            this.store.dispatch(loadLoanSchedule({ loanId }));
        }, 1000);
    }
}
