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
    bankId: string;
    remark?: string;
    createdAt?: number;
}

export interface Bank {
    id: string;
    name: string;
    code: string;
}

export interface SavingType {
    id: string;
    name: string;
    description?: string;
}
