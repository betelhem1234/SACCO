import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Store } from '@ngrx/store';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { combineLatest } from 'rxjs';
import { Member } from '@sacco/shared-models';
import { AppState } from '../../models/state.model';
import { loadMembers } from '../../state/members/members.actions';
import { selectAllMembers, selectMembersStatus } from '../../state/members/members.selectors';
import { num } from '../../utils/finance-format';
import {
  loadRegions,
  loadSubcities,
  loadEducations,
  loadBranches,
} from '../../state/lookups/lookups.actions';
import {
  selectAllRegions,
  selectAllSubcities,
  selectAllEducations,
  selectAllBranches,
} from '../../state/lookups/lookups.selectors';
import { LookupItem } from '../../state/lookups/lookups.actions';

export interface GrowthBar {
  label: string;
  value: number;
  x: number;
  w: number;
  y: number;
  h: number;
  display: string;
}

export interface DonutSlice {
  name: string;
  value: number;
  color: string;
  dash: string;
  rotate: number;
  percent: number;
}

export interface TopRow {
  name: string;
  value: number;
  x: number;
  y: number;
  w: number;
  h: number;
  display: string;
}

export interface AgeBar {
  label: string;
  value: number;
  x: number;
  w: number;
  y: number;
  h: number;
  display: string;
}

@Component({
  selector: 'app-member-report',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatTooltipModule, MatProgressSpinnerModule, MatFormFieldModule, MatInputModule, MatButtonToggleModule],
  templateUrl: './member-report.component.html',
  styleUrls: ['./member-report.component.css'],
})
export class MemberReportComponent implements OnInit {
  private store = inject(Store<AppState>);
  private location = inject(Location);

  members: Member[] = [];
  loading = false;
  searchText = '';

  view: 'TABLE' | 'CHART' = 'TABLE';
  readonly viewOptions: { id: 'TABLE' | 'CHART'; label: string; icon: string }[] = [
    { id: 'TABLE', label: 'Table', icon: 'table_rows' },
    { id: 'CHART', label: 'Charts', icon: 'bar_chart' },
  ];
  readonly palette = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#f43f5e', '#84cc16', '#6366f1', '#14b8a6'];
  readonly num = num;

  private regions: LookupItem[] = [];
  private subcities: LookupItem[] = [];
  private educations: LookupItem[] = [];
  private branches: LookupItem[] = [];

  ngOnInit(): void {
    this.store.dispatch(loadMembers());
    this.store.dispatch(loadRegions());
    this.store.dispatch(loadSubcities());
    this.store.dispatch(loadEducations());
    this.store.dispatch(loadBranches());

    combineLatest([
      this.store.select(selectAllMembers),
      this.store.select(selectMembersStatus),
      this.store.select(selectAllRegions),
      this.store.select(selectAllSubcities),
      this.store.select(selectAllEducations),
      this.store.select(selectAllBranches),
    ]).subscribe(([members, status, regions, subcities, educations, branches]) => {
      this.members = members ?? [];
      this.loading = status === 'loading';
      this.regions = regions ?? [];
      this.subcities = subcities ?? [];
      this.educations = educations ?? [];
      this.branches = branches ?? [];
    });
  }

  get rows(): Member[] {
    const q = this.searchText.trim().toLowerCase();
    if (!q) {
      return this.members;
    }
    return this.members.filter((m) =>
      `${this.memberNumber(m)} ${m.fullName ?? ''}`.toLowerCase().includes(q)
    );
  }

  get maleCount(): number {
    return this.members.filter((m) => this.isMale(m)).length;
  }

  get femaleCount(): number {
    return this.members.filter((m) => (m.isMale != null || m.is_male != null) && !this.isMale(m)).length;
  }

  memberNumber(m: Member): string {
    return m.idNumbe || m.memberid || '—';
  }

  fullName(m: Member): string {
    return m.fullName || '—';
  }

  isMale(m: Member): boolean {
    return m.isMale != null ? m.isMale : !!m.is_male;
  }

  ageOf(m: Member): number | null {
    const bd = typeof m.birthDate === 'number' && m.birthDate > 0 ? m.birthDate : null;
    if (bd) {
      const d = new Date(bd);
      const now = new Date();
      let a = now.getFullYear() - d.getFullYear();
      if (now.getMonth() < d.getMonth() || (now.getMonth() === d.getMonth() && now.getDate() < d.getDate())) {
        a--;
      }
      return Math.max(0, a);
    }
    return typeof m.age === 'number' ? m.age : null;
  }

  phoneOf(m: Member): string {
    return m.telephone || m.phone || '—';
  }

  regionName(m: Member): string {
    const id = m.state_id;
    if (!id) {
      return '—';
    }
    const r = this.regions.find((x) => `${x.id}` === `${id}`);
    return r ? r.name : '—';
  }

  subcityName(m: Member): string {
    const id = m.subcity;
    if (!id) {
      return '—';
    }
    const s = this.subcities.find((x) => `${x.id}` === `${id}`);
    return s ? s.name : '—';
  }

  educationName(m: Member): string {
    const id = m.education_id;
    if (!id) {
      return '—';
    }
    const e = this.educations.find((x) => `${x.id}` === `${id}`);
    return e ? e.name : '—';
  }

  branchName(m: Member): string {
    const id = m.branchId || (m as any).branch_id;
    if (!id) {
      return '—';
    }
    const b = this.branches.find((x) => `${x.id}` === `${id}`);
    return b ? b.name : id;
  }

  addressOf(m: Member): string {
    const parts = [m.house_no, m.woreda, m.kebele, m.address].filter((x) => !!x);
    return parts.length ? parts.join(', ') : '—';
  }

  membershipDate(m: Member): number | null {
    const d = m.membership_date || m.registrationDate || m.reg_date;
    return typeof d === 'number' && d > 0 ? d : null;
  }

  typeLabel(m: Member): string {
    const t = m.memberType ?? m.member_type;
    if (t === 2) {
      return 'Group';
    }
    if (t === 0) {
      return 'Child';
    }
    return 'Normal';
  }

  typeClass(m: Member): { background: string; color: string } {
    const t = m.memberType ?? m.member_type;
    if (t === 2) {
      return { background: '#fef3c7', color: '#92400e' };
    }
    if (t === 0) {
      return { background: '#dbeafe', color: '#1e40af' };
    }
    return { background: '#dcfce7', color: '#166534' };
  }

  statusOf(m: Member): number {
    return m.membersipStatus ?? m.status ?? 1;
  }

  statusLabel(m: Member): string {
    const s = this.statusOf(m);
    if (s === 3 || s === 606) {
      return 'Frozen';
    }
    if (s === 2) {
      return 'Pending';
    }
    if (s === 0) {
      return 'Inactive';
    }
    return 'Active';
  }

  statusClass(m: Member): { background: string; color: string } {
    const s = this.statusOf(m);
    if (s === 3 || s === 606) {
      return { background: '#fee2e2', color: '#991b1b' };
    }
    if (s === 2) {
      return { background: '#fef3c7', color: '#92400e' };
    }
    if (s === 0) {
      return { background: '#e2e8f0', color: '#475569' };
    }
    return { background: '#d1fae5', color: '#065f46' };
  }

  countByType(t: number): number {
    return this.members.filter((m) => (m.memberType ?? m.member_type) === t).length;
  }

  countByStatus(s: number): number {
    return this.members.filter((m) => this.statusOf(m) === s).length;
  }

  setView(id: string): void {
    this.view = id as 'TABLE' | 'CHART';
  }

  chartsEmpty(): boolean {
    return this.members.length === 0;
  }

  monthlyGrowth(): GrowthBar[] {
    const counts = new Map<string, number>();
    for (const m of this.rows) {
      const d = this.membershipDate(m);
      if (!d) continue;
      const dt = new Date(d);
      if (isNaN(dt.getTime())) continue;
      const key = `${dt.getFullYear()}-${dt.getMonth() + 1}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    if (counts.size === 0) return [];
    const keys = [...counts.keys()].sort();
    const agg = new Map<string, { label: string; value: number }>();
    if (keys.length > 12) {
      for (const k of keys) {
        const y = k.split('-')[0];
        const e = agg.get(y) ?? { label: y, value: 0 };
        e.value += counts.get(k) || 0;
        agg.set(y, e);
      }
    } else {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      for (const k of keys) {
        const [y, mo] = k.split('-').map(Number);
        agg.set(k, { label: `${months[mo - 1]} ${String(y).slice(2)}`, value: counts.get(k) || 0 });
      }
    }
    const points = [...agg.values()];
    const maxVal = Math.max(...points.map((p) => p.value), 1);
    const W = 640, H = 260, padL = 10, padR = 10, padT = 26, padB = 42;
    const slot = (W - padL - padR) / points.length;
    const bw = Math.min(slot * 0.55, 46);
    return points.map((p, i) => {
      const h = Math.max((p.value / maxVal) * (H - padT - padB), 2);
      const x = padL + i * slot + (slot - bw) / 2;
      return { label: p.label, value: p.value, x, w: bw, y: H - padB - h, h, display: num(p.value, 0) };
    });
  }

  private donut(items: { name: string; value: number; color: string }[]): DonutSlice[] {
    const r = 70, cw = 2 * Math.PI * r;
    const filtered = items.filter((i) => i.value > 0);
    const total = filtered.reduce((s, i) => s + i.value, 0);
    if (total <= 0) return [];
    let acc = 0;
    return filtered.map((i) => {
      const seg = (i.value / total) * cw;
      const rotate = (acc / total) * 360 - 90;
      acc += i.value;
      return { name: i.name, value: i.value, color: i.color, dash: `${seg} ${cw - seg}`, rotate, percent: (i.value / total) * 100 };
    });
  }

  typeSlices(): DonutSlice[] {
    return this.donut([
      { name: 'Normal', value: this.countByType(1), color: '#10b981' },
      { name: 'Child', value: this.countByType(0), color: '#3b82f6' },
      { name: 'Group', value: this.countByType(2), color: '#f59e0b' },
    ]);
  }

  genderSlices(): DonutSlice[] {
    const known = this.rows.filter((m) => m.isMale != null || m.is_male != null).length;
    if (known <= 0) return [];
    return this.donut([
      { name: 'Male', value: this.rows.filter((m) => this.isMale(m)).length, color: '#3b82f6' },
      { name: 'Female', value: known - this.rows.filter((m) => this.isMale(m)).length, color: '#ec4899' },
    ]);
  }

  statusSlices(): DonutSlice[] {
    return this.donut([
      { name: 'Active', value: this.countByStatus(1), color: '#10b981' },
      { name: 'Pending', value: this.countByStatus(2), color: '#f59e0b' },
      { name: 'Frozen', value: this.countByStatus(3) + this.countByStatus(606), color: '#ef4444' },
      { name: 'Inactive', value: this.countByStatus(0), color: '#94a3b8' },
    ]);
  }

  unknownGenderCount(): number {
    return this.rows.length - this.rows.filter((m) => m.isMale != null || m.is_male != null).length;
  }

  ageBars(): AgeBar[] {
    const buckets = [
      { label: '0–17', min: 0, max: 17 },
      { label: '18–25', min: 18, max: 25 },
      { label: '26–35', min: 26, max: 35 },
      { label: '36–45', min: 36, max: 45 },
      { label: '46–60', min: 46, max: 60 },
      { label: '60+', min: 61, max: 999 },
    ];
    const values = buckets.map((b) => ({
      label: b.label,
      value: this.rows.filter((m) => {
        const a = this.ageOf(m);
        return a != null && a >= b.min && a <= b.max;
      }).length,
    }));
    if (values.every((v) => v.value === 0)) return [];
    const maxVal = Math.max(...values.map((v) => v.value), 1);
    const W = 640, H = 260, padL = 10, padR = 10, padT = 26, padB = 42;
    const innerW = W - padL - padR;
    const gw = innerW / values.length;
    const bw = Math.min(gw * 0.6, 60);
    const chartH = H - padT - padB;
    return values.map((v, i) => {
      const h = Math.max((v.value / maxVal) * chartH, v.value > 0 ? 2 : 0);
      const x = padL + i * gw + (gw - bw) / 2;
      return { label: v.label, value: v.value, x, w: bw, y: H - padB - h, h, display: num(v.value, 0) };
    });
  }

  topRegions(): TopRow[] {
    return this.topBy((m) => this.regionName(m));
  }

  topBranches(): TopRow[] {
    return this.topBy((m) => this.branchName(m));
  }

  private topBy(fn: (m: Member) => string): TopRow[] {
    const map = new Map<string, number>();
    for (const m of this.rows) {
      const key = fn(m);
      if (!key || key === '—') continue;
      map.set(key, (map.get(key) || 0) + 1);
    }
    const rows = [...map.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 7);
    if (rows.length === 0) return [];
    const maxVal = Math.max(...rows.map((r) => r.value), 1);
    const labelX = 150;
    const H = 24 + rows.length * 30;
    return rows.map((r, i) => ({
      name: r.name.length > 26 ? r.name.slice(0, 25) + '…' : r.name,
      value: r.value,
      x: labelX,
      y: 14 + i * 30,
      w: Math.max((r.value / maxVal) * (620 - labelX - 14), 4),
      h: 16,
      display: num(r.value, 0),
    }));
  }

  back(): void {
    this.location.back();
  }

  print(): void {
    window.print();
  }

  hasData(): boolean {
    return this.members.length > 0;
  }
}