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
    status?: 'PENDING' | 'POSTED' | 'REJECTED';
    approvedBy?: string;
    approvedAt?: number;
}

export type WithdrawalStatus = 'PENDING' | 'POSTED' | 'REJECTED';
