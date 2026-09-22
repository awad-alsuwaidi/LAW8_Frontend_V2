import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TranslationService, Language } from '../../../services/Translation.service';

import { LanguageSwitcher } from '../../language-switcher/Language switcher.component';

import { AuthService } from '../../../../../core/auth/services/auth.service';

@Component({
  selector: 'app-change-password-page',
  standalone: true,
  imports: [CommonModule, FormsModule, LanguageSwitcher],
  templateUrl: './change-password-page.html',
  styleUrl: './change-password-page.scss',
})
export class ChangePasswordPage implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly translationService = inject(TranslationService);
  private readonly authService = inject(AuthService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly cdr = inject(ChangeDetectorRef);

  private readonly destroy$ = new Subject<void>();

  newPassword = '';
  confirmPassword = '';

  showNewPassword = false;
  showConfirmPassword = false;

  isLoading = false;

  errorMessage = '';
  successMessage = '';

  currentLanguage: Language = 'en';

  readonly passwordRequirements = {
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false,
  };

  ngOnInit(): void {
    this.initializeLanguage();
    this.validateResetFlow();
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

  translate(key: string): string {
    return this.translationService.translate(key);
  }

  private validateResetFlow(): void {
    const username = this.authService.getUsername();
    const otpFlow = this.authService.getOtpFlow();

    if (!username || otpFlow !== 'reset') {

      this.router.navigate(['/auth/forgot-password']);
    }
  }

  toggleNewPassword(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onPasswordInput(): void {
    const password = this.newPassword;

    this.passwordRequirements.minLength = password.length >= 12;

    this.passwordRequirements.hasUppercase = /[A-Z]/.test(password);

    this.passwordRequirements.hasLowercase = /[a-z]/.test(password);

    this.passwordRequirements.hasNumber = /[0-9]/.test(password);

    this.passwordRequirements.hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(password);

    this.errorMessage = '';

    this.cdr.markForCheck();
  }

  private isPasswordValid(): boolean {
    return (
      this.passwordRequirements.minLength &&
      this.passwordRequirements.hasUppercase &&
      this.passwordRequirements.hasLowercase &&
      this.passwordRequirements.hasNumber &&
      this.passwordRequirements.hasSpecial
    );
  }

  private isPasswordMatching(): boolean {
    return this.newPassword === this.confirmPassword && this.newPassword.length > 0;
  }

  private validateForm(): boolean {
    this.errorMessage = '';

    if (!this.newPassword.trim() || !this.confirmPassword.trim()) {
      this.errorMessage = this.translate('changePassword.errors.emptyFields');

      return false;
    }

    if (!this.isPasswordValid()) {
      this.errorMessage = this.translate('changePassword.errors.weakPassword');

      return false;
    }

    if (!this.isPasswordMatching()) {
      this.errorMessage = this.translate('changePassword.errors.passwordMismatch');

      return false;
    }

    return true;
  }

  onSubmit(): void {
    if (this.isLoading) {
      return;
    }

    this.successMessage = '';

    if (!this.validateForm()) {
      this.cdr.markForCheck();
      return;
    }

    const username = this.authService.getUsername();

    if (!username) {
      this.errorMessage = this.translate('changePassword.errors.missingUsername');

      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService
      .resetPassword(username, this.newPassword)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: { message?: string }) => {
          this.isLoading = false;

          this.successMessage =
            response?.message ??
            this.translate('changePassword.success');

          this.cdr.markForCheck();

          this.redirectToLogin();
        },

        error: (error: { error?: { message?: string }; message?: string }) => {
          console.error('[ChangePasswordPage] Reset password failed:', error);

          this.isLoading = false;

          this.errorMessage =
            error?.error?.message ??
            error?.message ??
            this.translate('changePassword.errors.failed');

          this.cdr.markForCheck();
        },
      });
  }

  private redirectToLogin(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.router.navigate(['/auth/login']);
      return;
    }

    timer(1500)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.authService.clearOtpFlow();
        this.authService.logout();

        this.router.navigate(['/auth/login']);
      });
  }

  backToForgotPassword(): void {
    this.router.navigate(['/auth/forgot-password']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
