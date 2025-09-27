// --- POCZĄTEK PLIKU: apps/web/app/app.config.ts ---
import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { SHARED_PROVIDERS } from './app.providers';
import { FaktoriaDataService } from './pages/tools/faktoria/faktoria-data.service';
import { SqliteService } from './data/sqlite.service';

export const appConfig: ApplicationConfig = {
  providers: [
    // Dołączamy wszystkie wspólne serwisy
    ...SHARED_PROVIDERS,

    // A następnie dodajemy te, które są specyficzne TYLKO dla przeglądarki
    provideZonelessChangeDetection(),
    {
      // Gdy aplikacja działa w przeglądarce, "FaktoriaDataService" to "SqliteService"
      provide: FaktoriaDataService,
      useClass: SqliteService
    }
  ],
};
// --- KONIEC PLIKU: apps/web/app/app.config.ts ---