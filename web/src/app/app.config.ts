import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { memberReducer } from './state/members.reducer';
import { savingReducer } from './state/savings.reducer';
import { lookupsReducer } from './state/lookups.reducer';
import { MembersEffects } from './state/members.effects';
import { SavingsEffects } from './state/savings.effects';
import { LookupsEffects } from './state/lookups.effects';
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
    }),
    provideEffects([MembersEffects, SavingsEffects, LookupsEffects]),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
    provideAnimationsAsync()
  ]
};
