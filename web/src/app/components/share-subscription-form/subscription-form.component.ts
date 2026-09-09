import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import { SettingsService } from '../../services/settings.service';
import { Member, ShareSubscription } from '@sacco/shared-models';
import { AppState } from '../../models/state.model';
import { selectAllMembers } from '../../state/members/members.selectors';
import { addShareSubscription, updateShareSubscription } from '../../state/share-subscription/share-subscriptions.actions';

@Component({
  selector: 'app-subscription-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatDatepickerModule, MatSelectModule, MatDialogModule, MatIconModule],
  templateUrl: './subscription-form.component.html',
  styleUrls: ['./subscription-form.component.css']
})
export class SubscriptionFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private store = inject(Store<AppState>);
  private settingsService = inject(SettingsService);

  members: Member[] = [];

  form: FormGroup = this.fb.group({
    memberId: ['', Validators.required],
    units: [{ value: 0, disabled: true }],
    totalAmount: [0, Validators.required],
    subscriptionDate: [new Date(), Validators.required],
    remark: [''],
  });

  get shareUnitPrice(): number {
    return Number(this.settingsService.settings()['share_unit_price']) || 100;
  }

  get minUnits(): number {
    return Number(this.settingsService.settings()['minimum_share_unit']) || 1;
  }

  get maxUnits(): number {
    return Number(this.settingsService.settings()['maximum_share_unit']) || 1000;
  }

  get calculatedUnits(): string {
    const v = this.form.get('totalAmount')?.value || 0;
    return v > 0 ? (v / this.shareUnitPrice).toFixed(2) : '0';
  }

  isEdit = false;

  constructor(
    public dialogRef: MatDialogRef<SubscriptionFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { subscription?: ShareSubscription; memberId?: string } | null
  ) {}

  ngOnInit() {
    this.store.select(selectAllMembers).subscribe(m => this.members = m ?? []);

    const sub = this.data?.subscription;
    this.isEdit = !!(sub?.id);

    if (sub) {
      this.form.patchValue({
        ...sub,
        subscriptionDate: new Date(sub.subscriptionDate),
      });
    } else if (this.data?.memberId) {
      this.form.patchValue({ memberId: this.data.memberId });
    }

    if (!sub) {
      this.updateUnits();
    }
    this.form.get('totalAmount')?.valueChanges.subscribe(() => this.updateUnits());
  }

  private updateUnits() {
    const amount = this.form.get('totalAmount')?.value || 0;
    const units = amount > 0 ? amount / this.shareUnitPrice : 0;
    this.form.patchValue({ units: Math.round(units * 100) / 100 }, { emitEvent: false });
  }

  onSubmit() {
    if (this.form.invalid) return;
    const val = this.form.getRawValue();
    if (val.units < this.minUnits) {
      return;
    }
    if (val.units > this.maxUnits) {
      return;
    }
    const payload: ShareSubscription = {
      ...val,
      subscriptionDate: val.subscriptionDate instanceof Date ? val.subscriptionDate.getTime() : val.subscriptionDate,
    };

    if (this.data?.subscription?.id) {
      const s = this.data.subscription;
      this.store.dispatch(updateShareSubscription({ shareSubscription: { ...s, ...payload, id: s.id } }));
    } else {
      this.store.dispatch(addShareSubscription({ shareSubscription: payload }));
    }
    this.dialogRef.close(true);
  }
}
