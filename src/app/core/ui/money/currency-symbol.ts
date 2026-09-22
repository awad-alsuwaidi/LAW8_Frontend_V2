import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CurrencyRef } from '../money.pipe';

/** Currency symbol. AED gets the official dirham glyph as SVG (no Unicode char yet), others print their stored symbol. */
@Component({
  selector: 'app-currency-symbol',
  standalone: true,
  template: `
    @if (isDirham) {
      <svg class="dirham" viewBox="0 0 24 24" aria-label="AED" role="img" focusable="false">
        <path d="M7.5 3.5h5.2a8.5 8.5 0 0 1 0 17H7.5z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="miter"/>
        <path d="M3 9.6h11.2M3 14.4h11.2" fill="none" stroke="currentColor" stroke-width="2.2"/>
      </svg>
    } @else {
      {{ symbol }}
    }
  `,
  styles: [`
    :host { display: inline-flex; align-items: center; }
    .dirham { width: .95em; height: .95em; flex-shrink: 0; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrencySymbol {
  @Input() ref: CurrencyRef | null | undefined;

  get code(): string { return (this.ref?.currencyCode || '').toUpperCase(); }
  get isDirham(): boolean { return this.code === 'AED'; }
  get symbol(): string { return this.ref?.currencySymbol || this.code; }
}
