import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter } from 'rxjs/operators';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { loadMembers } from './state/members/members.actions';
import { loadSavings } from './state/savings/savings.actions';
import { loadAccounts, loadSavingTypes } from './state/lookups/lookups.actions';
import { selectIsLoggedIn, selectUser } from './state/auth/auth.selectors';
import { logout } from './state/auth/auth.actions';
import { SettingsService } from './services/settings.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {
  private store = inject(Store);
  private router = inject(Router);
  protected settingsService = inject(SettingsService);

  isLoggedIn$ = this.store.select(selectIsLoggedIn);
  user$ = this.store.select(selectUser);

  sidebarOpen = false;

  ngOnInit() {
    (window as any).__appNgOnInitCalled = true;
    this.store.dispatch(loadMembers());
    this.store.dispatch(loadSavings());
    this.store.dispatch(loadAccounts({}));
    this.store.dispatch(loadSavingTypes());
    this.settingsService.load();

    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.sidebarOpen = false);
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    this.sidebarOpen = false;
  }

  doLogout() {
    this.store.dispatch(logout());
  }
}
