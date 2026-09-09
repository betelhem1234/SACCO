import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject, forkJoin, of } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';

import { Member } from '@sacco/shared-models';
import { AppState } from '../../models/state.model';
import { addMember, updateMember } from '../../state/members/members.actions';
import {
  loadRegions, loadSubcities, loadEducations, loadSavingTypes, loadBranches,
  LookupItem
} from '../../state/lookups/lookups.actions';
import {
  selectAllRegions, selectAllSubcities, selectAllEducations, selectAllSavingTypes, selectAllBranches
} from '../../state/lookups/lookups.selectors';
import { ApiService } from '../../services/api.service';
import { BeneficiaryFormComponent } from '../beneficiary-form/beneficiary-form.component';
import { ReferralMemberFormComponent } from '../referral-member-form/referral-member-form.component';
import { MemberPickerComponent } from '../member-picker/member-picker.component';

@Component({
  selector: 'app-member-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatDatepickerModule,
    MatRadioModule,
    MatSlideToggleModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatStepperModule,
  ],
  providers: [
    provideNativeDateAdapter(),
  ],
  templateUrl: './member-form.component.html',
  styleUrls: ['./member-form.component.css'],
})
export class MemberFormComponent implements OnInit, OnDestroy {
  isLoading = false;
  editMode = false;
  isNew = true;
  memberForm!: FormGroup;
  memberTypes = [
    { id: 1, name: 'Adult' },
    { id: 0, name: 'Child' },
    { id: 2, name: 'Company/Group' },
  ];
  regions: LookupItem[] = [];
  subcities: LookupItem[] = [];
  educations: LookupItem[] = [];
  branches: LookupItem[] = [];
  products: LookupItem[] = [];
  is_employee = false;
  showName = false;
  memberName = '';
  groupMembers: any[] = [];
  referalMembers: any[] = [];
  beneficiaries: any[] = [];
  showParentSection = false;
  currentStepIndex = 0;

  private destroy$ = new Subject<void>();

  private relationLabels: Record<number, string> = { 1: 'Spouse', 2: 'Child', 3: 'Parent', 4: 'Sibling', 5: 'Other' };

  constructor(
    private store: Store<AppState>,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<MemberFormComponent>,
    private dialog: MatDialog,
    private apiService: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: { mode: string; member?: Member; memberType?: number }
  ) {
    this.editMode = data.mode === 'edit';
    this.isNew = data.mode === 'new';
  }

  ngOnInit(): void {
    this.buildForm();

    // Dispatch lookups load
    this.store.dispatch(loadRegions());
    this.store.dispatch(loadSubcities());
    this.store.dispatch(loadEducations());
    this.store.dispatch(loadSavingTypes());
    this.store.dispatch(loadBranches());

    // Subscribe to lookups from store
    this.store.select(selectAllRegions).pipe(takeUntil(this.destroy$)).subscribe(r => this.regions = r);
    this.store.select(selectAllSubcities).pipe(takeUntil(this.destroy$)).subscribe(s => {
      this.subcities = s;
      const subcityId = this.memberForm.get('subcity')?.value;
      const currentStateId = this.memberForm.get('state_id')?.value;
      if (subcityId && !currentStateId) {
        const subcity = s.find(
          (item: any) => item.id === subcityId || item.id?.toString() === subcityId?.toString()
        );
        if (subcity) {
          const parentStateId = (subcity as any).state_id || (subcity as any).stateId;
          if (parentStateId) {
            this.memberForm.patchValue({ state_id: parentStateId });
          }
        }
      }
    });
    this.store.select(selectAllEducations).pipe(takeUntil(this.destroy$)).subscribe(e => this.educations = e);
    this.store.select(selectAllSavingTypes).pipe(takeUntil(this.destroy$)).subscribe(p => this.products = p);
    this.store.select(selectAllBranches).pipe(takeUntil(this.destroy$)).subscribe(b => this.branches = b);

    if (this.editMode && this.data.member) {
      this.memberForm.patchValue(this.data.member);
      this.memberForm.patchValue({
        birth_date: this.data.member.birthDate ? new Date(this.data.member.birthDate) : null,
        membership_date: this.data.member.membership_date ? new Date(this.data.member.membership_date) : null,
      });
      this.is_employee = this.data.member.is_employee || false;
      this.beneficiaries = this.data.member.beneficiaries || [];
      this.referalMembers = this.data.member.referal_members || [];
      this.groupMembers = this.data.member.memberGroups || [];
      if ((this.data.member.memberType ?? this.data.member.member_type) === 2 && this.groupMembers.length === 0) {
        this.apiService.getMemberGroups(this.data.member.id).subscribe({
          next: (groups) => {
            this.groupMembers = groups;
          },
          error: (err) => {
            console.error('Failed to load group members for edit:', err);
            this.groupMembers = [];
          }
        });
      }
      this.calculateAge();
    } else if (this.data.memberType != null) {
      this.memberForm.patchValue({ member_type: this.data.memberType });
    }

    this.memberForm.get('member_type')?.valueChanges.subscribe(val => {
      this.showParentSection = val === 0;
      if (val === 2) this.is_employee = false;
    });

    this.memberForm.get('subcity')?.valueChanges.subscribe(subcityId => {
      if (subcityId) {
        const subcity = (this.subcities || []).find(
          (s: any) => s.id === subcityId || s.id?.toString() === subcityId?.toString()
        );
        if (subcity) {
          const parentStateId = (subcity as any).state_id || (subcity as any).stateId;
          if (parentStateId) {
            this.memberForm.patchValue({ state_id: parentStateId });
          }
        }
      }
    });

    this.memberForm.get('immediate_contact_region')?.valueChanges.subscribe(() => {
      this.memberForm.patchValue({ immediate_contact_subcity: '' });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildForm(): void {
    this.memberForm = this.fb.group({
      id: [''],
      memberid: [''],
      member_type: [1],
      fullName: ['', Validators.required],
      mother_name: ['', Validators.required],
      birth_date: [null],
      age: [{ value: null, disabled: true }],
      is_male: [true, Validators.required],
      telephone: [''],
      home_phone_number: [''],
      email: [''],
      family_size: [0],
      job_field: [''],
      work_address: [''],
      fayda_id_no: [''],
      nationality: ['ETHIOPIAN'],
      monthly_income: [0],
      state_id: [''],
      subcity: [''],
      woreda: [''],
      house_no: [''],
      kebele: [''],
      branch_id: ['', Validators.required],
      membership_date: [null],
      reason: [0],
      id_no: [''],
      education_id: [''],

      is_member: [false],
      parent_id: [''],
      membersipStatus: [1],
      marital_status: [0],

      immediate_contact_full_name: [''],
      immediate_contact_phone: [''],
      immediate_contact_subcity: [''],
      immediate_contact_region: [''],
      immediate_contact_email: [''],
      immediate_contact_house_no: [''],
      immediate_contact_woreda: [''],
      immediate_contact_houseno: [''],
    });
  }

  filteredSubcities(): LookupItem[] {
    const stateId = this.memberForm.get('state_id')?.value;
    if (!stateId) return [];
    return (this.subcities || []).filter((s: any) => s.state_id === stateId || s.stateId === stateId);
  }

  filteredImmediateSubcities(): LookupItem[] {
    const regionId = this.memberForm.get('immediate_contact_region')?.value;
    if (!regionId) return [];
    return (this.subcities || []).filter((s: any) => s.state_id === regionId || s.stateId === regionId);
  }

  calculateAge(): void {
    const dob = this.memberForm.get('birth_date')?.value;
    if (!dob) {
      this.memberForm.patchValue({ age: null });
      return;
    }
    const birthDate = new Date(dob);
    const today = new Date();
    const age = Math.floor((today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    if (age < 0) {
      this.memberForm.patchValue({ age: null });
      return;
    }
    const memberType = this.memberForm.get('member_type')?.value;
    if (memberType === 0 && age > 18) {
      this.memberForm.patchValue({ age: null });
      alert('Child member cannot be older than 18 years');
      return;
    }
    if (memberType !== 0 && age < 18) {
      this.memberForm.patchValue({ age: null });
      alert('Member must be at least 18 years old');
      return;
    }
    this.memberForm.patchValue({ age });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onStepChange(event: any): void {
    this.currentStepIndex = event.selectedIndex;
  }

  step1Complete(): boolean {
    return this.personalComplete() && this.guardianComplete() && this.groupComplete();
  }

  step2Complete(): boolean {
    return this.contactComplete();
  }

  step3Complete(): boolean {
    return this.membershipComplete();
  }

  private isFilled(ctrl: string): boolean {
    const v = this.memberForm.get(ctrl)?.value;
    return v != null && v !== '';
  }

  personalComplete(): boolean {
    const t = this.memberForm.get('member_type')?.value;
    if (t === 2) return this.isFilled('fullName');
    const ageOk = !this.memberForm.get('birth_date')?.value
      || (this.memberForm.get('age')?.value != null && this.memberForm.get('age')?.value !== 0);
    return this.isFilled('fullName') && this.isFilled('mother_name')
      && this.memberForm.get('is_male')?.value != null && ageOk;
  }

  contactComplete(): boolean {
    const t = this.memberForm.get('member_type')?.value;
    if (t === 2) return true;
    const required = t === 1 || (t === 0 && !this.memberForm.get('is_member')?.value);
    if (!required) return true;
    return this.isFilled('state_id') && this.isFilled('woreda') && this.isFilled('telephone');
  }

  guardianComplete(): boolean {
    if (this.memberForm.get('member_type')?.value !== 0) return true;
    return !this.memberForm.get('is_member')?.value || this.isFilled('parent_id');
  }

  groupComplete(): boolean {
    return this.memberForm.get('member_type')?.value !== 2 || this.groupMembers.length > 0;
  }

  membershipComplete(): boolean {
    return this.isFilled('branch_id');
  }

  canSubmit(): boolean {
    const f = this.memberForm;
    const memberType = f.get('member_type')?.value;
    const hasBirthDate = !!f.get('birth_date')?.value;

    const checks = [
      { key: 'branch_id', ok: f.get('branch_id')?.value != null && f.get('branch_id')?.value !== '' },
      { key: 'is_male', ok: f.get('is_male')?.value != null },
    ];

    if (memberType !== 2) {
      checks.push(
        { key: 'fullName', ok: f.get('fullName')?.value != null && f.get('fullName')?.value !== '' },
        { key: 'mother_name', ok: f.get('mother_name')?.value != null && f.get('mother_name')?.value !== '' },
      );
    }

    if (hasBirthDate && memberType !== 2) {
      checks.push({ key: 'age', ok: f.get('age')?.value != null && f.get('age')?.value !== 0 });
    }

    const failing = checks.filter(c => !c.ok).map(c => c.key);

    if (memberType === 0 && f.get('is_member')?.value && (!f.get('parent_id')?.value || f.get('parent_id')?.value === '')) {
      failing.push('parent_id');
    }
    if ((memberType === 1 || (memberType === 0 && !f.get('is_member')?.value)) && (!f.get('state_id')?.value || !f.get('woreda')?.value || !f.get('telephone')?.value)) {
      failing.push('address_fields (state_id/woreda/telephone)');
    }
    if (memberType === 2 && this.groupMembers.length === 0) {
      failing.push('group_members');
    }
    if (failing.length > 0) console.log('canSubmit failing:', failing);
    return failing.length === 0;
  }

  onSubmit(): void {
    if (!this.canSubmit()) return;
    this.isLoading = true;

    const formValue = this.memberForm.getRawValue();
    const memberId = formValue.id;
    const isCompany = formValue.member_type === 2;

    const member: any = {
      ...formValue,
      fullName: formValue.fullName,
      birthDate: formValue.birth_date instanceof Date ? formValue.birth_date.getTime() : formValue.birth_date,
      membership_date: formValue.membership_date instanceof Date ? formValue.membership_date.getTime() : formValue.membership_date,
      registrationDate: Date.now(),
      is_employee: this.is_employee,
      beneficiaries: this.beneficiaries,
      referal_members: this.referalMembers,
    };

    const uuidFields: Record<string, string | null> = {
      state_id: member.state_id || null,
      subcity: member.subcity || null,
      education_id: member.education_id || null,
      parent_id: member.parent_id || null,
      branch_id: member.branch_id || null,
    };
    for (const [key, val] of Object.entries(uuidFields)) {
      member[key] = val;
    }

    if (!member.id) delete member.id;

    const onError = (err: any) => {
      this.isLoading = false;
      console.error('Save error:', err);
      alert('Failed to register member: ' + (err.error?.message || err.message || err.statusText || 'Unknown error'));
    };

    const onSuccess = (createdMember?: any) => {
      if (isCompany) {
        const createdId = createdMember?.id || memberId;
        if (!createdId) {
          onError({ message: 'Company member was created but no ID was returned' });
          return;
        }
        const groupOps = this.groupMembers.map(r => {
          const payload = { ...r, member_id: createdId };
          const hasExistingId = !!r.id;
          const isGroupUpdate = this.editMode && hasExistingId;
          const obs = isGroupUpdate
            ? this.apiService.updateMemberGroup(r.id, payload)
            : this.apiService.addMemberGroup(payload);
          return obs.pipe(
            catchError(err => {
              console.error('Failed to save group member:', r, err);
              return of(null);
            })
          );
        });
        if (groupOps.length > 0) {
          forkJoin(groupOps).subscribe({
            next: (results) => {
              this.isLoading = false;
              this.dialogRef.close(true);
              const failed = results.filter(r => r === null).length;
              const msg = 'Member successfully ' + (this.editMode ? 'updated' : 'added');
              window.alert(failed > 0 ? msg + ' (' + failed + ' group member(s) failed to save)' : msg);
            },
            error: (err) => {
              onError(err);
            }
          });
        } else {
          this.isLoading = false;
          this.dialogRef.close(true);
          window.alert('Member successfully ' + (this.editMode ? 'updated' : 'added'));
        }
      } else {
        this.isLoading = false;
        this.dialogRef.close(true);
        window.alert('Member successfully ' + (this.editMode ? 'updated' : 'added'));
      }
    };

    if (this.editMode) {
      this.apiService.updateMember(memberId, member).subscribe({
        next: (res) => onSuccess(res),
        error: onError
      });
    } else {
      this.apiService.addMember(member).subscribe({
        next: (res) => onSuccess(res),
        error: onError
      });
    }
  }

  pickParent(): void {
    const dialogRef = this.dialog.open(MemberPickerComponent, {
      width: '800px',
      data: { title: 'Select parent/guardian member', memberType: 1 },
    });
    dialogRef.afterClosed().subscribe((selected: any) => {
      if (selected) {
        const name = selected.fullName || '';
        const parts = name.split(' ');
        this.memberForm.patchValue({
          parent_id: selected.id,
          immediate_contact_full_name: name,
        });
        this.showName = true;
        this.memberName = name;
      }
    });
  }

  addBeneficiary(beneficiary?: any): void {
    const dialogRef = this.dialog.open(BeneficiaryFormComponent, {
      width: '800px',
      data: { beneficiary },
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        if (beneficiary) {
          const idx = this.beneficiaries.indexOf(beneficiary);
          if (idx >= 0) this.beneficiaries[idx] = result;
        } else {
          this.beneficiaries.push(result);
        }
      }
    });
  }

  editBeneficiary(beneficiary: any): void {
    this.addBeneficiary(beneficiary);
  }

  // Group Members (for Company type)
  addGroupMemberOpen(groupMember?: any): void {
    const dialogRef = this.dialog.open(ReferralMemberFormComponent, {
      width: '900px',
      data: { referral: groupMember },
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        if (groupMember) {
          const idx = this.groupMembers.indexOf(groupMember);
          if (idx >= 0) this.groupMembers[idx] = result;
        } else {
          this.groupMembers.push(result);
        }
      }
    });
  }

  editGroupMember(groupMember: any): void {
    this.addGroupMemberOpen(groupMember);
  }

  removeGroupMember(index: number): void {
    this.groupMembers.splice(index, 1);
  }

  // Referral Members (for all non-child types)
  addReferalMemberOpen(referral?: any): void {
    const dialogRef = this.dialog.open(ReferralMemberFormComponent, {
      width: '900px',
      data: { referral },
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        if (referral) {
          const idx = this.referalMembers.indexOf(referral);
          if (idx >= 0) this.referalMembers[idx] = result;
        } else {
          this.referalMembers.push(result);
        }
      }
    });
  }

  editReferalMember(referral: any): void {
    this.addReferalMemberOpen(referral);
  }

  pickReferalMembers(): void {
    const dialogRef = this.dialog.open(MemberPickerComponent, {
      width: '800px',
      data: { title: 'Select existing member as referral', memberType: 1 },
    });
    dialogRef.afterClosed().subscribe((selected: any) => {
      if (selected) {
        const nameParts = (selected.fullName || '').split(' ');
        this.referalMembers.push({
          first_name: nameParts[0] || selected.fullName || '',
          middle_name: nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '',
          last_name: nameParts.length > 1 ? nameParts[nameParts.length - 1] : '',
          is_male: selected.isMale ?? selected.is_male,
          telephone: selected.telephone,
          email: selected.email,
          birth_date: selected.birthDate,
          age: selected.age,
          job_field: selected.job_field,
          work_address: selected.work_address,
          fayda_id_no: selected.fayda_id_no,
          state_id: selected.state_id,
          subcity: selected.subcity,
          woreda: selected.woreda,
          house_no: selected.house_no,
          mother_name: selected.mother_name,
          family_size: selected.family_size,
        });
      }
    });
  }

  removeReferalMember(index: number): void {
    this.referalMembers.splice(index, 1);
  }

  removeBeneficiary(index: number): void {
    this.beneficiaries.splice(index, 1);
  }

  relationLabel(t?: number): string {
    return t != null ? (this.relationLabels[t] || String(t)) : '-';
  }
}
