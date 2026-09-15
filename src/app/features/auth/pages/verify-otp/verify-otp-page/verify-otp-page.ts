import { Component, ElementRef, inject, OnDestroy, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslationService, Language } from '../../../services/Translation.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LanguageSwitcher } from '../../language-switcher/Language switcher.component';

@Component({
  selector: 'app-verify-otp-page',
  standalone: true,
  imports: [CommonModule, LanguageSwitcher],
  templateUrl: './verify-otp-page.html',
  styleUrl: './verify-otp-page.scss',
})
export class VerifyOtpPage implements OnDestroy {
  otpLength = 5;
  otp: string[] = ['', '', '', '', ''];
  isLoading = false;
  remainingSeconds = 297;
  currentLanguage: Language = 'en';

  private timer?: ReturnType<typeof setInterval>;
  private destroy$ = new Subject<void>();
  private router = inject(Router);
  private translationService = inject(TranslationService)

  @ViewChildren('otpInput')
  otpInputs!: QueryList<ElementRef<HTMLInputElement>>;

  constructor(
  ) {
    this.startTimer();
    this.initializeLanguage();
  }

  private initializeLanguage(): void {
    this.currentLanguage = this.translationService.getCurrentLanguage();

    this.translationService
      .getLanguage$()
      .pipe(takeUntil(this.destroy$))
      .subscribe((lang: any) => {
        this.currentLanguage = lang;
      });
  }

  toggleLanguage(): void {
    const newLang: Language = this.currentLanguage === 'en' ? 'ar' : 'en';
    this.translationService.setLanguage(newLang);
  }

  translate(key: string): string {
    return this.translationService.translate(key);
  }

  onOtpInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '');
    this.otp[index] = value.charAt(0) || '';
    input.value = this.otp[index];
    if (this.otp[index] && index < this.otpLength - 1) {
      this.focusInput(index + 1);
    }
  }

  onOtpKeyDown(event: KeyboardEvent, index: number): void {
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
    if (allowedKeys.includes(event.key)) {
      if (event.key === 'Backspace' && !this.otp[index] && index > 0) {
        event.preventDefault();
        this.otp[index - 1] = '';
        this.focusInput(index - 1);
      }

      if (event.key === 'ArrowLeft' && index > 0) {
        event.preventDefault();
        this.focusInput(index - 1);
      }

      if (event.key === 'ArrowRight' && index < this.otpLength - 1) {
        event.preventDefault();
        this.focusInput(index + 1);
      }

      if (event.key === 'Delete') {
        this.otp[index] = '';
      }

      return;
    }
    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
    }
  }

  onOtpPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') ?? '';
    const digits = pastedData.replace(/\D/g, '').slice(0, this.otpLength);
    if (!digits) {
      return;
    }
    this.otp = Array(this.otpLength).fill('');
    const inputs = this.otpInputs.toArray();
    digits.split('').forEach((digit, index) => {
      this.otp[index] = digit;
      if (inputs[index]) {
        inputs[index].nativeElement.value = digit;
      }
    });
    const focusIndex = Math.min(digits.length, this.otpLength - 1);
    this.focusInput(focusIndex);
  }

  private focusInput(index: number): void {
    setTimeout(() => {
      const input = this.otpInputs?.get(index)?.nativeElement;
      if (input) {
        input.focus();
        input.select();
      }
    });
  }

  private getOtpValue(): string {
    return this.otp.join('');
  }

  verifyOtp(): void {
    const otpValue = this.getOtpValue();
    if (otpValue.length !== this.otpLength) {
      return;
    }
    this.isLoading = true;
    console.log('OTP:', otpValue);
    setTimeout(() => {
      this.isLoading = false;

      console.log('OTP verification completed:', otpValue);

      // After successful API:
      // this.router.navigate(['/dashboard']);
    }, 1000);
  }

  resendCode(): void {
    if (this.remainingSeconds > 0 || this.isLoading) {
      return;
    }
    console.log('Resend OTP');
    this.startTimer();
  }

  private startTimer(): void {
    this.clearTimer();
    this.remainingSeconds = 297;
    this.timer = setInterval(() => {
      if (this.remainingSeconds > 0) {
        this.remainingSeconds--;
      } else {
        this.clearTimer();
      }
    }, 1000);
  }

  get formattedTime(): string {
    const minutes = Math.floor(this.remainingSeconds / 60);
    const seconds = this.remainingSeconds % 60;
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
