import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, Observable, map } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AppState } from '../../models/state.model';
import { deleteSubcity, loadRegions, loadSubcities, LookupItem } from '../../state/lookups/lookups.actions';
import { selectAllRegions, selectAllSubcities } from '../../state/lookups/lookups.selectors';
import { SubcityFormComponent } from '../subcity-form/subcity-form.component';
import { GenericDetailDialogComponent, DetailDialogData } from '../generic-detail-dialog/generic-detail-dialog.component';

interface SubcityRow extends LookupItem {
  regionName?: string;
}

@Component({
  selector: 'app-subcity-list',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTableModule, MatPaginatorModule, MatDialogModule, MatTooltipModule],
  templateUrl: './subcity-list.component.html',
  styleUrls: ['./subcity-list.component.css']
})
export class SubcityListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['name', 'regionName', 'description', 'actions'];
  dataSource = new MatTableDataSource<SubcityRow>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private store: Store<AppState>, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.store.dispatch(loadRegions());
    this.store.dispatch(loadSubcities());

    combineLatest([
      this.store.select(selectAllSubcities),
      this.store.select(selectAllRegions)
    ]).subscribe(([subcities, regions]) => {
      const rows: SubcityRow[] = (subcities || []).map(s => {
        const region = (regions || []).find(r => r.id === (s as any).state_id);
        return { ...s, regionName: region?.name || 'Unknown' };
      });
      this.dataSource.data = rows;
      this.dataSource.paginator = this.paginator;
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  onAdd() {
    this.dialog.open(SubcityFormComponent, { width: '90vw', maxWidth: '900px' });
  }

  onView(s: SubcityRow) {
    const dialogData: DetailDialogData = {
      title: 'Subcity Details',
      subTitle: s.name,
      icon: 'location_city',
      data: s,
      fields: [
        { key: 'name', label: 'Subcity Name', type: 'text' },
        { key: 'regionName', label: 'Region', type: 'text' },
        { key: 'description', label: 'Description', type: 'text' },
      ]
    };
    this.dialog.open(GenericDetailDialogComponent, { data: dialogData });
  }

  onEdit(s: SubcityRow) {
    this.dialog.open(SubcityFormComponent, { width: '90vw', maxWidth: '900px', data: { item: s } });
  }

  onDelete(s: SubcityRow) {
    if (!s.id) return;
    if (confirm(`Delete subcity "${s.name}"? This cannot be undone.`)) {
      this.store.dispatch(deleteSubcity({ id: s.id }));
    }
  }
}
