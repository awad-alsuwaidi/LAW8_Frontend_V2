import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PositiveIntegerDirective } from '../../../../../core/validators/positive-integer.directive';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { SubscriptionsService } from '../../../services/subscription-detail';
import { SubscriptionDetailDto } from '../../../../../core/models/subscription/subscription.models';
import { IntegrationSyncMode, SubscriptionIntegrationDto } from '../../../../../core/models/platform-ops/platform-ops.models';
import { TranslationService } from '../../../../auth/services/Translation.service';

/** Sync mode, schedule and rate limit of one integration for one subscription. */
@Component({
  selector: 'app-integration-settings-modal',
  standalone: true,
  imports: [PositiveIntegerDirective, CommonModule, FormsModule],
  templateUrl: './integration-settings-modal.html',
})
export class IntegrationSettingsModal implements OnInit, OnDestroy {
  @Input({ required: true }) subscription!: SubscriptionDetailDto;
  @Input({ required: true }) integration!: SubscriptionIntegrationDto;
  @Output() saved = new EventEmitter<SubscriptionIntegrationDto>();
  @Output() closed = new EventEmitter<void>();

  private readonly service = inject(SubscriptionsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly i18n = inject(TranslationService);
  private readonly destroy$ = new Subject<void>();
  t = (k: string) => this.i18n.translate(k);

  readonly modes: IntegrationSyncMode[] = ['Webhook', 'Scheduled', 'Both'];
  syncMode: IntegrationSyncMode = 'Webhook';
  syncIntervalMinutes = 60;
  rateLimitPerMinute = 60;
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.syncMode = this.integration.syncMode;
    this.syncIntervalMinutes = this.integration.syncIntervalMinutes;
    this.rateLimitPerMinute = this.integration.rateLimitPerMinute;
  }

  get isValid(): boolean {
    return this.syncIntervalMinutes >= 5 && this.syncIntervalMinutes <= 10080
      && this.rateLimitPerMinute >= 1 && this.rateLimitPerMinute <= 10000;
  }

  submit(): void {
    if (this.isLoading || !this.isValid) return;
    this.isLoading = true;
    this.errorMessage = '';
    this.service
      .saveIntegration(this.subscription.id, this.integration.providerCode, {
        syncMode: this.syncMode,
        syncIntervalMinutes: Math.floor(this.syncIntervalMinutes),
        rateLimitPerMinute: Math.floor(this.rateLimitPerMinute),
      })
      .pipe(takeUntil(this.destroy$), finalize(() => { this.isLoading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: (updated) => this.saved.emit(updated),
        error: (err) => { this.errorMessage = err?.error?.message ?? this.t('subscriptions.integrations.failed'); },
      });
  }

  close(): void {
    if (!this.isLoading) this.closed.emit();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
