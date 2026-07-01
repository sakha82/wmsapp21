import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withPreloading } from '@angular/router';
import { routes } from './app.routes';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { DragDropModule } from 'primeng/dragdrop';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import svFile from 'primelocale/sv.json';
const { sv } = svFile;
import { definePreset } from '@primeng/themes';
import Material from '@primeng/themes/material';
import { LoggingInterceptor } from 'app/interceptor/logging.interceptor';
import { TokenInterceptor } from 'app/interceptor/token.interceptor';
import { WmsIdInterceptor } from 'app/interceptor/wms-id.interceptor';
import { CacheInterceptor } from 'app/interceptor/cache.interceptor';
import { ApiErrorInterceptor } from 'app/interceptor/api-error.interceptor';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { SelectivePreloadStrategy } from 'app/strategies/selective-preload.strategy';

export const MaterialPreset = definePreset(Material, {});
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),

    provideRouter(
      routes,
      withPreloading(SelectivePreloadStrategy)
    ),

    provideAnimationsAsync(),

    providePrimeNG({
      translation: sv,
      theme: {
        preset: MaterialPreset,
        options: {
          darkModeSelector: 'none',
        },
      },
    }),

    provideHttpClient(withInterceptorsFromDi()),

    {
      provide: HTTP_INTERCEPTORS,
      useClass: CacheInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiErrorInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: WmsIdInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoggingInterceptor,
      multi: true,
    },

    importProvidersFrom(DragDropModule),
    provideClientHydration(withEventReplay()),
  ],
};
