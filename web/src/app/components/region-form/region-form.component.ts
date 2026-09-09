import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { AppState } from '../../models/state.model';
import { addRegion, updateRegion, LookupItem } from '../../state/lookups/lookups.actions';

@Component({
  selector: 'app-region-form',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatDialogModule, ReactiveFormsModule],
  templateUrl: './region-form.component.html',
  styleUrls: ['./region-form.component.css']
})
export class RegionFormComponent implements OnInit {
  form!: FormGroup;
  editMode = false;

  constructor(
    private store: Store<AppState>,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RegionFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { item?: LookupItem }
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      id: [''],
      name: ['', Validators.required],
      description: [''],
    });
    if (this.data?.item) {
      this.editMode = true;
      this.form.patchValue(this.data.item);
    }
  }

  submit() {
    if (this.form.invalid) return;
    const data = { ...this.form.value };
    if (this.editMode && data.id) {
      this.store.dispatch(updateRegion({ region: data as LookupItem }));
    } else {
      delete data.id;
      this.store.dispatch(addRegion({ region: data as LookupItem }));
    }
    this.dialogRef.close(true);
  }

  onCancel() { this.dialogRef.close(); }
}
