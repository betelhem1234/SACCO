import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { MemberListComponent } from './components/member-list/member-list.component';
import { MemberFormComponent } from './components/member-form/member-form.component';
import { SavingListComponent } from './components/saving-list/saving-list.component';
import { AccountListComponent } from './components/account-list/account-list.component';
import { SavingTypeListComponent } from './components/saving-type-list/saving-type-list.component';
import { WithdrawalListComponent } from './components/withdrawal-list/withdrawal-list.component';
import { LoanTypeListComponent } from './components/loan-type-list/loan-type-list.component';
import { LoanRequestListComponent } from './components/loan-request-list/loan-request-list.component';
import { LoanListComponent } from './components/loan-list/loan-list.component';
import { LoanDetailComponent } from './components/loan-detail/loan-detail.component';

export const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'members', component: MemberListComponent },
    { path: 'saving', component: SavingListComponent },
    { path: 'accounts', component: AccountListComponent },
    { path: 'saving-types', component: SavingTypeListComponent },
    { path: 'loan-types', component: LoanTypeListComponent },
    { path: 'withdrawal', component: WithdrawalListComponent },
    { path: 'loans', component: LoanListComponent },
    { path: 'loans/requests', component: LoanRequestListComponent },
    { path: 'loans/:id', component: LoanDetailComponent },
];
