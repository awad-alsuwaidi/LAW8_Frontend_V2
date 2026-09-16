import {
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslationService, Language } from '../../../services/Translation.service';
import { LanguageSwitcher } from '../../language-switcher/Language switcher.component';
import { AuthService } from '../../../../../core/auth/services/auth.service';

@Component({
  selector: 'app-forgot-password-page',
  standalone: true,
  imports: [FormsModule, LanguageSwitcher],
  templateUrl: './forgot-password-page.html',
  styleUrl: './forgot-password-page.scss',
})
export class ForgotPasswordPage implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly translationService = inject(TranslationService);
  private readonly authService = inject(AuthService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();

  email = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  currentLanguage: Language = 'en';

  ngOnInit(): void {
    this.initializeLanguage();
  }

  private initializeLanguage(): void {
    this.currentLanguage = this.translationService.getCurrentLanguage();

    this.translationService
      .getLanguage$()
      .pipe(takeUntil(this.destroy$))
      .subscribe((lang) => {
        this.currentLanguage = lang;
        this.cdr.markForCheck();
      });
  }

  translate(key: string): string {
    return this.translationService.translate(key);
  }

  onSubmit(): void {
    if (this.isLoading) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    const email = this.email.trim();

    if (!email) {
      this.errorMessage = this.translate('forgotPassword.errors.required');
      return;
    }

    if (!this.isValidEmail(email)) {
      this.errorMessage = this.translate('forgotPassword.errors.invalidEmail');
      return;
    }

    this.isLoading = true;

    this.authService
      .forgotPassword(email)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: { data?: { message?: string } }) => {
          this.isLoading = false;

          this.successMessage = response?.data?.message ?? this.translate('forgotPassword.success');
          this.authService.setUsername(email);
          this.authService.setOtpFlow('reset');
          this.cdr.markForCheck();
          this.redirectToOtp();
        },

        error: (error: { error?: { data?: { message?: string }; message?: string } }) => {
          console.error('[ForgotPasswordPage] Forgot password failed:', error);

          this.isLoading = false;

          this.errorMessage =
            error?.error?.data?.message ??
            error?.error?.message ??
            this.translate('forgotPassword.errors.failed');

          this.cdr.markForCheck();
        },
      });
  }


  private redirectToOtp(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.router.navigate(['/auth/verifyResetOtp']);
      return;
    }

    const delayMs = 1500;

    timer(delayMs)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.router.navigate(['/auth/verifyResetOtp']);
      });
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  backToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
