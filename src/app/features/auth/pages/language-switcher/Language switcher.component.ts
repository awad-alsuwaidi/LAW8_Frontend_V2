import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService, Language } from '../../services/Translation.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="language-dropdown-wrapper">
      <button
        type="button"
        class="language-button"
        (click)="toggleDropdown()"
        [attr.aria-expanded]="isOpen"
        aria-label="Select Language"
      >
        <span class="language-circle">
          {{ currentLanguage === 'en' ? 'EN' : 'AR' }}
        </span>
        <span class="language-name">
          {{ translate('login.language') }}
        </span>
        <span class="arrow" [class.open]="isOpen">↓</span>
      </button>

      @if (isOpen) {
        <div class="language-dropdown">
          <button
            type="button"
            class="language-option"
            (click)="selectLanguage('en')"
            [class.active]="currentLanguage === 'en'"
          >
            <span class="option-circle">EN</span>
            <span class="option-text">English</span>
          </button>

          <button
            type="button"
            class="language-option"
            (click)="selectLanguage('ar')"
            [class.active]="currentLanguage === 'ar'"
          >
            <span class="option-circle">AR</span>
            <span class="option-text">العربية</span>
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    .language-dropdown-wrapper {
      position: relative;
    }

    .language-button {
      display: flex;
      align-items: center;
      gap: 9px;
      padding: 0;
      border: 0;
      outline: none;
      background: transparent;
      color: #ffffff;
      font-family: inherit;
      cursor: pointer;
      transition: opacity 0.2s ease;
    }

    .language-button:hover {
      opacity: 0.8;
    }

    .language-circle {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 43px;
      height: 43px;
      border-radius: 50%;
      background: #ffffff;
      color: #424242;
      font-size: 16px;
      font-weight: 500;
      flex-shrink: 0;
    }

    .language-name {
      font-size: 14px;
      line-height: 20px;
      font-weight: 400;
      text-align: start;
    }

    .arrow {
      margin-inline-start: 2px;
      margin-top: -4px;
      font-size: 22px;
      line-height: 16px;
      transition: transform 0.3s ease;
    }

    .arrow.open {
      transform: rotate(180deg);
    }

    .language-dropdown {
      position: absolute;
      top: calc(100% + 10px);
      inset-inline-end: 0;
      z-index: 1000;
      min-width: 160px;
      background: #ffffff;
      border-radius: 8px;
      box-shadow:
        0 4px 12px rgba(0, 0, 0, 0.15),
        0 2px 4px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      animation: slideDown 0.2s ease;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .language-option {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 12px 16px;
      border: 0;
      outline: none;
      background: transparent;
      color: #111111;
      font-family: inherit;
      font-size: 14px;
      cursor: pointer;
      transition:
        background 0.2s ease,
        color 0.2s ease;
      text-align: start;
    }

    .language-option:hover {
      background: #f0f0f0;
    }

    .language-option.active {
      background: #e3ebff;
      color: #3164f4;
      font-weight: 600;
    }

    .language-option.active .option-circle {
      background: #3164f4;
      color: #ffffff;
    }

    .option-circle {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #f0f0f0;
      color: #424242;
      font-size: 13px;
      font-weight: 600;
      flex-shrink: 0;
    }

    .option-text {
      flex: 1;
    }
  `,
})
export class LanguageSwitcher implements OnInit {
  isOpen = false;
  currentLanguage: Language = 'en';

  constructor(private translationService: TranslationService) {}

  ngOnInit(): void {
    this.currentLanguage = this.translationService.getCurrentLanguage();

    this.translationService.getLanguage$().subscribe((lang: any) => {
      this.currentLanguage = lang;
    });
  }

  translate(key: string): string {
    return this.translationService.translate(key);
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  selectLanguage(lang: Language): void {
    this.translationService.setLanguage(lang);
    this.isOpen = false;
  }
}
