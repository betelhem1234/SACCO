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
    template: `
    <div>
      <!-- Header -->
      <div class="px-6 py-5 flex items-center gap-3" style="background:linear-gradient(135deg,#1e3a5f,#2d5282)">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background:rgba(255,255,255,0.15)">
          <span class="material-icons text-white" style="font-size:20px">{{ data.icon || 'info' }}</span>
        </div>
        <div>
          <h2 class="text-white font-bold text-base m-0">{{ data.title }}</h2>
          <p class="text-xs m-0" style="color:#93c5fd">{{ data.subTitle || 'Detailed Information View' }}</p>
        </div>
        <button mat-icon-button (click)="onClose()" class="ml-auto" style="color:white">
            <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Details Body -->
      <mat-dialog-content class="px-0 py-0 m-0" style="background-color: #f8fafc;">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 p-6">
            <ng-container *ngFor="let field of data.fields">
                <div class="flex flex-col bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                    <span class="text-xs font-bold uppercase tracking-wider mb-1" style="color:#64748b">{{ field.label }}</span>
                    <span class="text-sm font-medium" style="color:#1e293b" [ngSwitch]="field.type || 'text'">
                        
                        <ng-container *ngSwitchCase="'currency'">
                            <span class="font-bold text-green-700">{{ getValue(field) | currency:'ETB':'symbol':'1.2-2' }}</span>
                        </ng-container>

                        <ng-container *ngSwitchCase="'date'">
                           {{ getValue(field) ? (getValue(field) | date:'medium') : '—' }}
                        </ng-container>

                        <ng-container *ngSwitchCase="'boolean'">
                           <span class="px-2 py-0.5 rounded text-xs font-bold" 
                                 [ngClass]="getValue(field) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                             {{ getValue(field) ? 'YES' : 'NO' }}
                           </span>
                        </ng-container>

                        <ng-container *ngSwitchCase="'custom'">
                            <span [innerHTML]="getCustomHtml(field)"></span>
                        </ng-container>

                        <ng-container *ngSwitchDefault>
                            {{ getDisplayValue(getValue(field)) }}
                        </ng-container>

                    </span>
                </div>
            </ng-container>
        </div>
      </mat-dialog-content>
      
      <!-- Actions -->
      <mat-dialog-actions align="end" class="px-6 py-4 bg-white" style="border-top:1px solid #e2e8f0;margin-bottom:-0px">
        <button mat-button (click)="onClose()" style="color:#64748b;font-weight:600">Close</button>
      </mat-dialog-actions>
    </div>
  `,
    styles: [`
    mat-dialog-content { min-width: 500px; max-width:700px; max-height:75vh; }
    @media (max-width: 600px) {
        mat-dialog-content { min-width: 100vw; }
    }
  `]
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
