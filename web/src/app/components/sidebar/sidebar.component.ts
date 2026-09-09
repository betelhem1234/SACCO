import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import { selectUser } from '../../state/auth/auth.selectors';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './sidebar.component.html',

  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  private store = inject(Store);
  protected settingsService = inject(SettingsService);
  user$ = this.store.select(selectUser);

  financeOpen = false;

  toggleFinance(): void {
    this.financeOpen = !this.financeOpen;
  }

  isAdmin(user: any): boolean {
    return user?.roles?.includes('ROLE_SUPER_ADMIN') === true;
  }
}

