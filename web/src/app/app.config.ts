import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { routes } from './app.routes';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { memberReducer } from './state/members.reducer';
import { savingReducer } from './state/savings.reducer';
import { lookupsReducer } from './state/lookups.reducer';
import { withdrawalReducer } from './state/withdrawals.reducer';
import { loanReducer } from './state/loans.reducer';
import { MembersEffects } from './state/members.effects';
import { SavingsEffects } from './state/savings.effects';
import { LookupsEffects } from './state/lookups.effects';
import { WithdrawalsEffects } from './state/withdrawals.effects';
import { LoansEffects } from './state/loans.effects';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideStore({
      members: memberReducer,
      savings: savingReducer,
      lookups: lookupsReducer,
      withdrawals: withdrawalReducer,
      loans: loanReducer,
    }),
    provideEffects([MembersEffects, SavingsEffects, LookupsEffects, WithdrawalsEffects, LoansEffects]),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
    provideAnimationsAsync(),
    importProvidersFrom(MatSnackBarModule)
  ]
};
