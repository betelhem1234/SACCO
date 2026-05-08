import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { Member } from '@sacco/shared-models';
import { AppState } from '../../models/state.model';
import { deleteMember } from '../../state/members.actions';
import { selectAllMembers } from '../../state/members.selectors';
import { MemberFormComponent } from '../member-form/member-form.component';
import { GenericDetailDialogComponent, DetailDialogData } from '../generic-detail-dialog/generic-detail-dialog.component';

@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDialogModule
  ],
  template: `
    <section class="p-6" style="background:#f0f4f8;min-height:100%">
      <div class="max-w-7xl mx-auto">

        <!-- Page Header -->
        <div class="flex justify-between items-center mb-6">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                 style="background:linear-gradient(135deg,#3b82f6,#1d4ed8)">
              <span class="material-icons text-white" style="font-size:20px">group</span>
            </div>
            <div>
              <h1 class="text-xl font-bold" style="color:#1e293b">Member Registry</h1>
              <p class="text-xs" style="color:#64748b">Manage cooperative members</p>
            </div>
          </div>
          <button (click)="onAdd()"
                  class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-0 cursor-pointer"
                  style="background:linear-gradient(135deg,#3b82f6,#1d4ed8);color:white;box-shadow:0 4px 12px rgba(59,130,246,0.35)">
            <span class="material-icons" style="font-size:18px">person_add</span>
            Add Member
          </button>
        </div>

        <!-- Table Card -->
        <div class="bg-white rounded-2xl overflow-hidden shadow-sm border" style="border-color:#e2e8f0">
          <table mat-table [dataSource]="dataSource" class="w-full">

            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef class="pl-6">ID</th>
              <td mat-cell *matCellDef="let member" class="pl-6">
                <span class="text-sm font-mono font-semibold" style="color:#1e3a5f">{{ member.idNumbe }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="fullName">
              <th mat-header-cell *matHeaderCellDef>Full Name</th>
              <td mat-cell *matCellDef="let member">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                       style="background:linear-gradient(135deg,#3b82f6,#1d4ed8)">
                    {{ (member.fullName || '?').charAt(0).toUpperCase() }}
                  </div>
                  <span class="text-sm font-medium" style="color:#1e293b">{{ member.fullName }}</span>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef>Email</th>
              <td mat-cell *matCellDef="let member">
                <span class="text-sm" style="color:#475569">{{ member.email }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="phone">
              <th mat-header-cell *matHeaderCellDef>Phone</th>
              <td mat-cell *matCellDef="let member">
                <span class="text-sm font-mono" style="color:#475569">{{ member.phone }}</span>
              </td>
            </ng-container>

              <ng-container matColumnDef="member_type">
              <th mat-header-cell *matHeaderCellDef>Member Type</th>
              <td mat-cell *matCellDef="let member">
                <span class="text-sm font-mono" style="color:#475569">{{ member.memberType }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="is_male">
              <th mat-header-cell *matHeaderCellDef>Gender</th>
              <td mat-cell *matCellDef="let member">
                <span class="text-sm font-mono" style="color:#475569">{{ member.isMale?"Male":"Female" }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let member">
                <div class="flex items-center gap-1">
                  <button mat-icon-button (click)="onView(member)" class="!w-8 !h-8" style="color:#059669">
                    <span class="material-icons" style="font-size:18px">visibility</span>
                  </button>
                  <button mat-icon-button (click)="onEdit(member)" class="!w-8 !h-8" style="color:#1e3a5f">
                    <span class="material-icons" style="font-size:18px">edit</span>
                  </button>
                  <button mat-icon-button (click)="onDelete(member.id)" class="!w-8 !h-8" style="color:#ef4444">
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
            <span class="material-icons mb-3" style="font-size:48px;color:#cbd5e1">group</span>
            <p class="font-medium" style="color:#64748b">No members registered yet</p>
            <p class="text-sm mt-1" style="color:#94a3b8">Click "Add Member" to register the first member</p>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: []
})
export class MemberListComponent implements OnInit {
  members$!: Observable<Member[]>;
  displayedColumns: string[] = ['id', 'fullName', 'email', 'phone', 'is_male', 'member_type', 'actions'];
  dataSource = new MatTableDataSource<Member>();

  constructor(private store: Store<AppState>, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.members$ = this.store.select(selectAllMembers);
    this.members$.subscribe(members => {
      this.dataSource.data = members ?? [];
    });
  }

  onAdd() { this.openMemberDialog(); }
  onEdit(member: Member) { this.openMemberDialog(member); }

  onView(member: Member) {
    const dialogData: DetailDialogData = {
      title: 'Member Details',
      subTitle: member.fullName,
      icon: 'person',
      data: member,
      fields: [
        { key: 'idNumbe', label: 'Member ID', type: 'text' },
        { key: 'fullName', label: 'Full Name', type: 'text' },
        { key: 'email', label: 'Email', type: 'text' },
        { key: 'phone', label: 'Phone', type: 'text' },
        { key: 'isMale', label: 'Gender', type: 'custom', formatFn: (val) => val ? 'Male' : 'Female' },
        { key: 'memberType', label: 'Member Type', type: 'text' },
        { key: 'membersipStatus', label: 'Membership Status', type: 'text' },
        { key: 'branchId', label: 'Branch ID', type: 'text' },
        { key: 'birthDate', label: 'Birth Date', type: 'date' },
        { key: 'registrationDate', label: 'Registration Date', type: 'date' },
      ]
    };
    this.dialog.open(GenericDetailDialogComponent, { data: dialogData });
  }

  private openMemberDialog(member?: Member) {
    this.dialog.open(MemberFormComponent, { width: '500px', data: { member } });
  }

  onDelete(id: string) {
    if (confirm('Are you sure you want to delete this member?')) {
      this.store.dispatch(deleteMember({ id }));
    }
  }
}
