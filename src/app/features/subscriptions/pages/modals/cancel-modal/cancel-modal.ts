import { Component, Input, Output, EventEmitter, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { SubscriptionsService } from '../../../services/subscription-detail';
import { SubscriptionDetailDto } from '../../../../../core/models/subscription/subscription.models';
import { TranslationService } from '../../../../auth/services/Translation.service';
import { ProductLabelPipe } from '../../../../../core/ui/product-label.pipe';

@Component({
  selector: 'app-cancel-modal',
  standalone: true,
  imports: [ProductLabelPipe, CommonModule, FormsModule],
  templateUrl: './cancel-modal.html',
  styleUrl: './cancel-modal.scss',
})
export class CancelModal implements OnDestroy {
  @Input({ required: true }) subscription!: SubscriptionDetailDto;
  @Output() saved = new EventEmitter<SubscriptionDetailDto>();
  @Output() closed = new EventEmitter<void>();

  private readonly service = inject(SubscriptionsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly i18n = inject(TranslationService);
  private readonly destroy$ = new Subject<void>();
  t = (k: string) => this.i18n.translate(k);

  reason = '';
  isLoading = false;
  errorMessage = '';

  submit(): void {
    if (this.isLoading) return;
    this.isLoading = true;
    this.errorMessage = '';
    this.service
      .cancel(this.subscription.id, { reason: this.reason.trim() || undefined })
      .pipe(takeUntil(this.destroy$), finalize(() => { this.isLoading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: (updated) => this.saved.emit(updated),
        error: (err) => { this.errorMessage = err?.error?.message ?? this.t('subscriptions.cancel.failed'); },
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
