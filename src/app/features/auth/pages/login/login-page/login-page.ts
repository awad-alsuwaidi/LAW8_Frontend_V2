import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { TranslationService, Language } from '../../../services/Translation.service';
import { LanguageSwitcher } from '../../language-switcher/Language switcher.component';
import { AuthService } from '../../../../../core/auth/services/auth.service';
import { getRememberedUsername } from '../../../../../core/auth/services/token-storage';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule, LanguageSwitcher],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export class LoginPage implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly translationService = inject(TranslationService);
  private readonly authService = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();

  userName = '';
  password = '';

  showPassword = false;
  rememberMe = false;

  isLoading = false;

  errorMessage = '';
  successMessage = '';

  currentLanguage: Language = 'en';

  ngOnInit(): void {
    this.initializeLanguage();
    // Prefill from the last "remember me" login.
    const remembered = getRememberedUsername();
    if (remembered) {
      this.userName = remembered;
      this.rememberMe = true;
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

  translate(key: string): string {
    return this.translationService.translate(key);
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.isLoading) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    if (!this.userName.trim() || !this.password) {
      this.errorMessage = this.translate('login.errors.required');

      this.cdr.markForCheck();
      return;
    }

    const username = this.userName.trim();
    const password = this.password;


    this.isLoading = true;
    this.cdr.markForCheck();

    this.authService
      .login(username, password, this.rememberMe)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (response) => {

          this.successMessage = response?.message ?? '';

          this.authService.setOtpFlow('login');

          this.router.navigate(['/auth/verify-otp']);
        },

        error: (error) => {
          console.error('[LoginPage] Login failed:', error);

          console.error('[LoginPage] Error body:', error?.error);

          console.error('[LoginPage] Error message:', error?.message);

          this.errorMessage =
            error?.error?.message ??
            error?.error?.data?.message ??
            error?.message ??
            this.translate('login.errors.invalidCredentials');

          this.cdr.markForCheck();
        },
      });
  }

  forgotPassword(): void {
    this.router.navigate(['/auth/forgot-password']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
