import { AuthState } from "../state/auth/auth.reducer";
import { MemberState } from "../state/members/members.reducer";
import { LoanState } from "../state/loan/loans.reducer";
import { SavingState } from "../state/savings/savings.reducer";
import { LookupsState } from "../state/lookups/lookups.reducer";
import { WithdrawalState } from "../state/withdrawals/withdrawals.reducer";
import { TransferState } from "../state/saving-transfer/transfers.reducer";
import { ShareTransferState } from "../state/share-transfer/share-transfers.reducer";
import { ShareSubscriptionState } from "../state/share-subscription/share-subscriptions.reducer";
import { SharePurchaseState } from "../state/share-purchase/share-purchases.reducer";
import { FinanceState } from "../state/finance/finance.reducer";

export interface AppState {
  auth: AuthState;
  members: MemberState;
  savings: SavingState;
  lookups: LookupsState;
  withdrawals: WithdrawalState;
  loans: LoanState;
  transfers: TransferState;
  shareTransfers: ShareTransferState;
  shareSubscriptions: ShareSubscriptionState;
  sharePurchases: SharePurchaseState;
  finance: FinanceState;
}
