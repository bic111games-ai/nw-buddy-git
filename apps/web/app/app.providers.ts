// --- POCZĄTEK PLIKU: apps/web/app/app.providers.ts ---
import { provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom, inject, Provider, provideAppInitializer } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, withRouterConfig } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { APP_ROUTES } from './app.routes';
import { BackendService } from './data/backend';
import { DbService } from './data/db.service';
import { ElectronService } from './electron/electron.service';
import { TranslateModule } from './i18n';

// Ta tablica zawiera WSZYSTKIE serwisy i konfiguracje, które są
// WSPÓLNE dla środowiska Web i Electron.
export const SHARED_PROVIDERS = [
  ElectronService,
  // Poniżej przeniosłem całą zawartość z oryginalnego app.config.ts
  provideRouter(
    APP_ROUTES,
    withRouterConfig({
      onSameUrlNavigation: 'reload',
    }),
  ),
  provideAppInitializer(() => {
    const db = inject(DbService);
    const backend = inject(BackendService);
    backend.userSignedIn.subscribe(({ id }) => {
      db.afterSignedIn(id);
    });
    backend.userSignedOut.subscribe(({ id }) => {
      db.afterSignedOut(id);
    });
  }),
  provideIonicAngular({
    useSetInputAPI: true,
    rippleEffect: false,
    mode: 'md',
    platform: {
      desktop: (win) =>
        !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(win.navigator.userAgent),
    },
    navAnimation: () => null,
  }),
  provideHttpClient(
    withFetch(),
    withInterceptorsFromDi(),
  ),
  importProvidersFrom(
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    TranslateModule.forRoot(),
    StoreModule.forRoot({}),
    EffectsModule.forRoot(),
  ),
];
// --- KONIEC PLIKU: apps/web/app/app.providers.ts ---