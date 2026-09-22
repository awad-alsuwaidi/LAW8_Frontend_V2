import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { SubscriptionsService } from '../../services/subscription-detail';
import { SubscriptionDetailDto, SubscriptionStatus } from '../../../../core/models/subscription/subscription.models';
import { TranslationService } from '../../../auth/services/Translation.service';
import { UiPager, pageSlice, newestFirst } from '../../../../core/ui/pager/ui-pager';
import { Money } from '../../../../core/ui/money/money';
import { ProductLabelPipe } from '../../../../core/ui/product-label.pipe';


@Component({
  selector: 'app-subscription-list',
  standalone: true,
  imports: [ProductLabelPipe, CommonModule, FormsModule, UiPager, Money],
  templateUrl: './subscription-list.html',
  styleUrl: './subscription-list.scss',
})
export class SubscriptionList implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly service = inject(SubscriptionsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();
  private readonly i18n = inject(TranslationService);
  t = (k: string) => this.i18n.translate(k);

  items: SubscriptionDetailDto[] = [];
  filtered: SubscriptionDetailDto[] = [];

  page = 1; pageSize = 10;
  get pagedRows() { return pageSlice(this.filtered, this.page, this.pageSize); }

  isLoading = false;
  errorMessage = '';
  searchQuery = '';
  statusFilter: SubscriptionStatus | '' = '';

  get activeCount(): number { return this.items.filter((s) => s.status === 'Active').length; }
  get suspendedCount(): number { return this.items.filter((s) => s.status === 'Suspended').length; }
  get cancelledCount(): number { return this.items.filter((s) => s.status === 'Cancelled').length; }
  get pendingCount(): number { return this.items.filter((s) => s.status === 'Pending').length; }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.service
      .getAll()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => { this.isLoading = false; this.cdr.markForCheck(); })
      )
      .subscribe({
        next: (items) => {
          this.items = newestFirst(items, (s) => s.createdAtUtc);
          this.applyFilters();
        },
        error: (err) => {
          this.errorMessage = err?.error?.message ?? 'Failed to load subscriptions.';
        },
      });
  }

  applyFilters(): void {
    const q = this.searchQuery.toLowerCase().trim();
    this.filtered = this.items.filter((s) => {
      const matchSearch =
        !q ||
        s.organizationName.toLowerCase().includes(q) ||
        s.subdomain.toLowerCase().includes(q) ||
        (s.productName ?? '').toLowerCase().includes(q) ||
        s.productCode.toLowerCase().includes(q);
      const matchStatus = !this.statusFilter || s.status === this.statusFilter;
      return matchSearch && matchStatus;
    });
    this.page = 1;
    this.cdr.markForCheck();
  }

  view(id: string): void {
    this.router.navigate(['/subscriptions', id]);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString(this.i18n.getLocale(), { year: 'numeric', month: 'short', day: 'numeric' });
  }

  cycleLabel(cycle: string): string {
    const key = 'subscriptions.cycle' + cycle;
    const v = this.t(key);
    return v === key ? cycle : v;
  }

  statusClass(status: SubscriptionStatus): string {
    switch (status) {
      case 'Active':    return 'ui-badge--success';
      case 'Suspended': return 'ui-badge--warning';
      case 'Cancelled': return 'ui-badge--danger';
      case 'Pending':   return 'ui-badge--neutral';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
