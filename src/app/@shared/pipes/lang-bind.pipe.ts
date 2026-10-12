import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'languageBind',
  standalone:true
})
export class LanguageBindPipe implements PipeTransform {

  constructor(private translate: TranslateService) {}

  transform(data: any, nameEN: string, nameAR: string): any {
    const currentLang = this.translate.currentLang;
    const selectedName = currentLang === 'ar' ? nameAR : nameEN;
    if (data && (data[selectedName] || data[nameEN])) return  data[selectedName] || data[nameEN] 
  }
}