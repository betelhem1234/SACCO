import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Store } from '@ngrx/store';
import { ApiService } from '../../services/api.service';
import { SettingsService } from '../../services/settings.service';
import { AppState } from '../../models/state.model';
import { selectAllAccounts } from '../../state/lookups/lookups.selectors';
import { loadAccounts } from '../../state/lookups/lookups.actions';
import { Account, AccountType } from '@sacco/shared-models';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatSnackBarModule, MatButtonModule, MatIconModule, MatTabsModule, MatSelectModule, MatDividerModule, MatSlideToggleModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private snackBar = inject(MatSnackBar);
  private settingsService = inject(SettingsService);
  private store = inject(Store<AppState>);

  accounts: Account[] = [];

  get equityAccounts() {
    return this.accounts.filter(a => a.accountType === AccountType.EQUITY);
  }

  get revenueAccounts() {
    return this.accounts.filter(a => a.accountType === AccountType.REVENUE);
  }

  generalForm: FormGroup = this.fb.group({
    company_name: [''],
    logo_url: [''],
    primary_color: [''],
    secondary_color: [''],
    tertiary_color: [''],
  });

  shareForm: FormGroup = this.fb.group({
    share_unit_price: [''],
    registration_fee: [''],
    minimum_share_unit: [''],
    maximum_share_unit: [''],
    share_purchase_account_id: [''],
    registration_fee_account_id: [''],
    share_requires_approval: [false],
  });

  savingForm: FormGroup = this.fb.group({
    saving_requires_approval: [false],
    mandatory_partial_payment: [true],
    mandatory_overflow_to_voluntary: [true],
  });

  withdrawalForm: FormGroup = this.fb.group({
    withdrawal_requires_approval: [false],
    withdrawal_limit: [''],
    withdrawal_interval_days: [''],
  });

  logoPreview: string | null = null;

  ngOnInit() {
    this.store.dispatch(loadAccounts({}));
    this.store.select(selectAllAccounts).subscribe(a => this.accounts = a ?? []);
    this.api.getSettings().subscribe(settings => {
      const logo = settings['logo_url'] || '';
      this.generalForm.patchValue({
        company_name: settings['company_name'] || '',
        logo_url: logo,
        primary_color: settings['primary_color'] || '#1e3a5f',
        secondary_color: settings['secondary_color'] || '#10b981',
        tertiary_color: settings['tertiary_color'] || '#3b82f6',
      });
      this.shareForm.patchValue({
        share_unit_price: settings['share_unit_price'] || '100',
        registration_fee: settings['registration_fee'] || '0',
        minimum_share_unit: settings['minimum_share_unit'] || '1',
        maximum_share_unit: settings['maximum_share_unit'] || '1000',
        share_purchase_account_id: settings['share_purchase_account_id'] || '',
        registration_fee_account_id: settings['registration_fee_account_id'] || '',
        share_requires_approval: settings['share_requires_approval'] === 'true',
      });
      this.savingForm.patchValue({
        saving_requires_approval: settings['saving_requires_approval'] === 'true',
        mandatory_partial_payment: settings['mandatory_partial_payment'] === 'true',
        mandatory_overflow_to_voluntary: settings['mandatory_overflow_to_voluntary'] === 'true',
      });
      this.withdrawalForm.patchValue({
        withdrawal_requires_approval: settings['withdrawal_requires_approval'] === 'true',
        withdrawal_limit: settings['withdrawal_limit'] || '0',
        withdrawal_interval_days: settings['withdrawal_interval_days'] || '0',
      });
      if (logo) this.logoPreview = logo;
    });
  }

  onTabChange(event: any) {
    if (event.index === 0) this.applyThemeFromForm();
  }

  onLogoSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      this.snackBar.open('Logo must be under 2MB', 'Close', { duration: 3000 });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      this.logoPreview = dataUrl;
      this.generalForm.patchValue({ logo_url: dataUrl });
    };
    reader.readAsDataURL(file);
  }

  removeLogo() {
    this.logoPreview = null;
    this.generalForm.patchValue({ logo_url: '' });
  }

  saveGeneral() {
    this.api.updateSettings(this.generalForm.value).subscribe({
      next: (result) => {
        this.snackBar.open('General settings saved', 'Close', { duration: 3000 });
        this.settingsService.settings.set({ ...this.settingsService.settings(), ...result });
        this.applyThemeFromForm();
      },
      error: () => this.snackBar.open('Failed to save settings', 'Close', { duration: 3000 }),
    });
  }

  saveShare() {
    const payload = {
      share_requires_approval: String(this.shareForm.value.share_requires_approval),
    };
    this.api.updateSettings(this.shareForm.value).subscribe({
      next: (result) => {
        this.snackBar.open('Share settings saved', 'Close', { duration: 3000 });
        this.settingsService.settings.set({ ...this.settingsService.settings(), ...result });
      },
      error: () => this.snackBar.open('Failed to save settings', 'Close', { duration: 3000 }),
    });
  }

  saveSaving() {
    const payload = {
      saving_requires_approval: String(this.savingForm.value.saving_requires_approval),
      mandatory_partial_payment: String(this.savingForm.value.mandatory_partial_payment),
      mandatory_overflow_to_voluntary: String(this.savingForm.value.mandatory_overflow_to_voluntary),
    };
    this.api.updateSettings(payload).subscribe({
      next: (result) => {
        this.snackBar.open('Saving settings saved', 'Close', { duration: 3000 });
        this.settingsService.settings.set({ ...this.settingsService.settings(), ...result });
      },
      error: () => this.snackBar.open('Failed to save settings', 'Close', { duration: 3000 }),
    });
  }

  saveWithdrawal() {
    const payload = {
      withdrawal_requires_approval: String(this.withdrawalForm.value.withdrawal_requires_approval),
      withdrawal_limit: String(this.withdrawalForm.value.withdrawal_limit),
      withdrawal_interval_days: String(this.withdrawalForm.value.withdrawal_interval_days),
    };
    this.api.updateSettings(payload).subscribe({
      next: (result) => {
        this.snackBar.open('Withdrawal settings saved', 'Close', { duration: 3000 });
        this.settingsService.settings.set({ ...this.settingsService.settings(), ...result });
      },
      error: () => this.snackBar.open('Failed to save settings', 'Close', { duration: 3000 }),
    });
  }

  private applyThemeFromForm() {
    const v = this.generalForm.value;
    document.documentElement.style.setProperty('--primary', v.primary_color || '#1e3a5f');
    document.documentElement.style.setProperty('--primary-dark', this.darken(v.primary_color || '#1e3a5f', 40));
    document.documentElement.style.setProperty('--accent', v.secondary_color || '#10b981');
    document.documentElement.style.setProperty('--accent-dark', this.darken(v.secondary_color || '#10b981', 30));
  }

  private darken(hex: string, amount: number = 30): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max((num >> 16) - amount, 0);
    const g = Math.max(((num >> 8) & 0xff) - amount, 0);
    const b = Math.max((num & 0xff) - amount, 0);
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  }
}
