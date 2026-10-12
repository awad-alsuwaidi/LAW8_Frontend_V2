import {
  APP_INITIALIZER,
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withHashLocation,
  withRouterConfig,
} from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import {
  HttpClient,
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { AppHttpInterceptor } from './@core/interceptors';
import { HttpErrorInterceptor } from './@core/interceptors/http-error.interceptor';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { MultiTranslateHttpLoader } from './@core/classes/multi-translate-http-loader';
import { LanguageService } from './@core/services/language.service';
import { ToastrModule } from 'ngx-toastr';
import { DialogService } from 'primeng/dynamicdialog';
import { CamelCaseInterceptor } from './@core/interceptors/camel-case.interceptor';
import { AppConfigService } from './@core/services/app-config.service';

export function HttpLoaderFactory(httpClient: HttpClient) {
  return new MultiTranslateHttpLoader(httpClient, [
    { prefix: './assets/i18n/auth/', suffix: '.json' },
    { prefix: './assets/i18n/common/', suffix: '.json' },
    { prefix: './assets/i18n/menu/', suffix: '.json' },
    { prefix: './assets/i18n/topbar/', suffix: '.json' },
    { prefix: './assets/i18n/pages/matters/', suffix: '.json' },
    { prefix: './assets/i18n/pages/lookups/', suffix: '.json' },
    { prefix: './assets/i18n/pages/clients/', suffix: '.json' },
    { prefix: './assets/i18n/pages/timesheet/', suffix: '.json' },
    { prefix: './assets/i18n/pages/search/', suffix: '.json' },
    { prefix: './assets/i18n/pages/users/', suffix: '.json' },
    { prefix: './assets/i18n/pages/dashboard/', suffix: '.json' },
    { prefix: './assets/i18n/pages/report/', suffix: '.json' },
    { prefix: './assets/i18n/pages/setting/', suffix: '.json' },
    { prefix: './assets/i18n/pages/security/', suffix: '.json' },
    { prefix: './assets/i18n/pages/billing/', suffix: '.json' },
  ]);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withHashLocation(),
      withComponentInputBinding(),
      withRouterConfig({ paramsInheritanceStrategy: 'always' }),
    ),
    provideAnimations(),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        AppHttpInterceptor,
        CamelCaseInterceptor,
        HttpErrorInterceptor,
      ]),
    ),
    importProvidersFrom([
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        },
      }),
      ToastrModule.forRoot({
        positionClass: 'toast-top-center',
        timeOut: 5000,
        extendedTimeOut: 500,
      }),
    ]),
    {
      provide: APP_INITIALIZER,
      useFactory: appConfigFactory,
      deps: [LanguageService, AppConfigService],
      multi: true,
    },
    DialogService,
  ],
};

export function appConfigFactory(
  _languageService: LanguageService,
  _appConfigService: AppConfigService,
) {
  return async () => {
    await _appConfigService.load();
    await _languageService.initLang();
  };
}
