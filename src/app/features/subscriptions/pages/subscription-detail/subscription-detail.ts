import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { SubscriptionsService } from '../../services/subscription-detail';
import {
  SubscriptionDetailDto,
  SubscriptionHistoryDto,
  SubscriptionStatus,
  SubscriptionAction,
} from '../../../../core/models/subscription/subscription.models';
import { TranslationService } from '../../../auth/services/Translation.service';
import { AddUsersModal } from '../modals/add-users-modal/add-users-modal';
import { SuspendModal } from '../modals/suspend-modal/suspend-modal';
import { CancelModal } from '../modals/cancel-modal/cancel-modal';
import { UiPager, pageSlice } from '../../../../core/ui/pager/ui-pager';
import { Money } from '../../../../core/ui/money/money';
import { ProductLabelPipe } from '../../../../core/ui/product-label.pipe';

type ModalType = 'add-users' | 'suspend' | 'cancel';


@Component({
  selector: 'app-subscription-detail',
  standalone: true,
  imports: [ProductLabelPipe, CommonModule, RouterLink, AddUsersModal, SuspendModal, CancelModal, UiPager, Money],
  templateUrl: './subscription-detail.html',
  styleUrl: './subscription-detail.scss',
})
export class SubscriptionDetail implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(SubscriptionsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();
  private readonly i18n = inject(TranslationService);
  t = (k: string) => this.i18n.translate(k);

  detail: SubscriptionDetailDto | null = null;
  history: SubscriptionHistoryDto[] = [];

  histPage = 1; histPageSize = 10;
  get pagedHistory() { return pageSlice(this.history, this.histPage, this.histPageSize); }

  isLoading = false;
  errorMessage = '';
  reactivating = false;

  activeModal: ModalType | null = null;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.load(id);
  }

  get subscriptionId(): string {
    return this.route.snapshot.paramMap.get('id')!;
  }

  load(id: string): void {
    this.isLoading = true;
    this.errorMessage = '';
    forkJoin({
      detail: this.service.getById(id),
      history: this.service.getHistory(id),
    })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => { this.isLoading = false; this.cdr.markForCheck(); })
      )
      .subscribe({
        next: ({ detail, history }) => {
          this.detail = detail;
          this.history = history;
          this.histPage = 1;
        },
        error: (err) => {
          this.errorMessage = err?.error?.message ?? this.t('subscriptions.detail.loadFailed');
        },
      });
  }

  onModalSaved(updated: SubscriptionDetailDto): void {
    this.detail = updated;
    this.activeModal = null;
    this.reloadHistory();
    this.cdr.markForCheck();
  }

  reactivate(): void {
    this.reactivating = true;
    this.service
      .reactivate(this.subscriptionId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => { this.reactivating = false; this.cdr.markForCheck(); })
      )
      .subscribe({
        next: (updated) => {
          this.detail = updated;
          this.reloadHistory();
        },
        error: (err) => {
          this.errorMessage = err?.error?.message ?? this.t('subscriptions.detail.reactivateFailed');
        },
      });
  }

  private reloadHistory(): void {
    this.service
      .getHistory(this.subscriptionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: (h) => { this.history = h; this.histPage = 1; this.cdr.markForCheck(); } });
  }

  back(): void {
    this.router.navigate(['/subscriptions']);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString(this.i18n.getLocale(), { year: 'numeric', month: 'short', day: 'numeric' });
  }

  formatDateTime(date: string): string {
    return new Date(date).toLocaleString(this.i18n.getLocale(), {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  statusClass(status: SubscriptionStatus): string {
    switch (status) {
      case 'Active':    return 'ui-badge--success';
      case 'Suspended': return 'ui-badge--warning';
      case 'Cancelled': return 'ui-badge--danger';
      case 'Pending':   return 'ui-badge--neutral';
    }
  }

  actionLabel(action: SubscriptionAction): string {
    switch (action) {
      case 'Created':      return 'Created';
      case 'Suspended':    return 'Suspended';
      case 'Reactivated':  return 'Reactivated';
      case 'Cancelled':    return 'Cancelled';
      case 'Renewed':      return 'Renewed';
      case 'UsersAdded':   return 'Users Added';
      case 'UsersRemoved': return 'Users Removed';
    }
  }

  actionClass(action: SubscriptionAction): string {
    switch (action) {
      case 'Created':
      case 'Reactivated':  return 'ui-badge--success';
      case 'Suspended':    return 'ui-badge--warning';
      case 'Cancelled':    return 'ui-badge--danger';
      case 'UsersAdded':
      case 'Renewed':      return 'ui-badge--info';
      case 'UsersRemoved': return 'ui-badge--neutral';
    }
  }

  billingCycleLabel(cycle: string): string {
    const key = 'subscriptions.cycle' + cycle;
    const v = this.t(key);
    return v === key ? cycle : v;
  }

  discountLabel(value: number | undefined, type: string | undefined): string {
    if (!value || !type || type === 'None') return '—';
    return type === 'Percentage' ? `${value}%` : `${value.toFixed(2)}`;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
