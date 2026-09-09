import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';

export interface DetailField {
    key: string;
    label: string;
    type?: 'text' | 'currency' | 'date' | 'boolean' | 'custom';
    formatFn?: (value: any) => string | SafeHtml;
}

export interface DetailDialogData {
    title: string;
    subTitle?: string;
    icon?: string;
    data: any;
    fields: DetailField[];
}

@Component({
    selector: 'app-generic-detail-dialog',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule,
        MatDividerModule
    ],
    templateUrl: './generic-detail-dialog.component.html',
  styleUrls: ['./generic-detail-dialog.component.css']
})
export class GenericDetailDialogComponent {

    constructor(
        private dialogRef: MatDialogRef<GenericDetailDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DetailDialogData,
        private sanitizer: DomSanitizer
    ) { }

    getValue(field: DetailField): any {
        if (!this.data.data) return null;
        return this.data.data[field.key];
    }

    getDisplayValue(val: any): string {
        if (val === null || val === undefined || val === '') return '—';
        return String(val);
    }

    getCustomHtml(field: DetailField): SafeHtml {
        const val = this.getValue(field);
        if (field.formatFn) {
            return this.sanitizer.bypassSecurityTrustHtml(field.formatFn(val) as string);
        }
        return this.getDisplayValue(val);
    }

    onClose() {
        this.dialogRef.close();
    }
}
