import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  QueryList,
  ViewChildren,
  computed,
  signal,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslationService, Language } from '../../../services/Translation.service';
import { LanguageSwitcher } from '../../language-switcher/Language switcher.component';
import { AuthService } from '../../../../../core/auth/services/auth.service';

const OTP_LENGTH = 5;
const RESEND_SECONDS = 297;

@Component({
  selector: 'app-verify-otp-page',
  standalone: true,
  imports: [CommonModule, LanguageSwitcher],
  templateUrl: './verify-otp-page.html',
  styleUrl: './verify-otp-page.scss',
})
export class VerifyOtpPage implements OnInit, OnDestroy {
  readonly otpLength = OTP_LENGTH;
  readonly otp = signal<string[]>(Array(OTP_LENGTH).fill(''));
  readonly isLoading = signal(false);
  readonly remainingSeconds = signal(RESEND_SECONDS);
  readonly isOtpComplete = computed(() => this.otp().every((digit) => digit !== ''));

  // ✅ أضف error و success messages
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  currentLanguage: Language = 'en';

  private timer?: ReturnType<typeof setInterval>;

  private readonly destroy$ = new Subject<void>();

  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly translationService = inject(TranslationService);
  private readonly authService = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);

  @ViewChildren('otpInput')
  otpInputs!: QueryList<ElementRef<HTMLInputElement>>;

  ngOnInit(): void {
    this.initializeLanguage();

    if (isPlatformBrowser(this.platformId)) {
      this.startTimer();
    }
  }

  private initializeLanguage(): void {
    this.currentLanguage = this.translationService.getCurrentLanguage();

    this.translationService
      .getLanguage$()
      .pipe(takeUntil(this.destroy$))
      .subscribe((lang: Language) => {
        this.currentLanguage = lang;
        this.cdr.markForCheck();
      });
  }

  toggleLanguage(): void {
    const newLang: Language = this.currentLanguage === 'en' ? 'ar' : 'en';
    this.translationService.setLanguage(newLang);
  }

  translate(key: string): string {
    return this.translationService.translate(key);
  }

  private setDigit(index: number, value: string): void {
    const next = [...this.otp()];
    next[index] = value;
    this.otp.set(next);
  }

  private applyDigits(raw: string, startIndex: number): void {
    const digits = raw.replace(/\D/g, '');
    if (!digits) {
      return;
    }

    const available = this.otpLength - startIndex;
    const toFill = digits.slice(0, available);

    const next = [...this.otp()];
    for (let i = startIndex; i < this.otpLength; i++) {
      next[i] = '';
    }

    toFill.split('').forEach((digit, i) => {
      next[startIndex + i] = digit;
    });

    this.otp.set(next);
    this.cdr.markForCheck();

    const focusIndex = Math.min(startIndex + toFill.length, this.otpLength - 1);

    this.focusInput(focusIndex);
  }

  private focusInput(index: number): void {
    setTimeout(() => {
      const input = this.otpInputs?.get(index)?.nativeElement;
      if (!input) {
        return;
      }
      input.focus();
      input.select();
    });
  }

  onOtpFocus(event: FocusEvent): void {
    const input = event.target as HTMLInputElement;
    setTimeout(() => input.select());
  }

  onOtpInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '');

    if (!digits) {
      this.setDigit(index, '');
      input.value = '';
      return;
    }
    if (digits.length > 1) {
      input.value = '';
      const startIndex = digits.length >= this.otpLength ? 0 : index;
      this.applyDigits(digits, startIndex);
      return;
    }

    this.setDigit(index, digits);
    input.value = digits;

    if (index < this.otpLength - 1) {
      this.focusInput(index + 1);
    }
  }

  onOtpKeyDown(event: KeyboardEvent, index: number): void {
    const { key } = event;
    const input = event.target as HTMLInputElement;

    if (key === 'Backspace') {
      event.preventDefault();

      if (this.otp()[index]) {
        this.setDigit(index, '');
        input.value = '';
        return;
      }

      if (index > 0) {
        this.setDigit(index - 1, '');
        const prev = this.otpInputs?.get(index - 1)?.nativeElement;
        if (prev) {
          prev.value = '';
        }
        this.focusInput(index - 1);
      }
      return;
    }

    if (key === 'Delete') {
      event.preventDefault();
      this.setDigit(index, '');
      input.value = '';
      return;
    }

    if (key === 'ArrowLeft') {
      event.preventDefault();
      if (index > 0) {
        this.focusInput(index - 1);
      }
      return;
    }

    if (key === 'ArrowRight') {
      event.preventDefault();
      if (index < this.otpLength - 1) {
        this.focusInput(index + 1);
      }
      return;
    }

    if (key === 'Tab' || event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    if (/^\d$/.test(key)) {
      event.preventDefault();

      this.setDigit(index, key);
      input.value = key;

      if (index < this.otpLength - 1) {
        this.focusInput(index + 1);
      }
      return;
    }

    if (key.length === 1) {
      event.preventDefault();
    }
  }

  onOtpPaste(event: ClipboardEvent): void {
    event.preventDefault();

    const pastedText = event.clipboardData?.getData('text') ?? '';
    this.applyDigits(pastedText, 0);
  }

  // ✅ تحديث كامل: استخدم verifyOtpAndLogin + navigation
  verifyOtp(): void {
    if (this.isLoading()) {
      return;
    }

    const otpValue = this.otp().join('');

    if (otpValue.length !== this.otpLength) {
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');
    this.isLoading.set(true);

    this.authService
      .verifyOtpAndLogin(otpValue)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isLoading.set(false);

          this.successMessage.set(this.translate('otp.success.verified'));
          this.cdr.markForCheck();
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 800);
        },

        error: (error) => {
          this.isLoading.set(false);
          console.error('[VerifyOtpPage] OTP verification failed:', error);
          this.errorMessage.set(
            error?.error?.data?.message ??
              error?.error?.message ??
              this.translate('otp.errors.verificationFailed'),
          );

          this.cdr.markForCheck();
        },
      });
  }

  resendCode(): void {
    if (this.remainingSeconds() > 0 || this.isLoading()) {
      return;
    }
    const username = this.authService.getUsername();
    if (!username) {
      this.errorMessage.set(this.translate('otp.errors.usernameMissing'));
      this.cdr.markForCheck();
      return;
    }
    this.errorMessage.set('');
    this.successMessage.set('');

    this.authService
      .resendOtp(username)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('[VerifyOtpPage] OTP resent successfully');
          this.successMessage.set(this.translate('otp.success.resent'));

          this.startTimer();
          this.cdr.markForCheck();
        },

        error: (error) => {
          console.error('[VerifyOtpPage] Resend OTP failed:', error);
          this.errorMessage.set(
            error?.error?.data?.message ??
              error?.error?.message ??
              this.translate('otp.errors.resendFailed'),
          );

          this.cdr.markForCheck();
        },
      });
  }

  private startTimer(): void {
    this.clearTimer();

    this.remainingSeconds.set(RESEND_SECONDS);

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.timer = setInterval(() => {
      const current = this.remainingSeconds();

      if (current > 0) {
        this.remainingSeconds.set(current - 1);
        this.cdr.markForCheck();
      } else {
        this.clearTimer();
      }
    }, 1000);
  }

  get formattedTime(): string {
    const total = this.remainingSeconds();
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  private clearTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  ngOnDestroy(): void {
    this.clearTimer();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
