import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

import { SharedLoanType } from '@sacco/shared-models';
import { AppState } from '../../models/state.model';
import { deleteLoanType, loadLoanTypes } from '../../state/lookups/lookups.actions';
import { selectAllLoanTypes } from '../../state/lookups/lookups.selectors';
import { LoanTypeFormComponent } from '../loan-type-form/loan-type-form.component';
import { GenericDetailDialogComponent, DetailDialogData } from '../generic-detail-dialog/generic-detail-dialog.component';

@Component({
  selector: 'app-loan-type-list',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTableModule, MatPaginatorModule, MatDialogModule, MatTooltipModule],
  templateUrl: './loan-type-list.component.html',
  styleUrls: ['./loan-type-list.component.css']
})
export class LoanTypeListComponent implements OnInit, AfterViewInit {
  types$!: Observable<SharedLoanType[]>;
  displayedColumns: string[] = ['name', 'maxAmount', 'description', 'actions'];
  dataSource = new MatTableDataSource<SharedLoanType>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private store: Store<AppState>, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.store.dispatch(loadLoanTypes());
    this.types$ = this.store.select(selectAllLoanTypes);
    this.types$.subscribe(types => {
      this.dataSource.data = types ?? [];
      this.dataSource.paginator = this.paginator;
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  onAdd() {
    this.dialog.open(LoanTypeFormComponent, { width: '800px' });
  }

  onView(st: SharedLoanType) {
    const dialogData: DetailDialogData = {
      title: 'Loan Type Settings',
      subTitle: st.name,
      icon: 'account_balance',
      data: st,
      fields: [
        { key: 'name', label: 'Type Name', type: 'text' },
        { key: 'loanCode', label: 'Loan Code', type: 'text' },
        { key: 'description', label: 'Description', type: 'text' },
        { key: 'requiredMonths', label: 'Required Save Months', type: 'text' },
        { key: 'requiredSavingPercentage', label: 'Req. Saving %', type: 'text' },
        { key: 'requiredSharePercentage', label: 'Req. Share %', type: 'text' },
        { key: 'requiredShareUnitCount', label: 'Req. Share Units', type: 'text' },
        { key: 'maleInterestAmount', label: 'Male Interest %', type: 'text' },
        { key: 'femaleInterestAmount', label: 'Female Interest %', type: 'text' },
        { key: 'requiredMaximumAmount', label: 'Max Loan Amount', type: 'currency' },
        { key: 'maximumRepaymentMonths', label: 'Max Repayment Term', type: 'text' }
      ]
    };
    this.dialog.open(GenericDetailDialogComponent, { data: dialogData });
  }

  onEdit(st: SharedLoanType) {
    this.dialog.open(LoanTypeFormComponent, { width: '800px', data: { loanType: st } });
  }

  onDelete(st: SharedLoanType) {
    if (!st.id) return;
    if (confirm(`Delete loan type "${st.name}"? This cannot be undone.`)) {
      this.store.dispatch(deleteLoanType({ id: st.id }));
    }
  }
}
