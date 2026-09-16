import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ReportDetail } from '@sacco/shared-models';
import { etb, fmtDate, sortIcon, sortRows } from '../../../../utils/finance-format';

@Component({
    selector: 'app-finance-report-detail',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule,
    ],
    templateUrl: './finance-report-detail.component.html',
    styleUrls: ['./finance-report-detail.component.css'],
})
export class FinanceReportDetailComponent {
    readonly etb = etb;
    readonly fmtDate = fmtDate;
    readonly sortIcon = sortIcon;

    sortAsc = false;

    constructor(
        private dialogRef: MatDialogRef<FinanceReportDetailComponent>,
        @Inject(MAT_DIALOG_DATA) public data: ReportDetail
    ) { }

    toggleDateSort(): void {
        this.sortAsc = !this.sortAsc;
    }

    sortedRows(): ReportDetail['rows'] {
        return sortRows(this.data?.rows ?? [], 'date', this.sortAsc) as ReportDetail['rows'];
    }

    onClose(): void {
        this.dialogRef.close();
    }
}