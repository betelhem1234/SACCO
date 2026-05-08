import { MemberState } from "../state/members.reducer";
import { LoanState } from "../state/loans.reducer";
import { SavingState } from "../state/savings.reducer";
import { LookupsState } from "../state/lookups.reducer";
import { WithdrawalState } from "../state/withdrawals.reducer";

export interface AppState {
  members: MemberState;
  savings: SavingState;
  lookups: LookupsState;
  withdrawals: WithdrawalState;
  loans: LoanState;
}
