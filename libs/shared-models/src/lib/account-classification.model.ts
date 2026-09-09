import { AccountType } from './account.model';

export interface AccountClassification {
  id?: string;
  name?: string;
  description?: string;
  accountType: AccountType;
}
