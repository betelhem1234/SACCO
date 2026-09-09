import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { ApiService } from '../../services/api.service';
import { Member } from '@sacco/shared-models';

@Component({
  selector: 'app-member-picker',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatButtonModule, MatIconModule, MatTableModule,
    MatDialogModule, MatFormFieldModule, MatInputModule,
    MatProgressSpinnerModule, MatRadioModule,
  ],
  templateUrl: './member-picker.component.html',
  styleUrls: ['./member-picker.component.css']
})
export class MemberPickerComponent implements OnInit {
  allMembers: Member[] = [];
  filteredMembers: Member[] = [];
  loading = true;
  selectedId: string | null = null;
  selectedMember: Member | null = null;
  searchCtrl = new UntypedFormControl();
  dataSource = new MatTableDataSource<Member>();
  displayedColumns = ['select', 'name', 'phone', 'memberid'];

  constructor(
    private apiService: ApiService,
    private dialogRef: MatDialogRef<MemberPickerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title?: string; memberType?: number }
  ) {}

  ngOnInit(): void {
    this.loadMembers();
    this.searchCtrl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.filterMembers());
  }

  loadMembers(): void {
    this.loading = true;
    this.apiService.getMembers().subscribe({
      next: (members) => {
        this.allMembers = members || [];
        if (this.data?.memberType != null) {
          this.allMembers = this.allMembers.filter(m => m.memberType === this.data.memberType);
        }
        this.filterMembers();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  filterMembers(): void {
    const query = (this.searchCtrl.value || '').toLowerCase().trim();
    if (!query) {
      this.filteredMembers = [...this.allMembers];
    } else {
      this.filteredMembers = this.allMembers.filter(m =>
        (m.fullName?.toLowerCase() || '').includes(query) ||
        (m.telephone || '').includes(query) ||
        (m.memberid || m.idNumbe || '').toLowerCase().includes(query)
      );
    }
    this.dataSource.data = this.filteredMembers;
  }

  select(): void {
    if (this.selectedMember) {
      this.dialogRef.close(this.selectedMember);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
