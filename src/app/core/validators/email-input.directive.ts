import { Directive, HostListener } from '@angular/core';
import { EMAIL_BLOCKED_KEYS } from './common.validators';

/** Blocks characters that can't appear in an email (spaces, brackets, quotes...). Use with emailValidator(). */
@Directive({
  selector: 'input[appEmailInput]',
  standalone: true,
  host: { autocapitalize: 'off', autocorrect: 'off', spellcheck: 'false', inputmode: 'email', dir: 'ltr' },
})
export class EmailInputDirective {
  @HostListener('keydown', ['$event'])
  onKeydown(e: KeyboardEvent): void {
    if (e.key.length === 1 && EMAIL_BLOCKED_KEYS.includes(e.key)) e.preventDefault();
  }

  @HostListener('paste', ['$event'])
  onPaste(e: ClipboardEvent): void {
    const text = e.clipboardData?.getData('text') ?? '';
    if (EMAIL_BLOCKED_KEYS.some((c) => text.includes(c))) e.preventDefault();
  }
}
