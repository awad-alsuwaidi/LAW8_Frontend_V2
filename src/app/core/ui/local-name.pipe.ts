import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslationService } from '../../features/auth/services/Translation.service';

interface Bilingual { nameEn?: string | null; nameAr?: string | null; }

/**
 * Shows the Arabic name when the UI language is Arabic (falling back to English), and vice versa.
 * Usage: {{ item | localName }}
 */
@Pipe({ name: 'localName', standalone: true, pure: false })
export class LocalNamePipe implements PipeTransform {
  private readonly i18n = inject(TranslationService);

  transform(value: Bilingual | null | undefined): string {
    if (!value) return '';
    const ar = (value.nameAr ?? '').trim();
    const en = (value.nameEn ?? '').trim();
    return this.i18n.getCurrentLanguage() === 'ar' ? (ar || en) : (en || ar);
  }
}
