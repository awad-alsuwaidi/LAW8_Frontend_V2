import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { SubscriptionsService } from '../../../services/subscription-detail';
import { LimitDefinition, SubscriptionDetailDto } from '../../../../../core/models/subscription/subscription.models';
import { TranslationService } from '../../../../auth/services/Translation.service';
import { ProductLabelPipe } from '../../../../../core/ui/product-label.pipe';

/**
 * Edits the quotas of a limited ("Lite") or trial subscription. An empty field means unlimited;
 * clearing every field and the trial flag turns it back into a full subscription.
 */
@Component({
  selector: 'app-limits-modal',
  standalone: true,
  imports: [ProductLabelPipe, CommonModule, FormsModule],
  templateUrl: './limits-modal.html',
})
export class LimitsModal implements OnInit, OnDestroy {
  @Input({ required: true }) subscription!: SubscriptionDetailDto;
  @Input({ required: true }) definitions: LimitDefinition[] = [];
  @Output() saved = new EventEmitter<SubscriptionDetailDto>();
  @Output() closed = new EventEmitter<void>();

  private readonly service = inject(SubscriptionsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly i18n = inject(TranslationService);
  private readonly destroy$ = new Subject<void>();
  t = (k: string) => this.i18n.translate(k);

  values: Record<string, number | null> = {};
  isTrial = false;
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.isTrial = !!this.subscription.isTrial;
    for (const d of this.definitions) {
      this.values[d.key] = this.subscription.limits?.[d.key] ?? null;
    }
  }

  definitionName(d: LimitDefinition): string {
    return this.i18n.getLocale().startsWith('ar') ? d.nameAr : d.nameEn;
  }

  get hasInvalid(): boolean {
    return Object.values(this.values).some((v) => v !== null && v !== undefined && (v < 0 || !Number.isInteger(Number(v))));
  }

  submit(): void {
    if (this.isLoading || this.hasInvalid) return;
    const limits: Record<string, number> = {};
    for (const [key, value] of Object.entries(this.values)) {
      if (value !== null && value !== undefined && `${value}` !== '') limits[key] = Number(value);
    }
    this.isLoading = true;
    this.errorMessage = '';
    this.service
      .updateLimits(this.subscription.id, { limits, isTrial: this.isTrial })
      .pipe(takeUntil(this.destroy$), finalize(() => { this.isLoading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: (updated) => this.saved.emit(updated),
        error: (err) => { this.errorMessage = err?.error?.message ?? this.t('subscriptions.limits.failed'); },
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
