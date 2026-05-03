import { MemberState } from "../state/members.reducer";
import { SavingState } from "../state/savings.reducer";
import { LookupsState } from "../state/lookups.reducer";

export interface AppState {
  members: MemberState;
  savings: SavingState;
  lookups: LookupsState;
}
