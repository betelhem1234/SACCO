import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Saving, Member, Bank, SavingType } from '@sacco/shared-models';
import { AppState } from '../../models/state.model';
import { deleteSaving } from '../../state/savings.actions';
import { selectAllSavings } from '../../state/savings.selectors';
import { selectAllMembers } from '../../state/members.selectors';
import { selectAllBanks, selectAllSavingTypes } from '../../state/lookups.selectors';
import { combineLatest, map } from 'rxjs';
import { SavingFormComponent } from '../saving-form/saving-form.component';

interface EnrichedSaving extends Saving {
  memberName: string;
  savingTypeName: string;
  bankName: string;
}

@Component({
  selector: 'app-saving-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDialogModule,
    MatTooltipModule
  ],
  template: `
    <section class="p-6" style="background:#f0f4f8;min-height:100%">
      <div class="max-w-7xl mx-auto">

        <!-- Page Header -->
        <div class="flex justify-between items-center mb-6">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                 style="background:linear-gradient(135deg,#10b981,#059669)">
              <span class="material-icons text-white" style="font-size:20px">savings</span>
            </div>
            <div>
              <h1 class="text-xl font-bold" style="color:#1e293b">Savings Management</h1>
              <p class="text-xs" style="color:#64748b">Record and manage member savings</p>
            </div>
          </div>
          <button (click)="onAdd()"
                  class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-0 cursor-pointer transition-all duration-200"
                  style="background:linear-gradient(135deg,#10b981,#059669);color:white;box-shadow:0 4px 12px rgba(16,185,129,0.35)">
            <span class="material-icons" style="font-size:18px">add</span>
            Record Saving
          </button>
        </div>

        <!-- Table Card -->
        <div class="bg-white rounded-2xl overflow-hidden shadow-sm border" style="border-color:#e2e8f0">
          <table mat-table [dataSource]="dataSource" class="w-full">

            <ng-container matColumnDef="memberId">
              <th mat-header-cell *matHeaderCellDef class="pl-6">Member ID</th>
              <td mat-cell *matCellDef="let saving" class="pl-6">
                <span class="text-sm font-mono font-semibold" style="color:#1e3a5f">{{ saving.memberId }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="memberName">
              <th mat-header-cell *matHeaderCellDef>Member Name</th>
              <td mat-cell *matCellDef="let saving">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                       style="background:linear-gradient(135deg,#1e3a5f,#2d5282)">
                    {{ (saving.memberName || '?').charAt(0).toUpperCase() }}
                  </div>
                  <span class="text-sm font-medium" style="color:#1e293b">{{ saving.memberName }}</span>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="savingType">
              <th mat-header-cell *matHeaderCellDef>Type</th>
              <td mat-cell *matCellDef="let saving">
                <span class="px-2.5 py-1 rounded-full text-xs font-semibold"
                      [ngStyle]="getTypeBadgeStyle(saving.savingType)">
                  {{ saving.savingTypeName }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="bankName">
              <th mat-header-cell *matHeaderCellDef>Bank</th>
              <td mat-cell *matCellDef="let saving">
                <span class="text-xs font-mono px-2 py-0.5 rounded" style="background:#f1f5f9;color:#475569">
                  {{ saving.bankName }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef>Amount</th>
              <td mat-cell *matCellDef="let saving">
                <span class="text-sm font-bold" style="color:#059669">
                  {{ saving.savingAmount | currency:'ETB':'symbol':'1.2-2' }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="ftp">
              <th mat-header-cell *matHeaderCellDef>FTP Ref</th>
              <td mat-cell *matCellDef="let saving">
                <span class="text-xs font-mono px-2 py-0.5 rounded" style="background:#f1f5f9;color:#475569">
                  {{ saving.ftp }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let saving">
                <span class="text-sm" style="color:#64748b">{{ saving.savingDate | date }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let saving">
                <div class="flex items-center gap-1">
                  <button mat-icon-button matTooltip="Print CRV" (click)="onPrint(saving)"
                          class="!w-8 !h-8" style="color:#1e3a5f">
                    <span class="material-icons" style="font-size:18px">print</span>
                  </button>
                  <button mat-icon-button matTooltip="Delete" (click)="onDelete(saving.id)"
                          class="!w-8 !h-8" style="color:#ef4444">
                    <span class="material-icons" style="font-size:18px">delete_outline</span>
                  </button>
                </div>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"
                class="transition-all duration-150 cursor-pointer"></tr>
          </table>

          <div *ngIf="dataSource.data.length === 0"
               class="flex flex-col items-center justify-center py-16 text-center">
            <span class="material-icons mb-3" style="font-size:48px;color:#cbd5e1">savings</span>
            <p class="font-medium" style="color:#64748b">No savings recorded yet</p>
            <p class="text-sm mt-1" style="color:#94a3b8">Click "Record Saving" to get started</p>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: []
})
export class SavingListComponent implements OnInit {
  savings$!: Observable<EnrichedSaving[]>;
  displayedColumns: string[] = ['memberId', 'memberName', 'savingType', 'bankName', 'amount', 'ftp', 'date', 'actions'];
  dataSource = new MatTableDataSource<EnrichedSaving>();

  constructor(private store: Store<AppState>, private dialog: MatDialog) { }

  ngOnInit(): void {
    const rawSavings$ = this.store.select(selectAllSavings);
    const members$ = this.store.select(selectAllMembers);
    const savingTypes$ = this.store.select(selectAllSavingTypes);
    const banks$ = this.store.select(selectAllBanks);

    this.savings$ = combineLatest([rawSavings$, members$, savingTypes$, banks$]).pipe(
      map(([savings, members, types, banks]) => {
        return (savings || []).map(saving => {
          const member = members?.find(m => m.id === saving.memberId);
          const type = types?.find(t => t.id === saving.savingType);
          const bank = banks?.find(b => b.id === saving.bankId);
          return {
            ...saving,
            memberName: member ? member.fullName : 'Unknown Member',
            savingTypeName: type ? type.name : 'Unknown Type',
            bankName: bank ? bank.name : 'Unknown Bank'
          };
        });
      })
    );

    this.savings$.subscribe(savings => {
      this.dataSource.data = savings;
    });
  }

  getTypeBadgeStyle(typeId: string): Record<string, string> {
    return { background: '#dbeafe', color: '#1d4ed8' };
  }

  onAdd() {
    this.dialog.open(SavingFormComponent, { width: '500px' });
  }

  onPrint(saving: EnrichedSaving) {
    window.alert(`Printing CRV for ${saving.memberName} - Amount: ${saving.savingAmount}`);
  }

  onDelete(id: string) {
    if (confirm('Are you sure you want to delete this record?')) {
      this.store.dispatch(deleteSaving({ id }));
    }
  }
}
