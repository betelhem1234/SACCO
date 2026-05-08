import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

import { SharedLoanType } from '@sacco/shared-models';
import { AppState } from '../../models/state.model';
import { deleteLoanType, loadLoanTypes } from '../../state/lookups.actions';
import { selectAllLoanTypes } from '../../state/lookups.selectors';
import { LoanTypeFormComponent } from '../loan-type-form/loan-type-form.component';
import { GenericDetailDialogComponent, DetailDialogData } from '../generic-detail-dialog/generic-detail-dialog.component';

@Component({
  selector: 'app-loan-type-list',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTableModule, MatDialogModule, MatTooltipModule],
  template: `
    <section class="p-6" style="background:#f0f4f8;min-height:100%">
      <div class="max-w-7xl mx-auto">
        <div class="flex justify-between items-center mb-6">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background:linear-gradient(135deg,#3b82f6,#1d4ed8)">
              <span class="material-icons text-white" style="font-size:20px">account_balance</span>
            </div>
            <div>
              <h1 class="text-xl font-bold" style="color:#1e293b">Loan Types Register</h1>
              <p class="text-xs" style="color:#64748b">Manage loan types</p>
            </div>
          </div>
          <button (click)="onAdd()" class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-0 cursor-pointer text-white" style="background:linear-gradient(135deg,#3b82f6,#1d4ed8)">
            <span class="material-icons" style="font-size:18px">add</span> Add Loan Type
          </button>
        </div>

        <div class="bg-white rounded-2xl overflow-hidden shadow-sm border" style="border-color:#e2e8f0">
          <table mat-table [dataSource]="dataSource" class="w-full">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef class="pl-6">Type Name</th>
              <td mat-cell *matCellDef="let st" class="pl-6 font-medium">{{ st.name }}</td>
            </ng-container>
            <ng-container matColumnDef="maxAmount">
              <th mat-header-cell *matHeaderCellDef>Max Amount</th>
              <td mat-cell *matCellDef="let type">{{ type.requiredMaximumAmount }}</td>
            </ng-container>
            <ng-container matColumnDef="description">
              <th mat-header-cell *matHeaderCellDef>Description</th>
              <td mat-cell *matCellDef="let st">{{ st.description }}</td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef class="text-right pr-6">Actions</th>
              <td mat-cell *matCellDef="let st" class="text-right pr-6 gap-1">
                <button mat-icon-button matTooltip="View" (click)="onView(st)" class="!w-8 !h-8" style="color:#059669">
                  <span class="material-icons" style="font-size:18px">visibility</span>
                </button>
                <button mat-icon-button matTooltip="Edit" (click)="onEdit(st)" class="!w-8 !h-8" style="color:#1e3a5f">
                  <span class="material-icons" style="font-size:18px">edit</span>
                </button>
                <button mat-icon-button matTooltip="Delete" (click)="onDelete(st)" class="!w-8 !h-8" style="color:#ef4444">
                  <span class="material-icons" style="font-size:18px">delete_outline</span>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
          <div *ngIf="dataSource.data.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
            <p class="font-medium" style="color:#64748b">No loan types registered yet</p>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: []
})
export class LoanTypeListComponent implements OnInit {
  types$!: Observable<SharedLoanType[]>;
  displayedColumns: string[] = ['name', 'maxAmount', 'description', 'actions'];
  dataSource = new MatTableDataSource<SharedLoanType>();

  constructor(private store: Store<AppState>, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.store.dispatch(loadLoanTypes());
    this.types$ = this.store.select(selectAllLoanTypes);
    this.types$.subscribe(types => this.dataSource.data = types ?? []);
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
