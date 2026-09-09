import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatTableModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  displayedColumns: string[] = ['fullName', 'email', 'role', 'status', 'actions'];
  users: any[] = [];
  showAddForm = false;
  editUserId: string | null = null;
  userForm: FormGroup;

  constructor(private http: HttpClient, private snackBar: MatSnackBar, private fb: FormBuilder) {
    this.userForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      username: ['', Validators.required],
      roleType: ['ACCOUNTANT', Validators.required],
      status: ['ACTIVE', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  ngOnInit() {
    this.loadUsers();
  }

  toggleForm() {
    if (this.showAddForm) {
      this.resetForm();
    } else {
      this.showAddForm = true;
    }
  }

  loadUsers() {
    this.http.get<any[]>('/sacco/api/users').subscribe({
      next: (data) => this.users = data,
      error: (err) => this.snackBar.open('Failed to load users', 'Close', { duration: 3000 })
    });
  }

  editUser(user: any) {
    this.editUserId = user.id;
    this.userForm.patchValue({
      fullName: user.fullName,
      email: user.email,
      username: user.username,
      roleType: user.role?.name || 'ACCOUNTANT',
      status: user.status || 'ACTIVE',
      password: ''
    });
    // Password is not required when editing
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.showAddForm = true;
  }

  saveUser() {
    if (this.userForm.valid) {
      if (this.editUserId) {
        // Update user
        const updatePayload = { ...this.userForm.value };
        if (!updatePayload.password) delete updatePayload.password;

        this.http.put(`/sacco/api/users/${this.editUserId}`, updatePayload).subscribe({
          next: () => {
            this.snackBar.open('User updated successfully!', 'Close', { duration: 3000 });
            this.resetForm();
          },
          error: () => this.snackBar.open('Failed to update user', 'Close', { duration: 4000 })
        });
      } else {
        // Create user
        this.http.post('/sacco/api/users', this.userForm.value).subscribe({
          next: () => {
            this.snackBar.open('User successfully registered!', 'Close', { duration: 3000 });
            this.resetForm();
          },
          error: (err) => {
            this.snackBar.open('Failed to create user (Check Email/Username uniqueness)', 'Close', { duration: 4000 });
          }
        });
      }
    }
  }

  resetForm() {
    this.showAddForm = false;
    this.editUserId = null;
    this.userForm.reset({ roleType: 'ACCOUNTANT', status: 'ACTIVE' });
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.loadUsers();
  }

  deleteUser(id: string) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.http.delete(`/api/users/${id}`).subscribe({
        next: () => {
          this.snackBar.open('User deleted successfully', 'Close', { duration: 3000 });
          this.loadUsers();
        },
        error: () => this.snackBar.open('Error deleting user', 'Close', { duration: 3000 })
      });
    }
  }
}
