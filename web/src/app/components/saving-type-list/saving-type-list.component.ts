import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { SavingType } from '@sacco/shared-models';
import { AppState } from '../../models/state.model';
import { loadSavingTypes } from '../../state/lookups.actions';
import { selectAllSavingTypes } from '../../state/lookups.selectors';
import { SavingTypeFormComponent } from '../saving-type-form/saving-type-form.component';

@Component({
    selector: 'app-saving-type-list',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule, MatTableModule, MatDialogModule],
    template: `
    <section class="p-6" style="background:#f0f4f8;min-height:100%">
      <div class="max-w-7xl mx-auto">
        <div class="flex justify-between items-center mb-6">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background:linear-gradient(135deg,#3b82f6,#1d4ed8)">
              <span class="material-icons text-white" style="font-size:20px">savings</span>
            </div>
            <div>
              <h1 class="text-xl font-bold" style="color:#1e293b">Saving Types Register</h1>
              <p class="text-xs" style="color:#64748b">Manage saving types</p>
            </div>
          </div>
          <button (click)="onAdd()" class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-0 cursor-pointer text-white" style="background:linear-gradient(135deg,#3b82f6,#1d4ed8)">
            <span class="material-icons" style="font-size:18px">add</span> Add Saving Type
          </button>
        </div>

        <div class="bg-white rounded-2xl overflow-hidden shadow-sm border" style="border-color:#e2e8f0">
          <table mat-table [dataSource]="dataSource" class="w-full">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef class="pl-6">Type Name</th>
              <td mat-cell *matCellDef="let st" class="pl-6 font-medium">{{ st.name }}</td>
            </ng-container>
            <ng-container matColumnDef="description">
              <th mat-header-cell *matHeaderCellDef>Description</th>
              <td mat-cell *matCellDef="let st">{{ st.description }}</td>
            </ng-container>
            
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
          <div *ngIf="dataSource.data.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
            <p class="font-medium" style="color:#64748b">No saving types registered yet</p>
          </div>
        </div>
      </div>
    </section>
  `,
    styles: []
})
export class SavingTypeListComponent implements OnInit {
    types$!: Observable<SavingType[]>;
    displayedColumns: string[] = ['name', 'description'];
    dataSource = new MatTableDataSource<SavingType>();

    constructor(private store: Store<AppState>, private dialog: MatDialog) { }

    ngOnInit(): void {
        this.store.dispatch(loadSavingTypes());
        this.types$ = this.store.select(selectAllSavingTypes);
        this.types$.subscribe(types => this.dataSource.data = types ?? []);
    }

    onAdd() {
        this.dialog.open(SavingTypeFormComponent, { width: '500px' });
    }
}
