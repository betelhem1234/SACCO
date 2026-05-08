export interface SharedLoanType {
    id?: string;
    name: string;
    requiredMonths: number;
    requiredSavingPercentage: number;
    requiredSharePercentage: number;
    maleInterestAmount: number;
    femaleInterestAmount: number;
    requiredMaximumAmount: number;
    maximumRepaymentMonths: number;
    requiredShareUnitCount: number;
    interestCollectiveAccount?: string;
    lateInterestCollectiveAccount?: string;
    lateInterestPayableAccount?: string;
    longTermPrincipalAccount?: string;
    shortTermPrincipalAccount?: string;
    penaltyCollectiveAccount?: string;
    transferFeeCollectiveAccount?: string;
    serviceFeeCollectiveAccount?: string;
    insuranceFeeCollectiveAccount?: string;
    description?: string;
    loanCode?: number;
    loanTerm?: 'ShortTerm' | 'MediumTerm' | 'LongTerm';
    createdAt?: number;
}
