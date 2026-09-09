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
import { deleteEducation, loadEducations, LookupItem } from '../../state/lookups/lookups.actions';
import { selectAllEducations } from '../../state/lookups/lookups.selectors';
import { EducationFormComponent } from '../education-form/education-form.component';
import { GenericDetailDialogComponent, DetailDialogData } from '../generic-detail-dialog/generic-detail-dialog.component';

@Component({
  selector: 'app-education-list',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTableModule, MatPaginatorModule, MatDialogModule, MatTooltipModule],
  templateUrl: './education-list.component.html',
  styleUrls: ['./education-list.component.css']
})
export class EducationListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['name', 'description', 'actions'];
  dataSource = new MatTableDataSource<LookupItem>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private store: Store<AppState>, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.store.dispatch(loadEducations());
    this.store.select(selectAllEducations).subscribe(e => {
      this.dataSource.data = e ?? [];
      this.dataSource.paginator = this.paginator;
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  onAdd() {
    this.dialog.open(EducationFormComponent, { width: '90vw', maxWidth: '900px' });
  }

  onView(e: LookupItem) {
    const dialogData: DetailDialogData = {
      title: 'Education Level Details',
      subTitle: e.name,
      icon: 'school',
      data: e,
      fields: [
        { key: 'name', label: 'Education Level', type: 'text' },
        { key: 'description', label: 'Description', type: 'text' },
      ]
    };
    this.dialog.open(GenericDetailDialogComponent, { data: dialogData });
  }

  onEdit(e: LookupItem) {
    this.dialog.open(EducationFormComponent, { width: '90vw', maxWidth: '900px', data: { item: e } });
  }

  onDelete(e: LookupItem) {
    if (!e.id) return;
    if (confirm(`Delete education level "${e.name}"? This cannot be undone.`)) {
      this.store.dispatch(deleteEducation({ id: e.id }));
    }
  }
}
