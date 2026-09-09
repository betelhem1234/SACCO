import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { SavingTypeAmountHistory } from '@sacco/shared-models';
import { ApiService } from '../../services/api.service';

function etb(value: number | null | undefined): string {
    if (value == null || isNaN(value)) return 'ETB 0.00';
    const abs = Math.abs(value);
    const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'ETB',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(abs);
    return value < 0 ? `(${formatted})` : formatted;
}

function fmtDate(epoch: number | null | undefined): string {
    if (epoch == null) return '—';
    const d = new Date(epoch);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
}

@Component({
    selector: 'app-saving-type-history-dialog',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
    templateUrl: './saving-type-history-dialog.component.html',
})
export class SavingTypeHistoryDialogComponent implements OnInit {
    readonly etb = etb;
    readonly fmtDate = fmtDate;
    history: SavingTypeAmountHistory[] = [];
    loading = true;
    error = '';

    constructor(
        public dialogRef: MatDialogRef<SavingTypeHistoryDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { savingTypeId: string; name: string },
        private api: ApiService,
    ) { }

    ngOnInit(): void {
        this.api.getSavingTypeHistory(this.data.savingTypeId).subscribe({
            next: (history) => {
                this.history = [...(history ?? [])].sort((a, b) => b.effectiveFrom - a.effectiveFrom);
                this.loading = false;
            },
            error: () => {
                this.error = 'Unable to load the saving amount history.';
                this.loading = false;
            },
        });
    }
}