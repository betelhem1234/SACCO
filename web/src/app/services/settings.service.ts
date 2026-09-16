import { Injectable, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { ApiService } from './api.service';

const CACHE_KEY = 'sacco_settings_cache';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private api = inject(ApiService);

  readonly settings = signal<Record<string, string>>({});
  private loaded = false;

  constructor() {
    this.restoreCache();
  }

  private restoreCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) this.settings.set(JSON.parse(raw));
    } catch {
      /* ignore corrupted cache */
    }
  }

  private persist() {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(this.settings()));
    } catch {
      /* ignore (private mode / quota) */
    }
  }

  /** Loads from cache immediately, then refreshes from the server once per session. */
  load(force = false) {
    if (this.loaded && !force) return;
    this.loaded = true;
    this.api.getSettings().subscribe(s => {
      this.settings.set(s);
      this.persist();
      this.applyTheme(s);
    });
  }

  get(key: string): string {
    return this.settings()[key] ?? '';
  }

  has(key: string): boolean {
    const v = this.get(key);
    return !!v && v.trim().length > 0;
  }

  readonly requiredShareKeys: { key: string; label: string }[] = [
    { key: 'share_unit_price', label: 'Share Unit Price' },
    { key: 'registration_fee', label: 'Registration Fee Amount' },
    { key: 'minimum_share_unit', label: 'Minimum Share Unit' },
    { key: 'maximum_share_unit', label: 'Maximum Share Unit' },
    { key: 'share_purchase_account_id', label: 'Share Purchase Account' },
    { key: 'registration_fee_account_id', label: 'Registration Fee Account' },
  ];

  missingShareSettings(): { key: string; label: string }[] {
    return this.requiredShareKeys.filter(k => !this.has(k.key));
  }

  shareSettingsConfigured(): boolean {
    return this.missingShareSettings().length === 0;
  }

  configuredCount(keys: string[]): number {
    return keys.filter(k => this.has(k)).length;
  }

  update(settings: Record<string, string>) {
    return this.api.updateSettings(settings).pipe(
      tap(s => {
        this.settings.set({ ...this.settings(), ...s });
        this.persist();
        this.applyTheme(s);
      })
    );
  }

  private applyTheme(s: Record<string, string>) {
    if (s['primary_color']) {
      document.documentElement.style.setProperty('--primary', s['primary_color']);
      document.documentElement.style.setProperty('--primary-dark', this.darken(s['primary_color'], 40));
    }
    if (s['secondary_color']) {
      document.documentElement.style.setProperty('--accent', s['secondary_color']);
      document.documentElement.style.setProperty('--accent-dark', this.darken(s['secondary_color'], 30));
    }
    if (s['tertiary_color']) document.documentElement.style.setProperty('--accent-light', s['tertiary_color']);
  }

  private darken(hex: string, amount: number = 30): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max((num >> 16) - amount, 0);
    const g = Math.max(((num >> 8) & 0xff) - amount, 0);
    const b = Math.max((num & 0xff) - amount, 0);
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  }
}