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

import { AppState } from '../../models/state.model';
import { deleteRegion, loadRegions } from '../../state/lookups/lookups.actions';
import { selectAllRegions } from '../../state/lookups/lookups.selectors';
import { LookupItem } from '../../state/lookups/lookups.actions';
import { RegionFormComponent } from '../region-form/region-form.component';
import { GenericDetailDialogComponent, DetailDialogData } from '../generic-detail-dialog/generic-detail-dialog.component';

@Component({
  selector: 'app-region-list',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTableModule, MatPaginatorModule, MatDialogModule, MatTooltipModule],
  templateUrl: './region-list.component.html',
  styleUrls: ['./region-list.component.css']
})
export class RegionListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['name', 'description', 'actions'];
  dataSource = new MatTableDataSource<LookupItem>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private store: Store<AppState>, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.store.dispatch(loadRegions());
    this.store.select(selectAllRegions).subscribe(r => {
      this.dataSource.data = r ?? [];
      this.dataSource.paginator = this.paginator;
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  onAdd() {
    this.dialog.open(RegionFormComponent, { width: '90vw', maxWidth: '900px' });
  }

  onView(r: LookupItem) {
    const dialogData: DetailDialogData = {
      title: 'Region Details',
      subTitle: r.name,
      icon: 'map',
      data: r,
      fields: [
        { key: 'name', label: 'Region Name', type: 'text' },
        { key: 'description', label: 'Description', type: 'text' },
      ]
    };
    this.dialog.open(GenericDetailDialogComponent, { data: dialogData });
  }

  onEdit(r: LookupItem) {
    this.dialog.open(RegionFormComponent, { width: '90vw', maxWidth: '900px', data: { item: r } });
  }

  onDelete(r: LookupItem) {
    if (!r.id) return;
    if (confirm(`Delete region "${r.name}"? This cannot be undone.`)) {
      this.store.dispatch(deleteRegion({ id: r.id }));
    }
  }
}
