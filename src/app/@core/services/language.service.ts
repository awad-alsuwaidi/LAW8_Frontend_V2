import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, Optional, PLATFORM_ID } from '@angular/core';
import { DEFAULT_LANGUAGE, LANGUAGES } from '@core/utilities/defines';

import { StorageService } from './storage.service';
import { TranslateService } from '@ngx-translate/core';
import { PrimeNGConfig } from 'primeng/api';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  languages: string[] = LANGUAGES;

 constructor(
  @Inject(PLATFORM_ID) private platformId: any,
  @Inject(DOCUMENT) private document: any,
  private translateService: TranslateService,
  private storageService: StorageService,
  private primengConfig: PrimeNGConfig,
  @Optional() @Inject('serverLang') private serverLang: string = DEFAULT_LANGUAGE,
) { }


  async initLang(): Promise<any> {

    return new Promise(async (resolve) => {
      let selectedLang = isPlatformBrowser(this.platformId)
        ? this.storageService.getStorage('lang')
        : this.serverLang;


      if (!selectedLang || !this.languages.includes(selectedLang)) {
        selectedLang = DEFAULT_LANGUAGE;
        if (isPlatformBrowser(this.platformId)) {
          this.storageService.setStorage('lang', DEFAULT_LANGUAGE);
        }
      }

      this.translateService.addLangs(this.languages);
      this.translateService.setDefaultLang(selectedLang);
      this.translateService.use(selectedLang);
      this.changeDirection(selectedLang);
      this.setCalendarLocale(selectedLang); 
      // this.convertCalendarNumbersToArabic();
        resolve(true);
    });
  }

// private convertCalendarNumbersToArabic() {
//   if (!isPlatformBrowser(this.platformId)) return;

//   const observer = new MutationObserver((mutations) => {
//     const lang = this.document.documentElement.lang;
//     if (lang !== 'ar') return;

//     const dayCells = this.document.querySelectorAll('.p-datepicker td span');

//     dayCells.forEach((el: any) => {
//       const text = el.textContent?.trim();
//       if (text && /^\d+$/.test(text)) {
//         el.textContent = text.replace(/\d/g, (d: string | number) => '٠١٢٣٤٥٦٧٨٩'[+d]);
//       }
//     });
//   });

//   observer.observe(this.document.body, {
//     childList: true,
//     subtree: true,
//   });
// }


  setLanguage(lang: string) {
    if (isPlatformBrowser(this.platformId)) {
      this.storageService.setStorage('lang', lang);
      window.location.reload();
    }
  }


  getSelectedLanguage() {
    return isPlatformBrowser(this.platformId)
      ? this.storageService.getStorage('lang') || this.translateService.getBrowserLang()
      : this.serverLang || DEFAULT_LANGUAGE;
  }

  getTransValue(value: string, objVar?: { [key: string]: any }) {
    return this.translateService.instant(value, objVar);
  }

  changeDirection(lang: string) {
    if (isPlatformBrowser(this.platformId)) {
      const htmlTag = this.document.getElementsByTagName('html')[0] as HTMLHtmlElement;
      const bodyTag = this.document.getElementsByTagName('body')[0];
      htmlTag.dir = lang === 'en' ? 'ltr' : 'rtl';
      bodyTag.className = lang === 'en' ? 'ltr' : 'rtl';
      htmlTag.lang = lang;
    }
  }


  private setCalendarLocale(lang: string) {
  if (lang === 'ar') {
    this.primengConfig.setTranslation({
      firstDayOfWeek: 1, 

      dayNames: ["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"],
      dayNamesShort: ["أحد","اثن","ثلا","أرب","خمي","جمع","سبت"],
      dayNamesMin: ["أحد","اثنين","ثلاث","أربع","خميس","جمعه","سبت"],
      // dayNamesMin: ["ح","ن","ث","ر","خ","ج","س"],

      monthNames: [
        "يناير","فبراير","مارس","أبريل","مايو","يونيو",
        "يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"
      ], 
       monthNamesShort: [
        "يناير","فبراير","مارس","أبريل","مايو","يونيو",
        "يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"
      ],
      // monthNamesShort: [
      //   "ينا","فبر","مار","أبر","ماي","يون",
      //   "يول","أغس","سبت","أكت","نوف","ديس"
      // ],

      today: "اليوم",
      clear: "مسح"
    });
  } else {
    this.primengConfig.setTranslation({
      firstDayOfWeek: 1, 

      dayNames: ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
      dayNamesShort: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],
      dayNamesMin: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],
      // dayNamesMin: ["S","M","T","W","T","F","S"],

      monthNames: [
        "January","February","March","April","May","June",
        "July","August","September","October","November","December"
      ],
      monthNamesShort: [
        "Jan","Feb","Mar","Apr","May","Jun",
        "Jul","Aug","Sep","Oct","Nov","Dec"
      ],

      today: "Today",
      clear: "Clear"
    });
  }
}


}
