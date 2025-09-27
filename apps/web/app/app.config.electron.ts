// --- POCZĄTEK PLIKU: apps/web/app/app.config.electron.ts ---
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { SHARED_PROVIDERS } from './app.providers';
import { FaktoriaDataService } from './pages/tools/faktoria/faktoria-data.service';
import { FaktoriaElectronService } from './pages/tools/faktoria/faktoria-electron.service';

export const appConfig: ApplicationConfig = {
  providers: [
    // Dołączamy wszystkie wspólne serwisy
    ...SHARED_PROVIDERS,

    // A następnie dodajemy te, które są specyficzne TYLKO dla Electrona
    // WAŻNE: Electron wymaga standardowego `provideZoneChangeDetection`
    provideZoneChangeDetection({ eventCoalescing: true }),
    {
      // Gdy aplikacja działa w Electronie, "FaktoriaDataService" to "FaktoriaElectronService"
      provide: FaktoriaDataService,
      useClass: FaktoriaElectronService
    }
  ],
};
// --- KONIEC PLIKU: apps/web/app/app.config.electron.ts ---