import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { SubscriptionsService } from '../../../services/subscription-detail';
import { SubscriptionDetailDto } from '../../../../../core/models/subscription/subscription.models';
import { TranslationService } from '../../../../auth/services/Translation.service';
import { PositiveIntegerDirective } from '../../../../../core/validators/positive-integer.directive';
import { Money } from '../../../../../core/ui/money/money';
import { ProductLabelPipe } from '../../../../../core/ui/product-label.pipe';

/**
 * Buys extra storage on top of the plan's storage limit. The price per GB covers a full period and is charged
 * pro rata for the days left (like extra seats).
 */
@Component({
  selector: 'app-add-storage-modal',
  standalone: true,
  imports: [ProductLabelPipe, CommonModule, FormsModule, PositiveIntegerDirective, Money],
  templateUrl: './add-storage-modal.html',
  styleUrl: '../add-users-modal/add-users-modal.scss',
})
export class AddStorageModal implements OnInit, OnDestroy {
  @Input({ required: true }) subscription!: SubscriptionDetailDto;
  /** Plan storage (MB) without the purchased extra. */
  @Input({ required: true }) baseStorageMb!: number;
  @Output() saved = new EventEmitter<SubscriptionDetailDto>();
  @Output() closed = new EventEmitter<void>();

  private readonly service = inject(SubscriptionsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly i18n = inject(TranslationService);
  private readonly destroy$ = new Subject<void>();
  t = (k: string) => this.i18n.translate(k);

  gb = 1;
  pricePerGb: number | null = null;
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.pricePerGb = this.subscription.pricePerExtraGb ?? null;
  }

  get currentExtraGb(): number { return this.subscription.extraStorageGb ?? 0; }

  /** Plan storage plus purchased extra (current), and after this purchase, in MB. */
  get currentMb(): number { return this.baseStorageMb + this.currentExtraGb * 1024; }
  get newTotalMb(): number { return this.currentMb + (this.gb || 0) * 1024; }

  /** "500 MB" below 1 GB, otherwise "1.5 GB". */
  sizeLabel(mb: number): string {
    return mb < 1024 ? `${Math.round(mb)} MB` : `${Math.round((mb / 1024) * 100) / 100} GB`;
  }

  /** Days left over days in the period, as the API prorates. */
  private get remainingRatio(): number {
    const start = new Date(this.subscription.startDate).getTime();
    const end = new Date(this.subscription.endDate).getTime();
    const today = new Date(new Date().toDateString()).getTime();
    const total = Math.max(1, Math.round((end - start) / 86_400_000));
    const left = Math.max(0, Math.round((end - today) / 86_400_000));
    return Math.min(1, left / total);
  }

  get estimatedCharge(): number {
    const full = (this.gb || 0) * (this.pricePerGb ?? 0);
    return Math.round(full * this.remainingRatio * 100) / 100;
  }

  get canSubmit(): boolean {
    return !this.isLoading && this.gb >= 1 && this.pricePerGb !== null && this.pricePerGb >= 0;
  }

  submit(): void {
    if (!this.canSubmit) return;
    this.isLoading = true;
    this.errorMessage = '';
    this.service
      .addStorage(this.subscription.id, { gb: Math.floor(this.gb), pricePerGb: this.pricePerGb ?? undefined })
      .pipe(takeUntil(this.destroy$), finalize(() => { this.isLoading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: (updated) => this.saved.emit(updated),
        error: (err) => { this.errorMessage = err?.error?.message ?? this.t('subscriptions.storage.failed'); },
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
