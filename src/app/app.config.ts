import {ApplicationConfig,provideBrowserGlobalErrorListeners,provideAppInitializer,inject,} from '@angular/core';
import { provideHttpClient,} from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { TranslationService } from '../app/features/auth/services/Translation.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    provideRouter(routes),

    provideHttpClient(),

    provideAppInitializer(() => {
      const translationService =
        inject(TranslationService);

      return translationService.initialize();
    }),
  ],
};