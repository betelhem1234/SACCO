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
  savingOpen = false;
  sharePurchaseOpen = false;
  memberOpen = false;
  withdrawalOpen = false;
  transferOpen = false;
  expenseOpen = false;

  toggleFinance(): void {
    this.financeOpen = !this.financeOpen;
  }

  toggleSaving(): void {
    this.savingOpen = !this.savingOpen;
  }

  toggleSharePurchase(): void {
    this.sharePurchaseOpen = !this.sharePurchaseOpen;
  }

  toggleMember(): void {
    this.memberOpen = !this.memberOpen;
  }

  toggleWithdrawal(): void {
    this.withdrawalOpen = !this.withdrawalOpen;
  }

  toggleTransfer(): void {
    this.transferOpen = !this.transferOpen;
  }

  toggleExpense(): void {
    this.expenseOpen = !this.expenseOpen;
  }

  isAdmin(user: any): boolean {
    return user?.roles?.includes('ROLE_SUPER_ADMIN') === true;
  }
}

