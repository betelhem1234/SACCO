import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { MemberListComponent } from './components/member-list/member-list.component';
import { MemberFormComponent } from './components/member-form/member-form.component';
import { SavingListComponent } from './components/saving-list/saving-list.component';
import { BankListComponent } from './components/bank-list/bank-list.component';
import { SavingTypeListComponent } from './components/saving-type-list/saving-type-list.component';

export const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'members', component: MemberListComponent },
    { path: 'saving', component: SavingListComponent },
    { path: 'banks', component: BankListComponent },
    { path: 'saving-types', component: SavingTypeListComponent },
];
