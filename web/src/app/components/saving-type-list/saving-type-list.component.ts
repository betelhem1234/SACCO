import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, map, Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

import { SavingType } from '@sacco/shared-models';
import { AppState } from '../../models/state.model';
import { deleteSavingType, loadSavingTypes } from '../../state/lookups/lookups.actions';
import { selectAllAccounts, selectAllSavingTypes } from '../../state/lookups/lookups.selectors';
import { SavingTypeFormComponent } from '../saving-type-form/saving-type-form.component';
import { SavingTypeHistoryDialogComponent } from '../saving-type-history-dialog/saving-type-history-dialog.component';
import { GenericDetailDialogComponent, DetailDialogData } from '../generic-detail-dialog/generic-detail-dialog.component';

function etb(value: number | null | undefined): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'ETB',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(value ?? 0));
}

@Component({
  selector: 'app-saving-type-list',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTableModule, MatPaginatorModule, MatDialogModule, MatTooltipModule],
  templateUrl: './saving-type-list.component.html',
  styleUrls: ['./saving-type-list.component.css']
})
export class SavingTypeListComponent implements OnInit, AfterViewInit {
  readonly etb = etb;
  types$!: Observable<SavingType[]>;
  displayedColumns: string[] = ['name', 'accountName', 'amount', 'description', 'actions'];
  dataSource = new MatTableDataSource<SavingType>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private store: Store<AppState>, private dialog: MatDialog) { }

  ngOnInit(): void {
    // this.store.dispatch(loadSavingTypes());
    const accounts$ = this.store.select(selectAllAccounts);
    const types$ = this.store.select(selectAllSavingTypes);

    this.types$ = combineLatest([types$, accounts$]).pipe(
      map(([types, accounts]) => {
        return (types || []).map(type => {
          const account = accounts?.find(a => a.id === type.accountId);
          const accountDisplayName = account
            ? `${account.name}${account.accountNumber ? ' · ' + account.accountNumber : ''}`
            : 'Unknown account';
          return {
            ...type,
            accountDisplayName
          };
        });

      })
    );

    this.types$.subscribe(types => {
      this.dataSource.data = types ?? [];
      this.dataSource.paginator = this.paginator;
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  onAdd() {
    this.dialog.open(SavingTypeFormComponent, { width: '90vw', maxWidth: '900px' });
  }

  onHistory(st: SavingType) {
    this.dialog.open(SavingTypeHistoryDialogComponent, {
      width: '90vw',
      maxWidth: '560px',
      autoFocus: false,
      data: { savingTypeId: st.id, name: st.name },
    });
  }

  onView(st: any) {
    const dialogData: DetailDialogData = {
      title: 'Saving Type Details',
      subTitle: st.name,
      icon: 'savings',
      data: st,
      fields: [
        { key: 'name', label: 'Type Name', type: 'text' },
        { key: 'accountDisplayName', label: 'Associated Account', type: 'text' },
        { key: 'description', label: 'Description', type: 'text' },
      ]
    };
    this.dialog.open(GenericDetailDialogComponent, { data: dialogData });
  }

  onEdit(st: SavingType) {
    this.dialog.open(SavingTypeFormComponent, { width: '90vw', maxWidth: '900px', data: { savingType: st } });
  }

  onDelete(st: SavingType) {
    if (!st.id) return;
    if (confirm(`Delete saving type "${st.name}"? This cannot be undone.`)) {
      this.store.dispatch(deleteSavingType({ id: st.id }));
    }
  }
}
