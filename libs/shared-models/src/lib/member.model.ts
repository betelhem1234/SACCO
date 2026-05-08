export interface Member {
    id: string;
    idNumbe?: string;
    fullName: string;
    email?: string;
    phone?: string;
    birthDate?: number;
    isMale?: boolean;
    memberType?: number;
    membersipStatus?: number;
    branchId: string;
    registrationDate: number;
}

export interface Saving {
    id?: string;
    memberId: string;
    savingAmount: number;
    savingDate: number;
    ftp: string;
    savingType: string;
    accountId: string;
    remark?: string;
    createdAt?: number;
}

export interface SavingType {
    id: string;
    name: string;
    accountId: string;
    description?: string;
}
