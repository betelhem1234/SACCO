import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { AppState } from '../../models/state.model';
import { addSubcity, loadRegions, updateSubcity, LookupItem } from '../../state/lookups/lookups.actions';
import { selectAllRegions } from '../../state/lookups/lookups.selectors';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-subcity-form',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSelectModule, MatDialogModule, ReactiveFormsModule],
  templateUrl: './subcity-form.component.html',
  styleUrls: ['./subcity-form.component.css']
})
export class SubcityFormComponent implements OnInit {
  form!: FormGroup;
  editMode = false;
  regions$!: Observable<LookupItem[]>;

  constructor(
    private store: Store<AppState>,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<SubcityFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { item?: LookupItem }
  ) {}

  ngOnInit(): void {
    this.store.dispatch(loadRegions());
    this.regions$ = this.store.select(selectAllRegions);

    this.form = this.fb.group({
      id: [''],
      name: ['', Validators.required],
      state_id: ['', Validators.required],
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
      this.store.dispatch(updateSubcity({ subcity: data as LookupItem }));
    } else {
      delete data.id;
      this.store.dispatch(addSubcity({ subcity: data as LookupItem }));
    }
    this.dialogRef.close(true);
  }

  onCancel() { this.dialogRef.close(); }
}
