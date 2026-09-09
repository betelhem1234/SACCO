import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { MemberListComponent } from './components/member-list/member-list.component';
import { MemberFormComponent } from './components/member-form/member-form.component';
import { MemberDetailComponent } from './components/member-detail/member-detail.component';
import { SavingListComponent } from './components/saving-list/saving-list.component';
import { AccountListComponent } from './components/account-list/account-list.component';
import { SavingTypeListComponent } from './components/saving-type-list/saving-type-list.component';
import { WithdrawalListComponent } from './components/withdrawal-list/withdrawal-list.component';
import { LoanTypeListComponent } from './components/loan-type-list/loan-type-list.component';
import { LoanRequestListComponent } from './components/loan-request-list/loan-request-list.component';
import { LoanListComponent } from './components/loan-list/loan-list.component';
import { LoanDetailComponent } from './components/loan-detail/loan-detail.component';
import { RegionListComponent } from './components/region-list/region-list.component';
import { SubcityListComponent } from './components/subcity-list/subcity-list.component';
import { EducationListComponent } from './components/education-list/education-list.component';
import { AccountClassificationListComponent } from './components/account-classification-list/account-classification-list.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { LoginComponent } from './components/login/login.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { UserManagementComponent } from './components/user-management/user-management.component';
import { SettingsComponent } from './components/settings/settings.component';
import { SharePurchaseComponent } from './components/share-purchase/share-purchase.component';
import { TransferComponent } from './components/transfer/transfer.component';
import { FinanceDashboardComponent } from './components/finance/finance-dashboard/finance-dashboard.component';
import { TrialBalanceComponent } from './components/finance/trial-balance/trial-balance.component';
import { IncomeStatementComponent } from './components/finance/income-statement/income-statement.component';
import { BalanceSheetComponent } from './components/finance/balance-sheet/balance-sheet.component';
import { CashFlowComponent } from './components/finance/cash-flow/cash-flow.component';
import { GeneralLedgerComponent } from './components/finance/general-ledger/general-ledger.component';
import { RetainedEarningsComponent } from './components/finance/retained-earnings/retained-earnings.component';
import { AccountLedgerComponent } from './components/finance/account-ledger/account-ledger.component';
import { FinanceReportComponent } from './components/finance/finance-report/finance-report.component';

export const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'reset-password', component: ResetPasswordComponent },
    {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [AuthGuard]
    },
    { path: 'members', component: MemberListComponent, canActivate: [AuthGuard] },
    { path: 'members/:id', component: MemberDetailComponent, canActivate: [AuthGuard] },
    { path: 'saving', component: SavingListComponent, canActivate: [AuthGuard] },
    { path: 'share-purchase', component: SharePurchaseComponent, canActivate: [AuthGuard] },
    { path: 'accounts', component: AccountListComponent, canActivate: [AuthGuard] },
    { path: 'saving-types', component: SavingTypeListComponent, canActivate: [AuthGuard] },
    { path: 'loan-types', component: LoanTypeListComponent, canActivate: [AuthGuard] },
    { path: 'withdrawal', component: WithdrawalListComponent, canActivate: [AuthGuard] },
    { path: 'transfers', component: TransferComponent, canActivate: [AuthGuard] },
    { path: 'regions', component: RegionListComponent, canActivate: [AuthGuard] },
    { path: 'subcities', component: SubcityListComponent, canActivate: [AuthGuard] },
    { path: 'educations', component: EducationListComponent, canActivate: [AuthGuard] },
    { path: 'account-classifications', component: AccountClassificationListComponent, canActivate: [AuthGuard] },
    { path: 'loans', component: LoanListComponent, canActivate: [AuthGuard] },
    { path: 'loans/requests', component: LoanRequestListComponent, canActivate: [AuthGuard] },
    { path: 'loans/:id', component: LoanDetailComponent, canActivate: [AuthGuard] },
    { path: 'finance', component: FinanceDashboardComponent, canActivate: [AuthGuard] },
    { path: 'finance/trial-balance', component: TrialBalanceComponent, canActivate: [AuthGuard] },
    { path: 'finance/income-statement', component: IncomeStatementComponent, canActivate: [AuthGuard] },
    { path: 'finance/balance-sheet', component: BalanceSheetComponent, canActivate: [AuthGuard] },
    { path: 'finance/cash-flow', component: CashFlowComponent, canActivate: [AuthGuard] },
    { path: 'finance/general-ledger', component: GeneralLedgerComponent, canActivate: [AuthGuard] },
    { path: 'finance/retained-earnings', component: RetainedEarningsComponent, canActivate: [AuthGuard] },
    { path: 'finance/finance-report', component: FinanceReportComponent, canActivate: [AuthGuard] },
    { path: 'finance/account-ledger/:accountId', component: AccountLedgerComponent, canActivate: [AuthGuard] },
    {
        path: 'user-management',
        component: UserManagementComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['ROLE_SUPER_ADMIN'] }
    },
    {
        path: 'settings',
        component: SettingsComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['ROLE_SUPER_ADMIN'] }
    },
];
