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

import { AccountClassification, accountTypeLabel } from '@sacco/shared-models';
import { AppState } from '../../models/state.model';
import { deleteAccountClassification, loadAccountClassifications } from '../../state/lookups/lookups.actions';
import { selectAllAccountClassifications } from '../../state/lookups/lookups.selectors';
import { AccountClassificationFormComponent } from '../account-classification-form/account-classification-form.component';
import { GenericDetailDialogComponent, DetailDialogData } from '../generic-detail-dialog/generic-detail-dialog.component';

@Component({
  selector: 'app-account-classification-list',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTableModule, MatPaginatorModule, MatDialogModule, MatTooltipModule],
  templateUrl: './account-classification-list.component.html',
  styleUrls: ['./account-classification-list.component.css']
})
export class AccountClassificationListComponent implements OnInit, AfterViewInit {
  types$!: Observable<AccountClassification[]>;
  displayedColumns: string[] = ['name', 'accountType', 'description', 'actions'];
  dataSource = new MatTableDataSource<AccountClassification>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private store: Store<AppState>, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.store.dispatch(loadAccountClassifications());
    this.types$ = this.store.select(selectAllAccountClassifications);

    this.types$.subscribe(types => {
      this.dataSource.data = types ?? [];
      this.dataSource.paginator = this.paginator;
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  accountTypeLabel(t: any): string {
    return accountTypeLabel(t);
  }

  onAdd() {
    this.dialog.open(AccountClassificationFormComponent, { width: '90vw', maxWidth: '900px' });
  }

  onView(item: AccountClassification) {
    const dialogData: DetailDialogData = {
      title: 'Account Classification Details',
      subTitle: item.name,
      icon: 'category',
      data: { ...item, accountTypeLabel: accountTypeLabel(item.accountType) },
      fields: [
        { key: 'name', label: 'Name', type: 'text' },
        { key: 'accountTypeLabel', label: 'Account Type', type: 'text' },
        { key: 'description', label: 'Description', type: 'text' },
      ]
    };
    this.dialog.open(GenericDetailDialogComponent, { data: dialogData });
  }

  onEdit(item: AccountClassification) {
    this.dialog.open(AccountClassificationFormComponent, { width: '90vw', maxWidth: '900px', data: { accountClassification: item } });
  }

  onDelete(item: AccountClassification) {
    if (!item.id) return;
    if (confirm(`Delete account classification "${item.name}"? This cannot be undone.`)) {
      this.store.dispatch(deleteAccountClassification({ id: item.id }));
    }
  }
}
