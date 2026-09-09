import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';

import { Beneficiary } from '@sacco/shared-models';
import { Store } from '@ngrx/store';
import { AppState } from '../../models/state.model';
import { loadRegions, loadSubcities, LookupItem } from '../../state/lookups/lookups.actions';
import { selectAllRegions, selectAllSubcities } from '../../state/lookups/lookups.selectors';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-beneficiary-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatDialogModule,
    MatDatepickerModule, MatRadioModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './beneficiary-form.component.html',
  styleUrls: ['./beneficiary-form.component.css']
})
export class BeneficiaryFormComponent implements OnInit {
  form!: FormGroup;
  editMode = false;
  regions: LookupItem[] = [];
  subcities: LookupItem[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<BeneficiaryFormComponent>,
    private store: Store<AppState>,
    @Inject(MAT_DIALOG_DATA) public data: { beneficiary?: Beneficiary }
  ) {
    this.editMode = !!data?.beneficiary;
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      is_male: [true, Validators.required],
      relation_type: [1, Validators.required],
      birth_date: [null],
      state_id: [''],
      subcity: [''],
      woreda: [''],
      house_no: [''],
      kebele: [''],
      telephone: [''],
      remark: [''],
    });

    this.store.dispatch(loadRegions());
    this.store.dispatch(loadSubcities());
    this.store.select(selectAllRegions).pipe(takeUntil(this.destroy$)).subscribe(r => this.regions = r);
    this.store.select(selectAllSubcities).pipe(takeUntil(this.destroy$)).subscribe(s => this.subcities = s);

    if (this.editMode && this.data.beneficiary) {
      const b = this.data.beneficiary;
      this.form.patchValue({
        name: b.name,
        is_male: b.is_male,
        relation_type: b.relation_type,
        birth_date: b.birth_date ? new Date(b.birth_date) : null,
        state_id: b.state_id || '',
        subcity: b.subcity || '',
        woreda: b.woreda || '',
        house_no: b.house_no || '',
        kebele: b.kebele || '',
        telephone: b.telephone || '',
        remark: b.remark || '',
      });
    }

    this.form.get('state_id')?.valueChanges.subscribe(() => {
      this.form.patchValue({ subcity: '' });
    });
  }

  filteredSubcities(): LookupItem[] {
    const stateId = this.form.get('state_id')?.value;
    if (!stateId) return [];
    return (this.subcities || []).filter((s: any) => s.state_id === stateId || s.stateId === stateId);
  }

  submit(): void {
    if (this.form.invalid) return;
    const val = this.form.value;
    const result: any = {
      name: val.name,
      is_male: val.is_male,
      relation_type: val.relation_type,
      birth_date: val.birth_date instanceof Date ? val.birth_date.getTime() : val.birth_date,
      state_id: val.state_id || null,
      subcity: val.subcity || null,
      woreda: val.woreda || null,
      house_no: val.house_no || null,
      kebele: val.kebele || null,
      telephone: val.telephone || null,
      remark: val.remark || null,
    };
    if (this.editMode && this.data.beneficiary?.id) {
      result.id = this.data.beneficiary.id;
    }
    this.dialogRef.close(result);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
