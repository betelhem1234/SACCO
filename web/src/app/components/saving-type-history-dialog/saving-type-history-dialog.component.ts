import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { SavingTypeAmountHistory } from '@sacco/shared-models';
import { ApiService } from '../../services/api.service';
import { etb, fmtDate } from '../../utils/finance-format';

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