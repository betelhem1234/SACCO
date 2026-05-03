import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'lib-action-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <button mat-raised-button [color]="color" (click)="onClick.emit()" class="action-btn">
      <mat-icon *ngIf="icon">{{ icon }}</mat-icon>
      <span class="ml-2">{{ label }}</span>
    </button>
  `,
  styles: [`
    .action-btn {
      padding: 0 24px;
      height: 48px;
      border-radius: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .action-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(0,0,0,0.15);
    }
    .ml-2 {
      margin-left: 8px;
    }
  `]
})
export class ActionButton {
  @Input() label: string = 'Action';
  @Input() icon: string = '';
  @Input() color: string = 'primary';
  @Output() onClick = new EventEmitter<void>();
}
