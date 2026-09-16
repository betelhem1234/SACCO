export interface Withdrawal {
    id?: string;
    memberId: string;
    savingTypeId: string;
    amount: number;
    ftp: string;
    bankId: string;
    remark?: string;
    date: number;
    createdAt: number;
    status?: 'PENDING' | 'APPROVED' | 'POSTED' | 'DISBURSED' | 'REJECTED';
    approvedBy?: string;
    approvedAt?: number;
    disbursedBy?: string;
    disbursedAt?: number;
    disbursedReference?: string;
}

export type WithdrawalStatus = 'PENDING' | 'APPROVED' | 'POSTED' | 'DISBURSED' | 'REJECTED';