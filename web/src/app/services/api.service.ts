import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Member, Saving, Bank, SavingType } from '@sacco/shared-models';

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

    // Banks
    getBanks(): Observable<Bank[]> {
        return this.http.get<Bank[]>(`${this.apiUrl}/banks`);
    }

    addBank(bank: Bank): Observable<Bank> {
        return this.http.post<Bank>(`${this.apiUrl}/banks`, bank);
    }

    updateBank(id: string, bank: Bank): Observable<Bank> {
        return this.http.put<Bank>(`${this.apiUrl}/banks/${id}`, bank);
    }

    deleteBank(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/banks/${id}`);
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
}
