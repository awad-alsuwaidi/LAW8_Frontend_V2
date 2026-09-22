import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslationService } from '../../features/auth/services/Translation.service';

export interface CurrencyRef {
  currencyCode?: string | null;
  currencySymbol?: string | null;
  currencyDecimals?: number | null;
}

/** Number part only. Latin digits in both languages. */
export function formatMoneyNumber(value: number, decimals: number, isArabic: boolean): string {
  const locale = isArabic ? 'ar-u-nu-latn' : 'en-US';
  return new Intl.NumberFormat(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);
}

/**
 * Formats an amount in the record's currency, e.g. {{ sub.grandTotal | money: sub }}.
 * For templates use <app-money> instead (it renders the AED glyph); keep this for plain strings.
 */
@Pipe({ name: 'money', standalone: true, pure: false })
export class MoneyPipe implements PipeTransform {
  private readonly i18n = inject(TranslationService);

  transform(value: number | null | undefined, ref?: CurrencyRef | null, display: 'symbol' | 'code' = 'symbol'): string {
    if (value === null || value === undefined || Number.isNaN(value)) return '—';
    const code = ref?.currencyCode || 'USD';
    const symbol = display === 'code' ? code : (ref?.currencySymbol || code);
    const decimals = ref?.currencyDecimals ?? 2;
    const num = formatMoneyNumber(value, decimals, this.i18n.getCurrentLanguage() === 'ar');
    return `${num} ${symbol}`;
  }
}
