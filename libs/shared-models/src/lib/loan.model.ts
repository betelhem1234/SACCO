export interface LoanRequest {
    id?: string;
    memberId: string;
    loanTypeId: string;
    requestedAmount: number;
    requestedMonths: number;
    purpose?: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    approvedBy?: string;
    approvedAt?: number;
    createdAt?: number;
}

export interface Loan {
    id?: string;
    loanRequestId?: string;
    memberId: string;
    loanTypeId: string;
    approvedAmount: number;
    interestRate: number;
    termMonths: number;
    disbursementDate?: number;
    isDisbursed: boolean;
    status: 'APPROVED' | 'ACTIVE' | 'CLOSED';
    createdAt?: number;
}

export interface LoanSchedule {
    id?: string;
    loanId: string;
    installmentNo: number;
    dueDate: number;
    principalAmount: number;
    interestAmount: number;
    totalAmount: number;
    paidAmount: number;
    status: 'PENDING' | 'PARTIAL' | 'PAID';
    createdAt?: number;
}

export interface LoanTransaction {
    id?: string;
    loanId: string;
    transactionType: 'DISBURSEMENT' | 'REPAYMENT';
    amount: number;
    principalPortion: number;
    interestPortion: number;
    penaltyPortion: number;
    referenceNo?: string;
    createdAt?: number;
}

export interface DisburseRequest {
    cashAccountId: string;
    referenceNo?: string;
}

export interface RepaymentRequest {
    amount: number;
    cashAccountId: string;
    referenceNo?: string;
}

export interface DueAmountResponse {
    loanId: string;
    totalDue: number;
}
