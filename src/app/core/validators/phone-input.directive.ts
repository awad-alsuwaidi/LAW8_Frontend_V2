import { Directive, HostListener } from '@angular/core';

/** Digits and an optional leading "+" only. Use with phoneValidator() for length. */
@Directive({
  selector: 'input[appPhoneInput]',
  standalone: true,
  host: { inputmode: 'tel', dir: 'ltr', autocomplete: 'tel' },
})
export class PhoneInputDirective {
  @HostListener('keydown', ['$event'])
  onKeydown(e: KeyboardEvent): void {
    if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return;
    const input = e.target as HTMLInputElement;
    if (/[0-9]/.test(e.key)) return;
    if (e.key === '+' && input.selectionStart === 0 && !input.value.startsWith('+')) return;
    e.preventDefault();
  }

  @HostListener('paste', ['$event'])
  onPaste(e: ClipboardEvent): void {
    const text = (e.clipboardData?.getData('text') ?? '').trim();
    if (!/^\+?[0-9\s\-()]+$/.test(text)) { e.preventDefault(); return; }
    e.preventDefault();
    const input = e.target as HTMLInputElement;
    const cleaned = (text.startsWith('+') ? '+' : '') + text.replace(/\D/g, '');
    input.setRangeText(cleaned, input.selectionStart ?? 0, input.selectionEnd ?? 0, 'end');
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }
}
