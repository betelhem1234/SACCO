import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  template: `
    <div class="flex flex-col h-screen flex-shrink-0" style="width:260px;background:#0f2744">

      <!-- Brand -->
      <div class="flex items-center gap-3 px-6 py-5" style="border-bottom:1px solid rgba(255,255,255,0.08)">
        <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background:linear-gradient(135deg,#10b981,#059669)">
          <mat-icon style="color:white;font-size:20px;width:20px;height:20px">account_balance</mat-icon>
        </div>
        <div>
          <p class="font-bold text-white text-sm tracking-wider">SACCO</p>
          <p class="text-xs" style="color:#64b5f6">Management System</p>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p class="text-xs font-semibold px-3 mb-2" style="color:#4a6fa1;letter-spacing:.1em">MAIN MENU</p>

        <a routerLink="/dashboard" routerLinkActive="nav-active" [routerLinkActiveOptions]="{exact:true}"
           class="nav-item flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer no-underline transition-all duration-200"
           style="color:#94a3b8">
          <div class="nav-icon w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200">
            <mat-icon style="font-size:18px;width:18px;height:18px">dashboard</mat-icon>
          </div>
          <span class="text-sm font-medium">Dashboard</span>
        </a>

        <a routerLink="/members" routerLinkActive="nav-active"
           class="nav-item flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer no-underline transition-all duration-200"
           style="color:#94a3b8">
          <div class="nav-icon w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200">
            <mat-icon style="font-size:18px;width:18px;height:18px">group</mat-icon>
          </div>
          <span class="text-sm font-medium">Member Registration</span>
        </a>

        <a routerLink="/saving" routerLinkActive="nav-active"
           class="nav-item flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer no-underline transition-all duration-200"
           style="color:#94a3b8">
          <div class="nav-icon w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200">
            <mat-icon style="font-size:18px;width:18px;height:18px">savings</mat-icon>
          </div>
          <span class="text-sm font-medium">Saving</span>
        </a>

        <a routerLink="/withdrawal" routerLinkActive="nav-active"
           class="nav-item flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer no-underline transition-all duration-200"
           style="color:#94a3b8">
          <div class="nav-icon w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200">
            <mat-icon style="font-size:18px;width:18px;height:18px">payments</mat-icon>
          </div>
          <span class="text-sm font-medium">Withdrawal</span>
        </a>

        <a routerLink="/loan" routerLinkActive="nav-active"
           class="nav-item flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer no-underline transition-all duration-200"
           style="color:#94a3b8">
          <div class="nav-icon w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200">
            <mat-icon style="font-size:18px;width:18px;height:18px">monetization_on</mat-icon>
          </div>
          <span class="text-sm font-medium">Loan</span>
        </a>

        <p class="text-xs font-semibold px-3 mt-6 mb-2" style="color:#4a6fa1;letter-spacing:.1em">LOOKUPS</p>
        <a routerLink="/banks" routerLinkActive="nav-active"
           class="nav-item flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer no-underline transition-all duration-200"
           style="color:#94a3b8">
          <div class="nav-icon w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200">
            <mat-icon style="font-size:18px;width:18px;height:18px">account_balance</mat-icon>
          </div>
          <span class="text-sm font-medium">Banks</span>
        </a>

        <a routerLink="/saving-types" routerLinkActive="nav-active"
           class="nav-item flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer no-underline transition-all duration-200"
           style="color:#94a3b8">
          <div class="nav-icon w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200">
            <mat-icon style="font-size:18px;width:18px;height:18px">category</mat-icon>
          </div>
          <span class="text-sm font-medium">Saving Types</span>
        </a>
      </nav>

      <!-- Footer -->
      <div class="px-6 py-4" style="border-top:1px solid rgba(255,255,255,0.08)">
        <p class="text-xs text-center" style="color:#4a6fa1">v1.0.0 &copy; 2026 SACCO System</p>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }

    .nav-item:hover {
      background: rgba(255,255,255,0.06) !important;
      color: #ffffff !important;
    }
    .nav-item:hover .nav-icon {
      background: rgba(16,185,129,0.15) !important;
      color: #10b981 !important;
    }
    .nav-item:hover mat-icon {
      color: #10b981 !important;
    }

    .nav-active {
      background: linear-gradient(135deg, rgba(16,185,129,0.18), rgba(5,150,105,0.12)) !important;
      color: #ffffff !important;
      box-shadow: 0 0 0 1px rgba(16,185,129,0.25);
    }
    .nav-active .nav-icon {
      background: linear-gradient(135deg,#10b981,#059669) !important;
    }
    .nav-active mat-icon {
      color: #ffffff !important;
    }
    mat-icon { color: inherit; }
  `]
})
export class SidebarComponent { }

