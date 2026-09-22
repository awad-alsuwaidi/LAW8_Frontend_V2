import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
export type Language = 'en' | 'ar';

type TranslationObject = {
  [key: string]: any;
};

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly translations: Record<Language, TranslationObject> = {
    en: {},
    ar: {},
  };
  private readonly currentLanguage$ = new BehaviorSubject<Language>(this.getInitialLanguage());
  private readonly translationsReady$ = new BehaviorSubject<boolean>(false);


  initialize(): Observable<void> {
    const initialLanguage = this.getInitialLanguage();


    return this.loadTranslations(initialLanguage).pipe(
      tap(() => {
        this.currentLanguage$.next(initialLanguage);

        this.updateDocumentLanguage(initialLanguage);

        this.translationsReady$.next(true);

      }),

      map(() => void 0),
    );
  }


  getLanguage$(): Observable<Language> {
    return this.currentLanguage$.asObservable();
  }

  /** BCP-47 tag for Intl formatting; Arabic keeps Latin digits to match the rest of the UI. */
  getLocale(): string {
    return this.getCurrentLanguage() === 'ar' ? 'ar-u-nu-latn' : 'en-US';
  }

  getCurrentLanguage(): Language {
    return this.currentLanguage$.value;
  }


  getTranslationsReady$(): Observable<boolean> {
    return this.translationsReady$.asObservable();
  }

  setLanguage(lang: Language): void {
    if (lang === this.getCurrentLanguage()) {
      return;
    }

    this.saveLanguage(lang);

    this.updateDocumentLanguage(lang);

    if (isPlatformBrowser(this.platformId)) {
      window.location.reload();
    }
  }

  translate(key: string): string {
    const language = this.getCurrentLanguage();

    const translations = this.translations[language];

    const value = this.getValue(translations, key);

    return value ?? key;
  }

  translate$(key: string): Observable<string> {
    return this.currentLanguage$.pipe(map(() => this.translate(key)));
  }


  private loadTranslations(lang: Language): Observable<TranslationObject> {
    if (this.isLanguageLoaded(lang)) {
      return of(this.translations[lang]);
    }

    const url = `/assets/i18n/${lang}.json`;


    return this.http.get<TranslationObject>(url).pipe(
      tap((translations) => {

        this.translations[lang] = translations;
      }),

      catchError((error) => {
        console.error(`[TranslationService] Failed to load ${url}`, error);
        throw error;
      }),
    );
  }

  private isLanguageLoaded(lang: Language): boolean {
    return Object.keys(this.translations[lang]).length > 0;
  }

  private getValue(object: TranslationObject, path: string): string | null {
    const keys = path.split('.');

    let value: any = object;

    for (const key of keys) {
      if (value === null || value === undefined) {
        return null;
      }

      value = value[key];
    }

    return typeof value === 'string' ? value : null;
  }

  private getInitialLanguage(): Language {
    if (!isPlatformBrowser(this.platformId)) {
      return 'en';
    }

    const storedLanguage = localStorage.getItem('preferredLanguage');

    if (storedLanguage === 'en' || storedLanguage === 'ar') {
      return storedLanguage;
    }

    const browserLanguage = navigator.language.toLowerCase();

    return browserLanguage.startsWith('ar') ? 'ar' : 'en';
  }

  private saveLanguage(lang: Language): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    localStorage.setItem('preferredLanguage', lang);
  }

  private updateDocumentLanguage(lang: Language): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }

}
