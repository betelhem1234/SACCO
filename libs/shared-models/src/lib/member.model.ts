export interface Member {
    id: string;
    idNumbe?: string;
    memberid?: string;
    fullName: string;
    email?: string;
    phone?: string;
    birthDate?: number;
    isMale?: boolean;
    is_male?: boolean;
    memberType?: number;
    member_type?: number;
    membersipStatus?: number;
    branchId: string;
    registrationDate: number;

    mother_name?: string;
    nationality?: string;
    telephone?: string;
    address?: string;
    membership_date?: number;
    reg_date?: number;
    login_id?: string;
    house_no?: string;
    district?: string;
    subcity?: string;
    city?: string;
    region?: number;
    state_id?: string;
    woreda?: string;
    kebele?: string;
    age?: number;
    family_size?: number;
    marital_status?: number;
    job_field?: string;
    work_address?: string;
    monthly_income?: number;
    home_phone_number?: string;
    fayda_id_no?: string;
    id_no?: string;
    saving_book_no?: string;
    education_id?: string;
    educational_level?: number;
    is_company?: boolean;
    is_employee?: boolean;
    is_member?: boolean;
    parent_id?: string;
    referral?: string;
    reason?: string;
    member_branch_id?: string;
    branch_name?: string;
    immediate_contact?: string;
    immediate_contact_full_name?: string;
    immediate_contact_firstname?: string;
    immediate_contact_middlename?: string;
    immediate_contact_lastname?: string;
    immediate_contact_phone?: string;
    immediate_contact_email?: string;
    immediate_contact_house_no?: string;
    immediate_contact_houseno?: string;
    immediate_contact_subcity?: string;
    immediate_contact_region?: number;
    immediate_contact_woreda?: string;
    subscription_total?: number;
    purchase_total?: number;
    units?: number;
    saving_total?: number;
    withdrawal_total?: number;
    total_interest?: number;
    deposit_amount?: number;
    approved_amount?: number;
    registered_by?: string;
    deductible_amount?: number;
    minimum_mandatory_saving?: number;
    membership_type?: number;
    status?: number;
    account_number?: number;
    referal_members?: GroupMember[];
    memberGroups?: MemberGroup[];
    beneficiaries?: Beneficiary[];
    children?: Child[];
}

export interface GroupMember {
    id?: string;
    first_name?: string;
    middle_name?: string;
    last_name?: string;
    mother_name?: string;
    family_size?: number;
    job_field?: string;
    marital_status?: number;
    work_address?: string;
    fayda_id_no?: string;
    birth_date?: number;
    age?: number;
    is_male?: boolean;
    telephone?: string;
    email?: string;
    state_id?: string;
    subcity?: string;
    woreda?: string;
    house_no?: string;
    immediate_contact_full_name?: string;
    immediate_contact_phone?: string;
}

export interface MemberGroup {
    id?: string;
    member_id: string;
    first_name?: string;
    middle_name?: string;
    last_name?: string;
    mother_name?: string;
    family_size?: number;
    job_field?: string;
    marital_status?: number;
    work_address?: string;
    fayda_id_no?: string;
    birth_date?: number;
    age?: number;
    is_male?: boolean;
    telephone?: string;
    email?: string;
    state_id?: string;
    subcity?: string;
    woreda?: string;
    house_no?: string;
    immediate_contact_full_name?: string;
    immediate_contact_phone?: string;
}

export interface Beneficiary {
    id?: string;
    member_id?: string;
    name?: string;
    is_male?: boolean;
    relation_type?: number;
    birth_date?: number;
    remark?: string;
    unique_relation?: string;
    house_no?: string;
    state_id?: string;
    woreda?: string;
    subcity?: string;
    kebele?: string;
    telephone?: string;
}

export interface Child {
    id?: string;
    member_id?: string;
    name?: string;
    is_male?: boolean;
    birth_date?: number;
    child_id?: string;
}

export interface MemberSummaryPartialList {
    data: Member[];
    total: number;
}

export interface BranchSummary {
    id: string;
    name: string;
    description?: string;
}

export type SavingStatus = 'PENDING' | 'POSTED' | 'REJECTED';

export interface Saving {
    id?: string;
    memberId: string;
    savingAmount: number;
    savingDate: number;
    ftp: string;
    savingType: string;
    accountId: string;
    remark?: string;
    withdrawalId?: string;
    transferId?: string;
    createdAt?: number;
    status?: SavingStatus;
    approvedBy?: string;
    approvedAt?: number;
}

export interface SavingType {
    id: string;
    name: string;
    accountId: string;
    description?: string;
    /** Marks this as the mandatory saving type whose minimum amount changes are tracked in history. */
    isMandatory?: boolean;
    /** Minimum amount members must pay for this saving type. */
    minimumAmount?: number;
}

/** One record of a mandatory saving minimum amount change (amount + effective date). */
export interface SavingTypeAmountHistory {
    id: string;
    savingTypeId: string;
    amount: number;
    /** epoch millis when this amount takes effect */
    effectiveFrom: number;
    /** epoch millis when this record was saved */
    createdAt: number;
}
