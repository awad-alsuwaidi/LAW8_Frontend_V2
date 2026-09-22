import { Component, Input, Output, EventEmitter, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { SubscriptionsService } from '../../../services/subscription-detail';
import { SubscriptionDetailDto } from '../../../../../core/models/subscription/subscription.models';
import { TranslationService } from '../../../../auth/services/Translation.service';
import { PositiveIntegerDirective } from '../../../../../core/validators/positive-integer.directive';
import { coercePositiveInteger } from '../../../../../core/validators/common.validators';
import { Money } from '../../../../../core/ui/money/money';
import { ProductLabelPipe } from '../../../../../core/ui/product-label.pipe';

/** Adds seats to a subscription. Seats can only grow; the price is the per-seat rate fixed at signup. */
@Component({
  selector: 'app-add-users-modal',
  standalone: true,
  imports: [ProductLabelPipe, CommonModule, FormsModule, PositiveIntegerDirective, Money],
  templateUrl: './add-users-modal.html',
  styleUrl: './add-users-modal.scss',
})
export class AddUsersModal implements OnDestroy {
  @Input({ required: true }) subscription!: SubscriptionDetailDto;
  @Output() saved = new EventEmitter<SubscriptionDetailDto>();
  @Output() closed = new EventEmitter<void>();

  private readonly service = inject(SubscriptionsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly i18n = inject(TranslationService);
  private readonly destroy$ = new Subject<void>();
  t = (k: string) => this.i18n.translate(k);

  count = 1;
  isLoading = false;
  errorMessage = '';

  onCountInput(value: unknown): void {
    this.count = coercePositiveInteger(value);
  }

  get priceImpact(): number {
    return Math.max(0, Math.floor(this.count || 0)) * (this.subscription.pricePerAdditionalUser ?? 0);
  }

  get canSubmit(): boolean {
    return !this.isLoading && this.count >= 1 && !!this.subscription.pricePerAdditionalUser;
  }

  submit(): void {
    if (!this.canSubmit) return;
    this.isLoading = true;
    this.errorMessage = '';
    this.service
      .addUsers(this.subscription.id, { count: this.count })
      .pipe(takeUntil(this.destroy$), finalize(() => { this.isLoading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: (updated) => this.saved.emit(updated),
        error: (err) => { this.errorMessage = err?.error?.message ?? this.t('subscriptions.addUsers.failed'); },
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
