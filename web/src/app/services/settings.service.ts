import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private api = inject(ApiService);

  readonly settings = signal<Record<string, string>>({});

  load() {
    this.api.getSettings().subscribe(s => {
      this.settings.set(s);
      this.applyTheme(s);
    });
  }

  update(settings: Record<string, string>) {
    return this.api.updateSettings(settings);
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
