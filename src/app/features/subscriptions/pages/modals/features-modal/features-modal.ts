import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { SubscriptionsService } from '../../../services/subscription-detail';
import { FeaturesService } from '../../../../setup/services/features';
import { SubscriptionDetailDto } from '../../../../../core/models/subscription/subscription.models';
import { FeatureDto } from '../../../../../core/models/setup/setup.models';
import { TranslationService } from '../../../../auth/services/Translation.service';
import { ProductLabelPipe } from '../../../../../core/ui/product-label.pipe';
import { LocalNamePipe } from '../../../../../core/ui/local-name.pipe';

/** Picks the add-on features of an active subscription; the API charges or credits the change pro rata. */
@Component({
  selector: 'app-features-modal',
  standalone: true,
  imports: [ProductLabelPipe, LocalNamePipe, CommonModule, FormsModule],
  templateUrl: './features-modal.html',
})
export class FeaturesModal implements OnInit, OnDestroy {
  @Input({ required: true }) subscription!: SubscriptionDetailDto;
  @Input({ required: true }) productId!: number;
  @Output() saved = new EventEmitter<SubscriptionDetailDto>();
  @Output() closed = new EventEmitter<void>();

  private readonly service = inject(SubscriptionsService);
  private readonly featuresSvc = inject(FeaturesService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly i18n = inject(TranslationService);
  private readonly destroy$ = new Subject<void>();
  t = (k: string) => this.i18n.translate(k);

  features: FeatureDto[] = [];
  selected = new Set<number>();
  isLoadingFeatures = true;
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    (this.subscription.features ?? []).forEach((f) => this.selected.add(f.featureId));
    this.featuresSvc.getByProduct(this.productId)
      .pipe(takeUntil(this.destroy$), finalize(() => { this.isLoadingFeatures = false; this.cdr.markForCheck(); }))
      .subscribe({
        // Inactive features stay listed only while the subscription already has them.
        next: (items) => { this.features = items.filter((f) => f.isActive || this.selected.has(f.id)); },
        error: () => { this.errorMessage = this.t('subscriptions.features.loadFailed'); },
      });
  }

  toggle(id: number, checked: boolean): void {
    if (checked) this.selected.add(id); else this.selected.delete(id);
  }

  submit(): void {
    if (this.isLoading) return;
    this.isLoading = true;
    this.errorMessage = '';
    this.service.updateFeatures(this.subscription.id, [...this.selected])
      .pipe(takeUntil(this.destroy$), finalize(() => { this.isLoading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: (updated) => this.saved.emit(updated),
        error: (err) => { this.errorMessage = err?.error?.message ?? this.t('subscriptions.features.failed'); },
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
