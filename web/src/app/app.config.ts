import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Routes } from '@angular/router';
import { provideRouter } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatNativeDateModule } from '@angular/material/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { provideStore } from '@ngrx/store';
import { authReducer } from './state/auth/auth.reducer';
import { memberReducer } from './state/members/members.reducer';
import { MembersEffects } from './state/members/members.effects';
import { savingReducer } from './state/savings/savings.reducer';
import { SavingsEffects } from './state/savings/savings.effects';
import { withdrawalReducer } from './state/withdrawals/withdrawals.reducer';
import { WithdrawalsEffects } from './state/withdrawals/withdrawals.effects';
import { transferReducer } from './state/saving-transfer/transfers.reducer';
import { TransfersEffects } from './state/saving-transfer/transfers.effects';
import { shareTransferReducer } from './state/share-transfer/share-transfers.reducer';
import { ShareTransfersEffects } from './state/share-transfer/share-transfers.effects';
import { shareSubscriptionReducer } from './state/share-subscription/share-subscriptions.reducer';
import { ShareSubscriptionsEffects } from './state/share-subscription/share-subscriptions.effects';
import { sharePurchaseReducer } from './state/share-purchase/share-purchases.reducer';
import { SharePurchasesEffects } from './state/share-purchase/share-purchases.effects';
import { lookupsReducer } from './state/lookups/lookups.reducer';
import { LookupsEffects } from './state/lookups/lookups.effects';
import { loanReducer } from './state/loan/loans.reducer';
import { LoansEffects } from './state/loan/loans.effects';
import { financeReducer } from './state/finance/finance.reducer';
import { FinanceEffects } from './state/finance/finance.effects';
import { routes } from './app.routes';
import { provideEffects } from '@ngrx/effects';
import { AuthEffects } from './state/auth/auth.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideStore({
      auth: authReducer,
      members: memberReducer,
      savings: savingReducer,
      withdrawals: withdrawalReducer,
      transfers: transferReducer,
      shareTransfers: shareTransferReducer,
      shareSubscriptions: shareSubscriptionReducer,
      sharePurchases: sharePurchaseReducer,
      lookups: lookupsReducer,
      loans: loanReducer,
      finance: financeReducer
    }),
    provideEffects([
      AuthEffects, MembersEffects, SavingsEffects, WithdrawalsEffects,
      TransfersEffects, ShareTransfersEffects, ShareSubscriptionsEffects,
      SharePurchasesEffects, LookupsEffects, LoansEffects, FinanceEffects
    ]),
    provideAnimationsAsync(),
    importProvidersFrom(MatSnackBarModule, MatNativeDateModule)
  ]
};
