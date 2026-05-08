import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Member, Saving, Account, SavingType, Withdrawal, SharedLoanType, LoanRequest, Loan, LoanSchedule, DisburseRequest, RepaymentRequest, DueAmountResponse } from '@sacco/shared-models';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private http = inject(HttpClient);
    private apiUrl = '/api';

    // Members
    getMembers(): Observable<Member[]> {
        return this.http.get<Member[]>(`${this.apiUrl}/members`);
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

    // Savings
    getSavings(): Observable<Saving[]> {
        return this.http.get<Saving[]>(`${this.apiUrl}/savings`);
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

    // Accounts (optional filters match backend query params)
    getAccounts(accountType?: number, accountCategory?: number): Observable<Account[]> {
        let params = new HttpParams();
        if (accountType != null) {
            params = params.set('accountType', String(accountType));
        }
        if (accountCategory != null) {
            params = params.set('accountCategory', String(accountCategory));
        }
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

    // Saving Types
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

    // ─── Loan Requests ─────────────────────────────────────────────────────────
    getLoanRequests(): Observable<LoanRequest[]> {
        return this.http.get<LoanRequest[]>(`${this.apiUrl}/loans/requests`);
    }

    submitLoanRequest(request: LoanRequest): Observable<LoanRequest> {
        return this.http.post<LoanRequest>(`${this.apiUrl}/loans/request`, request);
    }

    approveLoanRequest(requestId: string, approvedBy?: string): Observable<Loan> {
        return this.http.post<Loan>(`${this.apiUrl}/loans/approve/${requestId}`, { approvedBy });
    }

    // ─── Loans ─────────────────────────────────────────────────────────────────
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
}
