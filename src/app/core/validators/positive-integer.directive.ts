import { Directive, HostListener, Input } from '@angular/core';
import { NON_DIGIT_KEYS, isDigitsOnly } from './common.validators';

/**
 * Blocks keyboard/paste input that would make a numeric field negative or fractional.
 * Usage: <input type="number" appPositiveInteger [(ngModel)]="count" />
 */
@Directive({
  selector: 'input[appPositiveInteger]',
  standalone: true,
  host: { inputmode: 'numeric', step: '1' },
})
export class PositiveIntegerDirective {
  @Input() min: number | string = 1;

  @HostListener('keydown', ['$event'])
  onKeydown(e: KeyboardEvent): void {
    if (NON_DIGIT_KEYS.includes(e.key)) e.preventDefault();
  }

  @HostListener('paste', ['$event'])
  onPaste(e: ClipboardEvent): void {
    const text = e.clipboardData?.getData('text') ?? '';
    if (!isDigitsOnly(text)) e.preventDefault();
  }

  @HostListener('drop', ['$event'])
  onDrop(e: DragEvent): void {
    const text = e.dataTransfer?.getData('text') ?? '';
    if (!isDigitsOnly(text)) e.preventDefault();
  }
}
