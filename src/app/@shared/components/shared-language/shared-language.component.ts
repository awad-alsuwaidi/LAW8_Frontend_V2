import { Component, Input, OnInit, inject, input } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';
import { Language } from './language.model';
import { LanguageService } from '@core/services/language.service';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';
@Component({
  selector: 'shared-language',
  templateUrl: './shared-language.component.html',
  styleUrls: ['./shared-language.component.scss'],
  standalone: true,
  imports: [ClickOutsideDirective],
  animations: [
    trigger('openClose', [
      state(
        'open',
        style({
          opacity: 1,
          transform: 'translateY(0)',
          visibility: 'visible',
        })
      ),
      state(
        'closed',
        style({
          opacity: 0,
          transform: 'translateY(-20px)',
          visibility: 'hidden',
        })
      ),
      transition('open => closed', [animate('0.2s')]),
      transition('closed => open', [animate('0.2s')]),
    ]),
  ],
})
export class SharedLanguageComponent implements OnInit {
  showLabel = input(true);
  @Input() darkMode = false;
  activeLang!: Language;
  public isOpen = false;
  listLang: any[] = [
    {
      label: 'English',
      flag: 'assets/images/icons/flags/en.svg',
      icon: 'icon-bg agro-en',
      code: 'en',
    },
    {
      label: 'العربية',
      flag: 'assets/images/icons/flags/ar.svg',
      icon: 'icon-bg agro-ar',
      code: 'ar',
    },
    {
      label: 'Français',
      flag: 'assets/images/icons/flags/fr.svg',
      icon: 'icon-bg agro-ar',
      code: 'fr',
    },
  ];

  _languageService = inject(LanguageService);

  ngOnInit(): void {
    this.activeLang = this.listLang.find(
      (lang) => lang?.code === this._languageService.getSelectedLanguage()
    );
    if (!this.activeLang) {
      this.activeLang = this.listLang[0];
      this.setActiveLang(this.activeLang?.code);
    }
  }
  public toggleLangMenu(): void {
    this.isOpen = !this.isOpen;
  }
  setActiveLang(lang: string) {
    this._languageService.setLanguage(lang);
  }
}
