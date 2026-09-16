export type ExpenseRequestCategory = 'EQUIPMENT' | 'CONSUMABLE' | 'RENT' | 'OTHER';

export type ExpenseRequestStatus = 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED';

export interface ExpenseRequest {
    id?: string;
    category: ExpenseRequestCategory;
    title: string;
    requestedBy: string;
    requestedDate?: number;
    amount?: number;
    status?: ExpenseRequestStatus;
    note?: string;
    // equipment / consumable details
    assetName?: string;
    quantity?: number;
    supplier?: string;
    // rent details
    landlord?: string;
    frequency?: string;
    amountPerPeriod?: number;
    periodsCovered?: number;
    contractId?: string;
    paymentAccountId?: string;
    approvedBy?: string;
    approvedDate?: number;
    paidDate?: number;
    createdAt?: number;
    updatedAt?: number;
}

export interface FixedAsset {
    id?: string;
    name: string;
    category?: string;
    description?: string;
    purchaseDate: number;
    cost: number;
    supplier?: string;
    sourceRequestId?: string;
    depreciable?: boolean;
    usefulLifeYears?: number;
    salvageValue?: number;
    status?: string;
    createdAt?: number;
}

export interface DepreciationEntry {
    id?: string;
    assetId: string;
    periodKey: string;
    periodStart: number;
    amount: number;
    accumulated: number;
    netBookValue: number;
    createdAt?: number;
}

export type DisposalCondition = 'SALE' | 'LOST' | 'GIFT' | 'SCRAP' | 'DAMAGED' | 'OTHER';

export interface AssetDisposal {
    id?: string;
    assetId: string;
    assetName?: string;
    disposalDate: number;
    condition: DisposalCondition;
    proceeds?: number;
    proceedsAccountId?: string;
    bookValue?: number;
    gainLoss?: number;
    note?: string;
    createdAt?: number;
}

export interface RentalContract {
    id?: string;
    propertyName: string;
    description?: string;
    landlord: string;
    frequency: string;
    amountPerPeriod: number;
    startDate: number;
    endDate?: number;
    advancePeriods?: number;
    status?: string;
    createdAt?: number;
    updatedAt?: number;
}

export interface RentalPayment {
    id?: string;
    contractId: string;
    propertyName?: string;
    frequency?: string;
    amountPerPeriod?: number;
    paidFrom: number;
    paidTo: number;
    amountPaid: number;
    payDate: number;
    paidBy?: string;
    paymentAccountId?: string;
    expensedThrough?: number;
    note?: string;
    createdAt?: number;
}