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

import { GroupMember } from '@sacco/shared-models';
import { Store } from '@ngrx/store';
import { AppState } from '../../models/state.model';
import { loadRegions, loadSubcities, LookupItem } from '../../state/lookups/lookups.actions';
import { selectAllRegions, selectAllSubcities } from '../../state/lookups/lookups.selectors';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-referral-member-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatDialogModule,
    MatDatepickerModule, MatRadioModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './referral-member-form.component.html',
  styleUrls: ['./referral-member-form.component.css']
})
export class ReferralMemberFormComponent implements OnInit {
  form!: FormGroup;
  editMode = false;
  regions: LookupItem[] = [];
  subcities: LookupItem[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ReferralMemberFormComponent>,
    private store: Store<AppState>,
    @Inject(MAT_DIALOG_DATA) public data: { referral?: GroupMember }
  ) {
    this.editMode = !!data?.referral;
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      first_name: ['', Validators.required],
      middle_name: ['', Validators.required],
      last_name: ['', Validators.required],
      mother_name: [''],
      family_size: [0],
      is_male: [true, Validators.required],
      birth_date: [null],
      age: [{ value: null, disabled: true }],
      job_field: [''],
      marital_status: [0],
      work_address: [''],
      fayda_id_no: [''],
      telephone: [''],
      email: [''],
      state_id: [''],
      subcity: [''],
      woreda: [''],
      house_no: [''],
    });

    this.store.dispatch(loadRegions());
    this.store.dispatch(loadSubcities());
    this.store.select(selectAllRegions).pipe(takeUntil(this.destroy$)).subscribe(r => this.regions = r);
    this.store.select(selectAllSubcities).pipe(takeUntil(this.destroy$)).subscribe(s => this.subcities = s);

    if (this.editMode && this.data.referral) {
      const r = this.data.referral;
      this.form.patchValue({
        first_name: r.first_name,
        middle_name: r.middle_name,
        last_name: r.last_name,
        mother_name: r.mother_name || '',
        family_size: r.family_size || 0,
        is_male: r.is_male ?? true,
        birth_date: r.birth_date ? new Date(r.birth_date) : null,
        age: r.age || null,
        job_field: r.job_field || '',
        marital_status: r.marital_status ?? 0,
        work_address: r.work_address || '',
        fayda_id_no: r.fayda_id_no || '',
        telephone: r.telephone || '',
        email: r.email || '',
        state_id: r.state_id || '',
        subcity: r.subcity || '',
        woreda: r.woreda || '',
        house_no: r.house_no || '',
      });
      if (r.age) this.form.patchValue({ age: r.age });
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

  calculateAge(): void {
    const dob = this.form.get('birth_date')?.value;
    if (!dob) { this.form.patchValue({ age: null }); return; }
    const birthDate = new Date(dob);
    const today = new Date();
    const age = Math.floor((today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    if (age < 0) { this.form.patchValue({ age: null }); return; }
    this.form.patchValue({ age });
  }

  submit(): void {
    if (this.form.invalid) return;
    const val = this.form.getRawValue();
    const result: any = {
      first_name: val.first_name,
      middle_name: val.middle_name,
      last_name: val.last_name,
      mother_name: val.mother_name || null,
      family_size: val.family_size || 0,
      is_male: val.is_male,
      birth_date: val.birth_date instanceof Date ? val.birth_date.getTime() : val.birth_date,
      age: val.age || null,
      job_field: val.job_field || null,
      marital_status: val.marital_status,
      work_address: val.work_address || null,
      fayda_id_no: val.fayda_id_no || null,
      telephone: val.telephone || null,
      email: val.email || null,
      state_id: val.state_id || null,
      subcity: val.subcity || null,
      woreda: val.woreda || null,
      house_no: val.house_no || null,
    };
    if (this.editMode && this.data.referral?.id) {
      result.id = this.data.referral.id;
    }
    this.dialogRef.close(result);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
