import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { SubscriptionsService } from '../../../services/subscription-detail';
import { BillingCycle, SubscriptionDetailDto } from '../../../../../core/models/subscription/subscription.models';
import { BILLING_CYCLES, computeEndDate } from '../../../../../core/models/subscription/billing-cycle';
import { TranslationService } from '../../../../auth/services/Translation.service';
import { ProductLabelPipe } from '../../../../../core/ui/product-label.pipe';

/**
 * Renews a subscription: an active one continues after its end date; an expired or cancelled one (still in the
 * grace or archive period) restarts today and gets full access back.
 */
@Component({
  selector: 'app-renew-modal',
  standalone: true,
  imports: [ProductLabelPipe, CommonModule, FormsModule],
  templateUrl: './renew-modal.html',
})
export class RenewModal implements OnInit, OnDestroy {
  @Input({ required: true }) subscription!: SubscriptionDetailDto;
  @Output() saved = new EventEmitter<SubscriptionDetailDto>();
  @Output() closed = new EventEmitter<void>();

  private readonly service = inject(SubscriptionsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly i18n = inject(TranslationService);
  private readonly destroy$ = new Subject<void>();
  t = (k: string) => this.i18n.translate(k);

  readonly cycles = BILLING_CYCLES;
  billingCycle: BillingCycle = 'Yearly';
  cycleCount = 1;
  endDate = '';
  totalPrice: number | null = null;
  reason = '';
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.billingCycle = this.subscription.billingCycle && this.subscription.billingCycle !== 'None' ? this.subscription.billingCycle : 'Yearly';
    this.cycleCount = this.subscription.cycleCount || 1;
    this.totalPrice = this.subscription.totalPrice ?? null;
  }

  /** An active subscription continues after its current end date; an ended one restarts today. */
  get newStart(): string {
    const end = new Date(this.subscription.endDate);
    const now = new Date();
    const start = this.subscription.status === 'Active' && end > now ? end : now;
    return start.toISOString().slice(0, 10);
  }

  get newEnd(): string {
    return this.billingCycle === 'None'
      ? this.endDate
      : computeEndDate(this.newStart, this.billingCycle, this.cycleCount);
  }

  cycleLabel(c: string): string {
    const key = 'subscriptions.cycle' + c;
    const v = this.t(key);
    return v === key ? c : v;
  }

  get isValid(): boolean {
    if (this.billingCycle === 'None') return !!this.endDate && this.endDate > this.newStart;
    return this.cycleCount >= 1 && (this.totalPrice === null || this.totalPrice >= 0);
  }

  submit(): void {
    if (this.isLoading || !this.isValid) return;
    this.isLoading = true;
    this.errorMessage = '';
    this.service
      .renew(this.subscription.id, {
        billingCycle: this.billingCycle,
        cycleCount: this.billingCycle === 'None' ? undefined : Math.max(1, Math.floor(this.cycleCount)),
        endDate: this.billingCycle === 'None' ? this.endDate : undefined,
        totalPrice: this.totalPrice ?? undefined,
        reason: this.reason.trim() || undefined,
      })
      .pipe(takeUntil(this.destroy$), finalize(() => { this.isLoading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: (updated) => this.saved.emit(updated),
        error: (err) => { this.errorMessage = err?.error?.message ?? this.t('subscriptions.renew.failed'); },
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
