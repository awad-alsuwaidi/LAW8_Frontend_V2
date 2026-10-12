import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideAppInitializer,
  inject,
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { TranslationService } from '../app/features/auth/services/Translation.service';
import { tenantInterceptor } from './core/auth/interceptors/tenant.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    provideRouter(routes),

    provideHttpClient(withInterceptors([tenantInterceptor])),

    provideAppInitializer(() => {
      const translationService = inject(TranslationService);

      return translationService.initialize();
    }),
  ],
};
