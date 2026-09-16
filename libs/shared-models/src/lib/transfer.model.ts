export interface Transfer {
    id?: string;
    sourceMemberId: string;
    sourceSavingTypeId: string;
    destinationMemberId: string;
    destinationSavingTypeId: string;
    amount: number;
    ftp: string;
    date: number;
    remark?: string;
    createdAt?: number;
    status?: 'PENDING' | 'FEE_PAID' | 'APPROVED' | 'POSTED' | 'REJECTED';
    approvedBy?: string;
    approvedAt?: number;
    serviceFee?: number;
    bankId?: string;
    feeSource?: 'NONE' | 'SAVING' | 'BANK';
    feePaidBy?: string;
    feePaidAt?: number;
    feeReference?: string;
    executedBy?: string;
    executedAt?: number;
}

export type TransferStatusType = 'PENDING' | 'FEE_PAID' | 'APPROVED' | 'POSTED' | 'REJECTED';
