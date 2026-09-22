import { Component, Input, Output, EventEmitter, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { ApiClientService } from '../../../../../core/api/api-client.service';
import { PlatformUser } from '../../../../../core/models/platform/platform-user.model';
import { TranslationService } from '../../../../auth/services/Translation.service';

@Component({
  selector: 'app-reset-password-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reset-password-modal.html',
  styleUrl: './reset-password-modal.scss',
})
export class ResetPasswordModal implements OnDestroy {
  @Input() user!: PlatformUser;
  @Output() closed = new EventEmitter<void>();

  private readonly api = inject(ApiClientService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly i18n = inject(TranslationService);
  private readonly destroy$ = new Subject<void>();
  t = (k: string) => this.i18n.translate(k);

  isSending = false;
  success = false;
  errorMessage = '';

  send(): void {
    this.isSending = true;
    this.errorMessage = '';
    this.api.forgotPassword(this.user.email)
      .pipe(takeUntil(this.destroy$), finalize(() => { this.isSending = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: () => {
          this.success = true;
          setTimeout(() => this.closed.emit(), 2000);
        },
        error: (err: any) => {
          this.errorMessage = err?.error?.message ?? this.t('platformUsers.resetFailed');
        },
      });
  }

  close(): void {
    this.closed.emit();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
