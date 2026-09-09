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
}
