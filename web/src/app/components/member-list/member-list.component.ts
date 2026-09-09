import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

import { Member } from '@sacco/shared-models';
import { AppState } from '../../models/state.model';
import { deleteMember } from '../../state/members/members.actions';
import { selectMembersStatus } from '../../state/members/members.selectors';
import { MemberFormComponent } from '../member-form/member-form.component';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatMenuModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    RouterModule,
  ],
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.css'],
})
export class MemberListComponent implements OnInit, AfterViewInit {
  membersData: Member[] = [];
  membersTotalCount: number = 0;
  membersIsLoading: boolean = false;

  membersDisplayedColumns: string[] = [
    'action',
    'memberid',
    'fullName',
    'is_male',
    'telephone',
    'membership_date',
    'member_branch_id',
    'member_type',
  ];

  searchTextCtrl = new UntypedFormControl();
  memberIdCtrl = new UntypedFormControl();
  memberTypeFilter: number = -1;
  genderFilter: number = -1;
  statusFilter: number = -1;
  branchFilter: string = '';

  memberTypes = [
    { id: -1, name: 'All' },
    { id: 1, name: 'Normal' },
    { id: 0, name: 'Child' },
    { id: 2, name: 'Company/Group' },
  ];
  genderTypes = [
    { id: -1, name: 'All' },
    { id: 1, name: 'Male' },
    { id: 0, name: 'Female' },
  ];
  statusTypes = [
    { id: -1, name: 'All' },
    { id: 1, name: 'Active' },
    { id: 0, name: 'Inactive' },
    { id: 2, name: 'Pending' },
    { id: 3, name: 'Frozen' },
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<Member>();

  private searchSubject = new Subject<void>();

  constructor(
    private store: Store<AppState>,
    private dialog: MatDialog,
    private apiService: ApiService
  ) {
    this.searchTextCtrl.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(() => this.searchMembers());
    this.memberIdCtrl.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(() => this.searchMembers());
  }

  ngOnInit(): void {
    this.store.select(selectMembersStatus).subscribe(status => {
      this.membersIsLoading = status === 'loading';
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    setTimeout(() => this.searchMembers());
  }

  searchMembers(): void {
    this.membersIsLoading = true;

    this.apiService.getMembers().subscribe({
      next: (result) => {
        const members = result || [];
        const searchText = (this.searchTextCtrl.value || '').toLowerCase();
        const memberId = (this.memberIdCtrl.value || '').toLowerCase();

        let filtered = members;

        if (searchText) {
          filtered = filtered.filter(m =>
            (m.fullName?.toLowerCase() || '').includes(searchText) ||
            (m.telephone || '').includes(searchText) ||
            (m.email || '').toLowerCase().includes(searchText)
          );
        }

        if (memberId) {
          filtered = filtered.filter(m =>
            (m.idNumbe || m.memberid || '').toString().toLowerCase().includes(memberId)
          );
        }

        if (this.memberTypeFilter >= 0) {
          filtered = filtered.filter(m => {
            const mt = m.memberType ?? m.member_type;
            return mt === this.memberTypeFilter;
          });
        }

        if (this.genderFilter >= 0) {
          filtered = filtered.filter(m => {
            const isMale = m.isMale != null ? m.isMale : m.is_male;
            return (isMale ? 1 : 0) === this.genderFilter;
          });
        }

        if (this.statusFilter >= 0) {
          filtered = filtered.filter(m => {
            const status = m.membersipStatus ?? m.status ?? 1;
            return status === this.statusFilter;
          });
        }

        this.membersData = filtered;
        this.dataSource.data = filtered;
        this.membersTotalCount = filtered.length;
        if (this.paginator) {
          this.paginator.length = filtered.length;
          this.paginator.pageIndex = 0;
        }
        this.dataSource.paginator = this.paginator;
        this.membersIsLoading = false;
      },
      error: () => {
        this.membersIsLoading = false;
      }
    });
  }

  fullName(member: Member): string {
    return member.fullName || '';
  }

  getBranchName(branchId: string): string {
    return branchId ? branchId.substring(0, 8) + '...' : '-';
  }

  onAdd(): void {
    const dialogRef = this.dialog.open(MemberFormComponent, {
      width: '90vw',
      maxWidth: '1400px',
      data: { mode: 'new' },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.searchMembers();
    });
  }

  onAddCompany(): void {
    const dialogRef = this.dialog.open(MemberFormComponent, {
      width: '90vw',
      maxWidth: '1400px',
      data: { mode: 'new', memberType: 2 },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.searchMembers();
    });
  }

  onAddChild(): void {
    const dialogRef = this.dialog.open(MemberFormComponent, {
      width: '90vw',
      maxWidth: '1400px',
      data: { mode: 'new', memberType: 0 },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.searchMembers();
    });
  }

  onEdit(member: Member): void {
    const dialogRef = this.dialog.open(MemberFormComponent, {
      width: '90vw',
      maxWidth: '1400px',
      data: { mode: 'edit', member },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.searchMembers();
    });
  }

  onDelete(member: Member): void {
    if (confirm(`Are you sure you want to delete ${this.fullName(member)}?`)) {
      this.store.dispatch(deleteMember({ id: member.id }));
      this.searchMembers();
    }
  }

  onReverse(member: Member): void {
    if (confirm('Reverse this member?')) {
      this.apiService.memberDo(member.id, 'reverse_member').subscribe({
        next: () => {
          this.searchMembers();
        }
      });
    }
  }

  onFreeze(member: Member): void {
    const reason = prompt('Enter reason for freezing account:');
    if (reason) {
      this.apiService.memberDo(member.id, 'frozen_account', { reason }).subscribe({
        next: () => {
          this.searchMembers();
        }
      });
    }
  }

  onUnfreeze(member: Member): void {
    if (confirm('Unfreeze this account?')) {
      this.apiService.memberDo(member.id, 'unfrozen_account').subscribe({
        next: () => {
          this.searchMembers();
        }
      });
    }
  }

  onConfirmationEmail(member: Member): void {
    this.apiService.emailConfirmation(member.id).subscribe({
      next: () => alert('Confirmation email sent.')
    });
  }

  isAdultChild(member: Member): boolean {
    if (member.memberType === 0 && member.birthDate) {
      const age = Math.floor((Date.now() - member.birthDate) / (365.25 * 24 * 60 * 60 * 1000));
      return age >= 18;
    }
    return false;
  }

  onTransferToAdult(member: Member): void {
    if (confirm('Transfer this child member to adult?')) {
      this.apiService.memberDo(member.id, 'transfer_to_adult').subscribe({
        next: () => this.searchMembers()
      });
    }
  }

  uploadExcel(event: any): void {
    const file = event.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    this.membersIsLoading = true;
    this.apiService.uploadExcel(fd).subscribe({
      next: () => {
        this.searchMembers();
      },
      error: () => {
        this.membersIsLoading = false;
      }
    });
  }

  uploadGroupExcel(event: any): void {
    const file = event.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    this.membersIsLoading = true;
    this.apiService.uploadGroupExcel(fd).subscribe({
      next: () => {
        this.searchMembers();
      },
      error: () => {
        this.membersIsLoading = false;
      }
    });
  }

  onBulkSms(): void {
    alert('Bulk SMS feature - would open SMS dialog');
  }

  onBulkEmail(): void {
    alert('Bulk Email feature - would open email dialog');
  }

  onSortChange(): void {
    this.paginator.pageIndex = 0;
    this.searchMembers();
  }


}
