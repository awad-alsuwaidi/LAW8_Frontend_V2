import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { CurrencyRef, formatMoneyNumber } from '../money.pipe';
import { TranslationService } from '../../../features/auth/services/Translation.service';
import { CurrencySymbol } from './currency-symbol';

/**
 * Amount + currency symbol. Same inputs as the money pipe, but as an element
 * so AED can show the real dirham glyph (not in Unicode yet).
 * <app-money [value]="sub.grandTotal" [ref]="sub" />
 */
@Component({
  selector: 'app-money',
  standalone: true,
  imports: [CurrencySymbol],
  template: `
    <span class="money__num">{{ formatted }}</span>
    @if (isNumber) {
      @if (display === 'code') {
        <span class="money__sym">{{ code }}</span>
      } @else {
        <app-currency-symbol class="money__sym" [ref]="ref" />
      }
    }
  `,
  styles: [`
    :host { display: inline-flex; align-items: center; gap: .28em; white-space: nowrap; font-variant-numeric: tabular-nums; }
  `],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class Money {
  private readonly i18n = inject(TranslationService);

  @Input({ required: true }) value: number | null | undefined;
  @Input() ref: CurrencyRef | null | undefined;
  @Input() display: 'symbol' | 'code' = 'symbol';

  get code(): string { return this.ref?.currencyCode || 'USD'; }

  get isNumber(): boolean {
    return this.value !== null && this.value !== undefined && !Number.isNaN(this.value);
  }

  get formatted(): string {
    if (!this.isNumber) return '—';
    return formatMoneyNumber(this.value as number, this.ref?.currencyDecimals ?? 2, this.i18n.getCurrentLanguage() === 'ar');
  }
}
