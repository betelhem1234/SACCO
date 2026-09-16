import { Component, OnInit, inject, effect } from '@angular/core';
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
import { SettingsService } from '../../services/settings.service';
import { AppState } from '../../models/state.model';
import { selectAllAccounts } from '../../state/lookups/lookups.selectors';
import { loadAccounts } from '../../state/lookups/lookups.actions';
import { Account, AccountType, AccountCategory } from '@sacco/shared-models';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatSnackBarModule, MatButtonModule, MatIconModule, MatTabsModule, MatSelectModule, MatDividerModule, MatSlideToggleModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  settingsService = inject(SettingsService);
  private store = inject(Store<AppState>);

  accounts: Account[] = [];

  get equityAccounts() {
    return this.accounts.filter(a => a.accountType === AccountType.EQUITY);
  }

  get revenueAccounts() {
    return this.accounts.filter(a => a.accountType === AccountType.REVENUE);
  }

  get assetAccounts() {
    return this.accounts.filter(a => a.accountType === AccountType.ASSET && a.accountCategory === AccountCategory.OTHER_ACCOUNT);
  }

  get expenseAccounts() {
    return this.accounts.filter(a => a.accountType === AccountType.EXPENSE);
  }

  readonly aeKeys = [
    'equipment_account_id',
    'general_expense_account_id',
    'depreciation_expense_account_id',
    'gain_loss_account_id',
    'asset_sale_income_account_id',
    'rent_expense_account_id',
    'prepaid_rent_account_id',
  ];

  readonly aeFields = [
    { key: 'equipment_account_id', label: 'Equipment Asset Account', desc: 'Debited for equipment purchases; credited for depreciation & disposal (asset)' },
    { key: 'general_expense_account_id', label: 'General Expense Account', desc: 'Debited for consumable / general expense purchases (expense)' },
    { key: 'depreciation_expense_account_id', label: 'Depreciation Expense Account', desc: 'Debited each period for depreciation (expense)' },
    { key: 'gain_loss_account_id', label: 'Disposal Expense Account', desc: 'Debited for disposal losses, gifts and lost assets (expense)' },
    { key: 'asset_sale_income_account_id', label: 'Asset Sale Income Account', desc: 'Credited when an asset sells above book value (revenue)' },
    { key: 'rent_expense_account_id', label: 'Rent Expense Account', desc: 'Debited for the current-month rent portion (expense)' },
    { key: 'prepaid_rent_account_id', label: 'Prepaid Rent Account', desc: 'Debited for advance rent, reduced later by amortization (asset)' },
  ];

  get aeConfigured() {
    return this.settingsService.configuredCount(this.aeKeys);
  }

  get aeTotal() {
    return this.aeKeys.length;
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
    authorized_capital: [''],
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
    withdrawal_requires_disbursement: [false],
    withdrawal_limit: [''],
    withdrawal_interval_days: [''],
  });

  transferForm: FormGroup = this.fb.group({
    transfer_requires_approval: [false],
    transfer_requires_service_fee: [false],
    transfer_service_fee_flat: [''],
    transfer_service_fee_percentage: [''],
    transfer_service_fee_account_id: [''],
    transfer_fee_payment_stage: ['SAME_TIME'],
  });

  aeForm: FormGroup = this.fb.group({
    equipment_account_id: [''],
    general_expense_account_id: [''],
    depreciation_expense_account_id: [''],
    gain_loss_account_id: [''],
    asset_sale_income_account_id: [''],
    rent_expense_account_id: [''],
    prepaid_rent_account_id: [''],
  });

  logoPreview: string | null = null;

  private settingsEffect = effect(() => {
    this.applyToForms(this.settingsService.settings());
  });

  ngOnInit() {
    this.store.dispatch(loadAccounts({}));
    this.store.select(selectAllAccounts).subscribe(a => this.accounts = a ?? []);
    this.settingsService.load();

    const feeToggle = this.transferForm.get('transfer_requires_service_fee')!;
    feeToggle.valueChanges.subscribe(() => this.syncTransferFeeControls());

    this.transferForm.get('transfer_service_fee_flat')!.valueChanges.subscribe(v => {
      if (Number(v) > 0) {
        this.transferForm.patchValue({ transfer_service_fee_percentage: 0 }, { emitEvent: false });
      }
    });
    this.transferForm.get('transfer_service_fee_percentage')!.valueChanges.subscribe(v => {
      if (Number(v) > 0) {
        this.transferForm.patchValue({ transfer_service_fee_flat: 0 }, { emitEvent: false });
      }
    });
  }

  isConfigured(key: string): boolean {
    return this.settingsService.has(key);
  }

  get missingShareSettings() {
    return this.settingsService.missingShareSettings();
  }

  get shareSettingsReady(): boolean {
    return this.settingsService.shareSettingsConfigured();
  }

  isShareSettingMissing(key: string): boolean {
    return this.missingShareSettings.some(k => k.key === key);
  }

  get missingShareSettingsText(): string {
    return this.missingShareSettings.map(k => k.label).join(', ');
  }

  accountName(id: string): string {
    if (!id) return '';
    const a = this.accounts.find(x => x.id === id);
    return a?.name || '—';
  }

  private applyToForms(settings: Record<string, string>) {
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
      authorized_capital: settings['authorized_capital'] || '',
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
      withdrawal_requires_disbursement: settings['withdrawal_requires_disbursement'] === 'true',
      withdrawal_limit: settings['withdrawal_limit'] || '0',
      withdrawal_interval_days: settings['withdrawal_interval_days'] || '0',
    });
    this.transferForm.patchValue({
      transfer_requires_approval: settings['transfer_requires_approval'] === 'true',
      transfer_requires_service_fee: settings['transfer_requires_service_fee'] === 'true',
      transfer_service_fee_flat: settings['transfer_service_fee_flat'] || '0',
      transfer_service_fee_percentage: settings['transfer_service_fee_percentage'] || '0',
      transfer_service_fee_account_id: settings['transfer_service_fee_account_id'] || '',
      transfer_fee_payment_stage: settings['transfer_fee_payment_stage'] || 'SAME_TIME',
    });
    this.syncTransferFeeControls();
    this.aeForm.patchValue({
      equipment_account_id: settings['equipment_account_id'] || '',
      general_expense_account_id: settings['general_expense_account_id'] || '',
      depreciation_expense_account_id: settings['depreciation_expense_account_id'] || '',
      gain_loss_account_id: settings['gain_loss_account_id'] || '',
      asset_sale_income_account_id: settings['asset_sale_income_account_id'] || '',
      rent_expense_account_id: settings['rent_expense_account_id'] || '',
      prepaid_rent_account_id: settings['prepaid_rent_account_id'] || '',
    });
    if (logo) this.logoPreview = logo;
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
    this.settingsService.update(this.generalForm.value).subscribe({
      next: () => {
        this.snackBar.open('General settings saved', 'Close', { duration: 3000 });
        this.applyThemeFromForm();
      },
      error: () => this.snackBar.open('Failed to save settings', 'Close', { duration: 3000 }),
    });
  }

  saveShare() {
    const v = this.shareForm.value;
    const num = (n: any) => Number(n);
    const problems: string[] = [];
    if (!(num(v.share_unit_price) > 0)) problems.push('Share Unit Price must be greater than 0');
    if (!(num(v.registration_fee) >= 0)) problems.push('Registration Fee must be 0 or more');
    if (!(num(v.minimum_share_unit) > 0)) problems.push('Minimum Share Unit must be greater than 0');
    if (!(num(v.maximum_share_unit) > 0)) problems.push('Maximum Share Unit must be greater than 0');
    if (num(v.minimum_share_unit) > 0 && num(v.maximum_share_unit) > 0 && num(v.maximum_share_unit) < num(v.minimum_share_unit))
      problems.push('Maximum Share Unit cannot be less than Minimum Share Unit');
    if (!v.share_purchase_account_id) problems.push('Share Purchase Account is required');
    if (!v.registration_fee_account_id) problems.push('Registration Fee Account is required');
    if (problems.length) {
      this.snackBar.open(problems.join(' · '), 'Close', { duration: 6000 });
      return;
    }
    this.settingsService.update(this.shareForm.value).subscribe({
      next: () => this.snackBar.open('Share settings saved', 'Close', { duration: 3000 }),
      error: () => this.snackBar.open('Failed to save settings', 'Close', { duration: 3000 }),
    });
  }

  saveSaving() {
    const payload = {
      saving_requires_approval: String(this.savingForm.value.saving_requires_approval),
      mandatory_partial_payment: String(this.savingForm.value.mandatory_partial_payment),
      mandatory_overflow_to_voluntary: String(this.savingForm.value.mandatory_overflow_to_voluntary),
    };
    this.settingsService.update(payload).subscribe({
      next: () => this.snackBar.open('Saving settings saved', 'Close', { duration: 3000 }),
      error: () => this.snackBar.open('Failed to save settings', 'Close', { duration: 3000 }),
    });
  }

  saveWithdrawal() {
    const payload = {
      withdrawal_requires_approval: String(this.withdrawalForm.value.withdrawal_requires_approval),
      withdrawal_requires_disbursement: String(this.withdrawalForm.value.withdrawal_requires_disbursement),
      withdrawal_limit: String(this.withdrawalForm.value.withdrawal_limit),
      withdrawal_interval_days: String(this.withdrawalForm.value.withdrawal_interval_days),
    };
    this.settingsService.update(payload).subscribe({
      next: () => this.snackBar.open('Withdrawal settings saved', 'Close', { duration: 3000 }),
      error: () => this.snackBar.open('Failed to save settings', 'Close', { duration: 3000 }),
    });
  }

  saveTransfer() {
    const v = this.transferForm.getRawValue();
    const feeOn = v.transfer_requires_service_fee === true;
    const flat = Number(v.transfer_service_fee_flat) || 0;
    const pct = Number(v.transfer_service_fee_percentage) || 0;
    const problems: string[] = [];
    if (flat < 0) problems.push('Flat fee cannot be negative');
    if (pct < 0) problems.push('Percentage cannot be negative');
    if (feeOn && flat > 0 && pct > 0) {
      problems.push('Choose either a flat service fee or a percentage, not both');
    }
    if (feeOn && flat <= 0 && pct <= 0) {
      problems.push('Set a flat service fee or a percentage when service fees are required');
    }
    if (feeOn && !v.transfer_service_fee_account_id) {
      problems.push('Service Fee Credit Account is required (revenue)');
    }
    if (problems.length) {
      this.snackBar.open(problems.join(' · '), 'Close', { duration: 6000 });
      return;
    }
    const payload = {
      transfer_requires_approval: String(v.transfer_requires_approval),
      transfer_requires_service_fee: String(feeOn),
      transfer_service_fee_flat: feeOn ? String(flat) : '0',
      transfer_service_fee_percentage: feeOn ? String(pct) : '0',
      transfer_service_fee_account_id: feeOn ? (v.transfer_service_fee_account_id || '') : '',
      transfer_fee_payment_stage: v.transfer_fee_payment_stage || 'SAME_TIME',
    };
    this.settingsService.update(payload).subscribe({
      next: () => this.snackBar.open('Transfer settings saved', 'Close', { duration: 3000 }),
      error: () => this.snackBar.open('Failed to save settings', 'Close', { duration: 3000 }),
    });
  }

  saveAssetsExpenses() {
    this.settingsService.update(this.aeForm.value).subscribe({
      next: () => this.snackBar.open('Assets & Expenses settings saved', 'Close', { duration: 3000 }),
      error: () => this.snackBar.open('Failed to save settings', 'Close', { duration: 3000 }),
    });
  }

  accountOptions(key: string): Account[] {
    switch (key) {
      case 'asset_sale_income_account_id':
      case 'transfer_service_fee_account_id':
        return this.revenueAccounts;
      case 'equipment_account_id':
      case 'prepaid_rent_account_id':
        return this.assetAccounts;
      default:
        return this.expenseAccounts;
    }
  }

  private syncTransferFeeControls() {
    const on = this.transferForm.get('transfer_requires_service_fee')!.value === true;
    ['transfer_service_fee_flat','transfer_service_fee_percentage','transfer_service_fee_account_id','transfer_fee_payment_stage'].forEach(key => {
      const ctrl = this.transferForm.get(key)!;
      if (on) ctrl.enable({ emitEvent: false });
      else    ctrl.disable({ emitEvent: false });
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