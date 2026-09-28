import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { SubscriptionsService } from '../../services/subscription-detail';
import { DataDeletionCertificateDto, OffboardingItemDto, formatBytes } from '../../../../core/models/platform-ops/platform-ops.models';
import { TranslationService } from '../../../auth/services/Translation.service';
import { UiPager, pageSlice } from '../../../../core/ui/pager/ui-pager';
import { DeletionCertificate } from '../../../tenant/components/deletion-certificate/deletion-certificate';

type StateFilter = 'all' | 'Grace' | 'Archived' | 'PurgeDue';

/**
 * Ended subscriptions on their way out: read-only grace, archive, and purge due. A SuperAdmin can purge one
 * (it asks for the subdomain again; before the archive period ends it needs "force").
 */
@Component({
  selector: 'app-offboarding-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, UiPager, DeletionCertificate],
  templateUrl: './offboarding-list.html',
  styleUrl: './offboarding-list.scss',
})
export class OffboardingList implements OnInit, OnDestroy {
  private readonly service = inject(SubscriptionsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly i18n = inject(TranslationService);
  private readonly destroy$ = new Subject<void>();
  t = (k: string) => this.i18n.translate(k);

  items: OffboardingItemDto[] = [];
  isLoading = false;
  errorMessage = '';
  filter: StateFilter = 'all';
  readonly filters: StateFilter[] = ['all', 'Grace', 'Archived', 'PurgeDue'];

  page = 1;
  pageSize = 10;

  purgeTarget: OffboardingItemDto | null = null;
  confirmSubdomain = '';
  force = false;
  isPurging = false;
  purgeError = '';
  certificate: DataDeletionCertificateDto | null = null;

  readonly formatBytes = formatBytes;

  get filtered(): OffboardingItemDto[] {
    return this.filter === 'all' ? this.items : this.items.filter((i) => i.state === this.filter);
  }

  get pagedRows(): OffboardingItemDto[] { return pageSlice(this.filtered, this.page, this.pageSize); }

  count(f: StateFilter): number {
    return f === 'all' ? this.items.length : this.items.filter((i) => i.state === f).length;
  }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.service.getOffboarding()
      .pipe(takeUntil(this.destroy$), finalize(() => { this.isLoading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: (items) => { this.items = items ?? []; this.page = 1; },
        error: (err) => { this.errorMessage = err?.error?.message ?? this.t('offboarding.loadFailed'); },
      });
  }

  setFilter(f: StateFilter): void {
    this.filter = f;
    this.page = 1;
  }

  stateLabel(state: string): string {
    const key = 'subscriptions.access.state' + state;
    const v = this.t(key);
    return v === key ? state : v;
  }

  stateClass(state: string): string {
    switch (state) {
      case 'Grace':    return 'ui-badge--warning';
      case 'Archived': return 'ui-badge--neutral';
      case 'PurgeDue': return 'ui-badge--danger';
      default:         return 'ui-badge--neutral';
    }
  }

  formatDate(date: string | null | undefined): string {
    return date ? new Date(date).toLocaleDateString(this.i18n.getLocale(), { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
  }

  formatDateTime(date: string): string {
    return new Date(date).toLocaleString(this.i18n.getLocale(), { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  openPurge(item: OffboardingItemDto): void {
    this.purgeTarget = item;
    this.confirmSubdomain = '';
    this.force = false;
    this.purgeError = '';
  }

  closePurge(): void {
    if (!this.isPurging) this.purgeTarget = null;
  }

  /** Before purge is due the archive still protects the data, so the caller must opt in with force. */
  get needsForce(): boolean {
    return !!this.purgeTarget && this.purgeTarget.state !== 'PurgeDue';
  }

  get canPurge(): boolean {
    return !!this.purgeTarget
      && this.confirmSubdomain.trim().toLowerCase() === this.purgeTarget.subdomain.toLowerCase()
      && (!this.needsForce || this.force);
  }

  doPurge(): void {
    const target = this.purgeTarget;
    if (!target || !this.canPurge || this.isPurging) return;
    this.isPurging = true;
    this.purgeError = '';
    this.service.purge(target.subscriptionId, this.confirmSubdomain.trim(), this.needsForce && this.force)
      .pipe(takeUntil(this.destroy$), finalize(() => { this.isPurging = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: (cert) => {
          this.purgeTarget = null;
          this.certificate = cert;
          this.items = this.items.filter((i) => i.subscriptionId !== target.subscriptionId);
        },
        error: (err) => { this.purgeError = err?.error?.message ?? this.t('offboarding.purgeFailed'); },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
