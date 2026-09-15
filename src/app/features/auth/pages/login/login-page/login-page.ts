import { Component, inject, PLATFORM_ID, OnInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslationService, Language } from '../../../services/Translation.service';
import { LanguageSwitcher } from '../../language-switcher/Language switcher.component';
import { AuthService } from '../../../../../core/auth/services/auth.service';


@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [FormsModule, LanguageSwitcher],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export class LoginPage implements OnInit {
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly translationService = inject(TranslationService);
  private readonly authService = inject(AuthService);
  private readonly destroy$ = new Subject<void>();

  userName = '';
  password = '';

  rememberMe = false;
  showPassword = false;

  isLoading = false;
  errorMessage = '';

  currentLanguage: Language = 'en';

  constructor() {
    this.loadRememberedUser();
  }

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
      });
  }

  private loadRememberedUser(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const rememberedUser = localStorage.getItem('rememberedUser');

    if (!rememberedUser) {
      return;
    }

    try {
      const userData = JSON.parse(rememberedUser);

      this.userName = userData.userName ?? '';

      this.password = userData.password ?? '';

      this.rememberMe = true;
    } catch {
      localStorage.removeItem('rememberedUser');
    }
  }

  translate(key: string): string {
    return this.translationService.translate(key);
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (!this.userName.trim() || !this.password.trim()) {
      this.errorMessage = this.translate('login.errors.emptyFields');

      return;
    }

    this.isLoading = true;

    this.authService
      .login(this.userName.trim(), this.password)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isLoading = false;

          this.saveRememberedUser();

          this.router.navigate(['/auth/verify-otp']);
        },

        error: (error) => {
          console.error('[LoginPage] Login failed:', error);

          this.isLoading = false;

          this.errorMessage =
            error?.error?.data?.message ??
            error?.error?.message ??
            this.translate('login.errors.loginFailed');
        },
      });
  }

  private saveRememberedUser(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (this.rememberMe) {
      localStorage.setItem(
        'rememberedUser',
        JSON.stringify({
          userName: this.userName,

          password: this.password,
        }),
      );

      return;
    }

    localStorage.removeItem('rememberedUser');
  }

  forgotPassword(): void {
    this.router.navigate(['/auth/forgot-password']);
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
