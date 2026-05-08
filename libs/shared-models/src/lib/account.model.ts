/** Stored as INTEGER in the database (matches backend enums). */
export enum AccountType {
  ASSET = 1,
  LIABILITY = 2,
  EQUITY = 3,
  REVENUE = 4,
  EXPENSE = 5,
}

/** Stored as INTEGER in the database. */
export enum AccountCategory {
  BANK_ACCOUNT = 1,
  CASH_ACCOUNT = 2,
  OTHER_ACCOUNT = 3,
}

export interface Account {
  id?: string;
  name?: string;
  description?: string;
  accountNumber?: string;
  accountType: AccountType;
  date?: number;
  isActive?: boolean;
  isParent?: boolean;
  accountCategory: AccountCategory;
}

export const ACCOUNT_TYPE_OPTIONS: { value: AccountType; label: string }[] = [
  { value: AccountType.ASSET, label: 'Asset' },
  { value: AccountType.LIABILITY, label: 'Liability' },
  { value: AccountType.EQUITY, label: 'Equity' },
  { value: AccountType.REVENUE, label: 'Revenue' },
  { value: AccountType.EXPENSE, label: 'Expense' },
];

export const ACCOUNT_CATEGORY_OPTIONS: { value: AccountCategory; label: string }[] = [
  { value: AccountCategory.BANK_ACCOUNT, label: 'Bank account' },
  { value: AccountCategory.CASH_ACCOUNT, label: 'Cash account' },
  { value: AccountCategory.OTHER_ACCOUNT, label: 'Other account' },
];

export function accountTypeLabel(t: AccountType | undefined): string {
  return ACCOUNT_TYPE_OPTIONS.find((o) => o.value === t)?.label ?? String(t ?? '');
}

export function accountCategoryLabel(c: AccountCategory | undefined): string {
  return ACCOUNT_CATEGORY_OPTIONS.find((o) => o.value === c)?.label ?? String(c ?? '');
}
