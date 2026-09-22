import {
  ApplicationConfig,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
  provideAppInitializer,
  inject,
} from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeArAE from '@angular/common/locales/ar-AE';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { routes } from './app.routes';
import { TranslationService } from '../app/features/auth/services/Translation.service';
import { apiInterceptor } from './core/interceptors/api.interceptor';

// Angular pipes (date/number) need locale data; the language switch reloads the
// page, so reading the stored preference once at bootstrap is enough.
registerLocaleData(localeArAE);

function currentLocale(): string {
  try { return localStorage.getItem('preferredLanguage') === 'ar' ? 'ar-AE' : 'en-US'; } catch { return 'en-US'; }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: LOCALE_ID, useFactory: currentLocale },

    provideRouter(routes),

    provideHttpClient(withInterceptors([apiInterceptor])),

    provideCharts(withDefaultRegisterables()),

    provideAppInitializer(() => {
      const translationService = inject(TranslationService);

      return translationService.initialize();
    }),
  ],
};
