import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Member, Saving, Account, SavingType, SavingTypeAmountHistory, Withdrawal, SharedLoanType, LoanRequest, Loan, LoanSchedule, DisburseRequest, RepaymentRequest, DueAmountResponse, MemberSummaryPartialList, ShareSubscription, SharePurchase, ShareTransfer, MemberGroup, Transfer, AccountClassification,
  TrialBalanceReport, IncomeStatementReport, BalanceSheetReport, CashFlowReport, GeneralLedgerReport, RetainedEarningsReport, FinanceSummaryReport,
  MonthlyFinanceReport, WeeklyFinanceReport, StatementOfChangesInEquityReport, CashFlowStatementReport,
  ReportDetail, PeriodDetailParams,
} from '@sacco/shared-models';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private http = inject(HttpClient);
    private apiUrl = '/sacco/api';

    // Members
    getMembers(): Observable<Member[]> {
        return this.http.get<Member[]>(`${this.apiUrl}/members`);
    }

    getMember(id: string): Observable<Member> {
        return this.http.get<Member>(`${this.apiUrl}/members/${id}`);
    }

    searchMembers(
        pageSize: number,
        pageIndex: number,
        sortField: string,
        sortDirection: string,
        searchText?: string,
        memberId?: string,
        memberType?: number,
        genderFilter?: number,
        branchId?: string,
        statusFilter?: number
    ): Observable<MemberSummaryPartialList> {
        let params = new HttpParams()
            .set('pageSize', String(pageSize))
            .set('pageIndex', String(pageIndex))
            .set('sortField', sortField)
            .set('sortDirection', sortDirection);
        if (searchText) params = params.set('searchText', searchText);
        if (memberId) params = params.set('memberId', memberId);
        if (memberType != null && memberType >= 0) params = params.set('memberType', String(memberType));
        if (genderFilter != null && genderFilter >= 0) params = params.set('genderFilter', String(genderFilter));
        if (branchId) params = params.set('branchId', branchId);
        if (statusFilter != null && statusFilter >= 0) params = params.set('statusFilter', String(statusFilter));
        return this.http.get<MemberSummaryPartialList>(`${this.apiUrl}/members/search`, { params });
    }

    addMember(member: Member): Observable<Member> {
        return this.http.post<Member>(`${this.apiUrl}/members`, member);
    }

    updateMember(id: string, member: Member): Observable<Member> {
        return this.http.put<Member>(`${this.apiUrl}/members/${id}`, member);
    }

    deleteMember(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/members/${id}`);
    }

    memberDo(id: string, action: string, payload?: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/members/${id}/${action}`, payload || {});
    }

    uploadExcel(file: FormData): Observable<any> {
        return this.http.post(`${this.apiUrl}/members/upload`, file);
    }

    uploadGroupExcel(file: FormData): Observable<any> {
        return this.http.post(`${this.apiUrl}/members/upload-group`, file);
    }

    downloadMembers(ids: string[]): Observable<any> {
        return this.http.post(`${this.apiUrl}/members/download`, { ids });
    }

    downloadAllMembers(): Observable<any> {
        return this.http.post(`${this.apiUrl}/members/download-all`, {});
    }

    emailConfirmation(id: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/members/${id}/email-confirmation`, {});
    }

    // Member Groups
    getMemberGroups(memberId: string): Observable<MemberGroup[]> {
        return this.http.get<MemberGroup[]>(`${this.apiUrl}/member-groups/${memberId}`);
    }

    addMemberGroup(group: MemberGroup): Observable<MemberGroup> {
        return this.http.post<MemberGroup>(`${this.apiUrl}/member-groups`, group);
    }

    updateMemberGroup(id: string, group: MemberGroup): Observable<MemberGroup> {
        return this.http.put<MemberGroup>(`${this.apiUrl}/member-groups/${id}`, group);
    }

    deleteMemberGroup(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/member-groups/${id}`);
    }

    // Branches
    getBranches(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/branches`);
    }

    searchBranches(pageSize: number, pageIndex: number, sortField: string, sortDirection: string): Observable<any> {
        let params = new HttpParams()
            .set('pageSize', String(pageSize))
            .set('pageIndex', String(pageIndex))
            .set('sortField', sortField)
            .set('sortDirection', sortDirection);
        return this.http.get<any>(`${this.apiUrl}/branches`, { params });
    }

    // Regions / States
    getRegions(): Observable<any> {
        return this.http.get(`${this.apiUrl}/regions`);
    }

    addRegion(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/regions`, data);
    }

    updateRegion(id: string, data: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/regions/${id}`, data);
    }

    deleteRegion(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/regions/${id}`);
    }

    // Subcities
    getSubcities(): Observable<any> {
        return this.http.get(`${this.apiUrl}/subcities`);
    }

    getSubcitiesByRegion(regionId: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/subcities/region/${regionId}`);
    }

    addSubcity(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/subcities`, data);
    }

    updateSubcity(id: string, data: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/subcities/${id}`, data);
    }

    deleteSubcity(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/subcities/${id}`);
    }

    // Educations
    getEducations(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/educations`);
    }

    addEducation(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/educations`, data);
    }

    updateEducation(id: string, data: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/educations/${id}`, data);
    }

    deleteEducation(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/educations/${id}`);
    }

    // Saving Types / Products
    getSavingTypes(): Observable<SavingType[]> {
        return this.http.get<SavingType[]>(`${this.apiUrl}/saving-types`);
    }

    addSavingType(savingType: SavingType): Observable<SavingType> {
        return this.http.post<SavingType>(`${this.apiUrl}/saving-types`, savingType);
    }

    updateSavingType(id: string, savingType: SavingType): Observable<SavingType> {
        return this.http.put<SavingType>(`${this.apiUrl}/saving-types/${id}`, savingType);
    }

    deleteSavingType(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/saving-types/${id}`);
    }

    getSavingTypeHistory(id: string): Observable<SavingTypeAmountHistory[]> {
        return this.http.get<SavingTypeAmountHistory[]>(`${this.apiUrl}/saving-types/${id}/history`);
    }

    // Savings
    getSavings(): Observable<Saving[]> {
        return this.http.get<Saving[]>(`${this.apiUrl}/savings`);
    }

    getTracker(memberId: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/savings/${memberId}/tracker`);
    }

    addSaving(saving: Saving): Observable<Saving> {
        return this.http.post<Saving>(`${this.apiUrl}/savings`, saving);
    }

    updateSaving(id: string, saving: Saving): Observable<Saving> {
        return this.http.put<Saving>(`${this.apiUrl}/savings/${id}`, saving);
    }

    deleteSaving(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/savings/${id}`);
    }

    approveSaving(id: string): Observable<Saving> {
        return this.http.post<Saving>(`${this.apiUrl}/savings/${id}/approve`, {});
    }

    rejectSaving(id: string): Observable<Saving> {
        return this.http.post<Saving>(`${this.apiUrl}/savings/${id}/reject`, {});
    }

    // Accounts
    getAccounts(accountType?: number, accountCategory?: number): Observable<Account[]> {
        let params = new HttpParams();
        if (accountType != null) params = params.set('accountType', String(accountType));
        if (accountCategory != null) params = params.set('accountCategory', String(accountCategory));
        return this.http.get<Account[]>(`${this.apiUrl}/accounts`, { params });
    }

    addAccount(account: Account): Observable<Account> {
        return this.http.post<Account>(`${this.apiUrl}/accounts`, account);
    }

    updateAccount(id: string, account: Account): Observable<Account> {
        return this.http.put<Account>(`${this.apiUrl}/accounts/${id}`, account);
    }

    deleteAccount(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/accounts/${id}`);
    }

    // Withdrawals
    getWithdrawals(): Observable<Withdrawal[]> {
        return this.http.get<Withdrawal[]>(`${this.apiUrl}/withdrawals`);
    }

    addWithdrawal(withdrawal: Withdrawal): Observable<Withdrawal> {
        return this.http.post<Withdrawal>(`${this.apiUrl}/withdrawals`, withdrawal);
    }

    updateWithdrawal(id: string, withdrawal: Withdrawal): Observable<Withdrawal> {
        return this.http.put<Withdrawal>(`${this.apiUrl}/withdrawals/${id}`, withdrawal);
    }

    deleteWithdrawal(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/withdrawals/${id}`);
    }

    approveWithdrawal(id: string, approvedBy?: string): Observable<Withdrawal> {
        return this.http.post<Withdrawal>(`${this.apiUrl}/withdrawals/${id}/approve`, { approvedBy });
    }

    rejectWithdrawal(id: string): Observable<Withdrawal> {
        return this.http.post<Withdrawal>(`${this.apiUrl}/withdrawals/${id}/reject`, {});
    }

    // Loan Types
    getLoanTypes(): Observable<SharedLoanType[]> {
        return this.http.get<SharedLoanType[]>(`${this.apiUrl}/loan-types`);
    }

    addLoanType(loanType: SharedLoanType): Observable<SharedLoanType> {
        return this.http.post<SharedLoanType>(`${this.apiUrl}/loan-types`, loanType);
    }

    updateLoanType(id: string, loanType: SharedLoanType): Observable<SharedLoanType> {
        return this.http.put<SharedLoanType>(`${this.apiUrl}/loan-types/${id}`, loanType);
    }

    deleteLoanType(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/loan-types/${id}`);
    }

    // Loan Requests
    getLoanRequests(): Observable<LoanRequest[]> {
        return this.http.get<LoanRequest[]>(`${this.apiUrl}/loans/requests`);
    }

    submitLoanRequest(request: LoanRequest): Observable<LoanRequest> {
        return this.http.post<LoanRequest>(`${this.apiUrl}/loans/request`, request);
    }

    approveLoanRequest(requestId: string, approvedBy?: string): Observable<Loan> {
        return this.http.post<Loan>(`${this.apiUrl}/loans/approve/${requestId}`, { approvedBy });
    }

    // Loans
    getLoans(): Observable<Loan[]> {
        return this.http.get<Loan[]>(`${this.apiUrl}/loans`);
    }

    disburseLoan(loanId: string, payload: DisburseRequest): Observable<Loan> {
        return this.http.post<Loan>(`${this.apiUrl}/loans/disburse/${loanId}`, payload);
    }

    repayLoan(loanId: string, payload: RepaymentRequest): Observable<Loan> {
        return this.http.post<Loan>(`${this.apiUrl}/loans/repay/${loanId}`, payload);
    }

    getLoanSchedule(loanId: string): Observable<LoanSchedule[]> {
        return this.http.get<LoanSchedule[]>(`${this.apiUrl}/loans/${loanId}/schedule`);
    }

    getLoanDue(loanId: string): Observable<DueAmountResponse> {
        return this.http.get<DueAmountResponse>(`${this.apiUrl}/loans/${loanId}/due`);
    }

    // Share Subscriptions
    getShareSubscriptions(): Observable<ShareSubscription[]> {
        return this.http.get<ShareSubscription[]>(`${this.apiUrl}/shares/subscriptions`);
    }

    addShareSubscription(sub: ShareSubscription): Observable<ShareSubscription> {
        return this.http.post<ShareSubscription>(`${this.apiUrl}/shares/subscriptions`, sub);
    }

    updateShareSubscription(id: string, sub: ShareSubscription): Observable<ShareSubscription> {
        return this.http.put<ShareSubscription>(`${this.apiUrl}/shares/subscriptions/${id}`, sub);
    }

    deleteShareSubscription(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/shares/subscriptions/${id}`);
    }

    // Share Purchases
    getSharePurchases(): Observable<SharePurchase[]> {
        return this.http.get<SharePurchase[]>(`${this.apiUrl}/shares/purchases`);
    }

    addSharePurchase(purchase: SharePurchase): Observable<SharePurchase> {
        return this.http.post<SharePurchase>(`${this.apiUrl}/shares/purchases`, purchase);
    }

    updateSharePurchase(id: string, purchase: SharePurchase): Observable<SharePurchase> {
        return this.http.put<SharePurchase>(`${this.apiUrl}/shares/purchases/${id}`, purchase);
    }

    deleteSharePurchase(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/shares/purchases/${id}`);
    }

    // Transfers
    getTransfers(): Observable<Transfer[]> {
        return this.http.get<Transfer[]>(`${this.apiUrl}/transfers`);
    }

    addTransfer(transfer: Transfer): Observable<Transfer> {
        return this.http.post<Transfer>(`${this.apiUrl}/transfers`, transfer);
    }

    updateTransfer(id: string, transfer: Transfer): Observable<Transfer> {
        return this.http.put<Transfer>(`${this.apiUrl}/transfers/${id}`, transfer);
    }

    deleteTransfer(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/transfers/${id}`);
    }

    // Share Transfers
    getShareTransfers(): Observable<ShareTransfer[]> {
        return this.http.get<ShareTransfer[]>(`${this.apiUrl}/share-transfers`);
    }

    addShareTransfer(transfer: ShareTransfer): Observable<ShareTransfer> {
        return this.http.post<ShareTransfer>(`${this.apiUrl}/share-transfers`, transfer);
    }

    updateShareTransfer(id: string, transfer: ShareTransfer): Observable<ShareTransfer> {
        return this.http.put<ShareTransfer>(`${this.apiUrl}/share-transfers/${id}`, transfer);
    }

    deleteShareTransfer(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/share-transfers/${id}`);
    }

    // Settings
    getSettings(): Observable<Record<string, string>> {
        return this.http.get<Record<string, string>>(`${this.apiUrl}/settings`);
    }

    updateSettings(settings: Record<string, string>): Observable<Record<string, string>> {
        return this.http.put<Record<string, string>>(`${this.apiUrl}/settings`, settings);
    }

    // ─── Finance reports ────────────────────────────────────────────────────

    private financeParams(from?: number | null, to?: number | null, accountId?: string): HttpParams {
        let params = new HttpParams();
        if (from != null) params = params.set('from', String(from));
        if (to != null) params = params.set('to', String(to));
        if (accountId) params = params.set('accountId', accountId);
        return params;
    }

    getTrialBalance(from?: number | null, to?: number | null): Observable<TrialBalanceReport> {
        return this.http.get<TrialBalanceReport>(`${this.apiUrl}/finance/trial-balance`, { params: this.financeParams(from, to) });
    }

    getIncomeStatement(from?: number | null, to?: number | null): Observable<IncomeStatementReport> {
        return this.http.get<IncomeStatementReport>(`${this.apiUrl}/finance/income-statement`, { params: this.financeParams(from, to) });
    }

    getBalanceSheet(from?: number | null, to?: number | null): Observable<BalanceSheetReport> {
        return this.http.get<BalanceSheetReport>(`${this.apiUrl}/finance/balance-sheet`, { params: this.financeParams(from, to) });
    }

    getCashFlow(from?: number | null, to?: number | null): Observable<CashFlowReport> {
        return this.http.get<CashFlowReport>(`${this.apiUrl}/finance/cash-flow`, { params: this.financeParams(from, to) });
    }

    getCashFlowStatement(from?: number | null, to?: number | null): Observable<CashFlowStatementReport> {
        return this.http.get<CashFlowStatementReport>(`${this.apiUrl}/finance/cash-flow-statement`, { params: this.financeParams(from, to) });
    }

    getGeneralLedger(from?: number | null, to?: number | null, accountId?: string): Observable<GeneralLedgerReport> {
        return this.http.get<GeneralLedgerReport>(`${this.apiUrl}/finance/general-ledger`, { params: this.financeParams(from, to, accountId) });
    }

    getRetainedEarnings(from?: number | null, to?: number | null): Observable<RetainedEarningsReport> {
        return this.http.get<RetainedEarningsReport>(`${this.apiUrl}/finance/retained-earnings`, { params: this.financeParams(from, to) });
    }

    getStatementOfChangesInEquity(from?: number | null, to?: number | null): Observable<StatementOfChangesInEquityReport> {
        return this.http.get<StatementOfChangesInEquityReport>(`${this.apiUrl}/finance/statement-of-changes-in-equity`, { params: this.financeParams(from, to) });
    }

    getFinanceSummary(from?: number | null, to?: number | null): Observable<FinanceSummaryReport> {
        return this.http.get<FinanceSummaryReport>(`${this.apiUrl}/finance/summary`, { params: this.financeParams(from, to) });
    }

    getMonthlyReport(year: number): Observable<MonthlyFinanceReport> {
        let params = new HttpParams().set('year', String(year));
        return this.http.get<MonthlyFinanceReport>(`${this.apiUrl}/finance/monthly-report`, { params });
    }

    getWeeklyReport(year: number): Observable<WeeklyFinanceReport> {
        let params = new HttpParams().set('year', String(year));
        return this.http.get<WeeklyFinanceReport>(`${this.apiUrl}/finance/weekly-report`, { params });
    }

    getPeriodDetail(params: PeriodDetailParams): Observable<ReportDetail> {
        let p = new HttpParams()
            .set('from', String(params.from))
            .set('to', String(params.to))
            .set('category', params.category);
        if (params.accountName) {
            p = p.set('accountName', params.accountName);
        }
        return this.http.get<ReportDetail>(`${this.apiUrl}/finance/period-detail`, { params: p });
    }

    // Account Classifications
    getAccountClassifications(): Observable<AccountClassification[]> {
        return this.http.get<AccountClassification[]>(`${this.apiUrl}/account-classifications`);
    }

    addAccountClassification(accountClassification: AccountClassification): Observable<AccountClassification> {
        return this.http.post<AccountClassification>(`${this.apiUrl}/account-classifications`, accountClassification);
    }

    updateAccountClassification(id: string, accountClassification: AccountClassification): Observable<AccountClassification> {
        return this.http.put<AccountClassification>(`${this.apiUrl}/account-classifications/${id}`, accountClassification);
    }

    deleteAccountClassification(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/account-classifications/${id}`);
    }
}
