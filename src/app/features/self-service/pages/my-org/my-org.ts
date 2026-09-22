import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { SelfServiceApiService } from '../../services/self-service';
import { User } from '../../../../core/models/auth/user.model';
import { TranslationService } from '../../../auth/services/Translation.service';

@Component({
  selector: 'app-my-org',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-org.html',
  styleUrl: './my-org.scss',
})
export class MyOrg implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly selfService = inject(SelfServiceApiService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();
  private readonly i18n = inject(TranslationService);
  t = (k: string) => this.i18n.translate(k);

  currentUser: User | null = null;

  get displayName(): string {
    const u = this.currentUser;
    if (!u) return '';
    const ar = (u.nameAr ?? '').trim(), en = (u.nameEn ?? '').trim();
    return this.i18n.getCurrentLanguage() === 'ar' ? (ar || en || u.email) : (en || ar || u.email);
  }

  get initials(): string {
    const src = this.displayName || '';
    return src.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('') || '?';
  }

  isSendingReset = false;
  resetSent = false;
  resetError = '';

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.currentUser = user ? { ...user, roles: user.roles ?? [] } : null;
        this.cdr.markForCheck();
      });
  }

  sendPasswordReset(): void {
    if (!this.currentUser?.email) return;
    this.isSendingReset = true;
    this.resetSent = false;
    this.resetError = '';
    this.selfService
      .sendPasswordReset(this.currentUser.email)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => { this.isSendingReset = false; this.cdr.markForCheck(); })
      )
      .subscribe({
        next: () => { this.resetSent = true; },
        error: (err) => { this.resetError = err?.error?.message ?? this.t('selfService.resetFailed'); },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
