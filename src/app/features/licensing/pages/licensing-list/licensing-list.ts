import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { LicensingService } from '../../services/licensing';
import {
  LicenseKeySummaryDto,
  LicenseKeyStatus,
  LicenseKeyType,
  CreateLicenseKeyDto,
} from '../../../../core/models/licensing/license-key.model';
import { TranslationService } from '../../../auth/services/Translation.service';
import { UiPager, pageSlice, newestFirst } from '../../../../core/ui/pager/ui-pager';
import { TenantManagement } from '../../../tenant/services/tenant-management';
import { Organization } from '../../../../core/models/organizations/organization.model';

@Component({
  selector: 'app-licensing-list',
  standalone: true,
  imports: [CommonModule, FormsModule, UiPager],
  templateUrl: './licensing-list.html',
  styleUrl: './licensing-list.scss',
})
export class LicensingList implements OnInit, OnDestroy {
  private readonly router  = inject(Router);
  private readonly route   = inject(ActivatedRoute);
  private readonly service = inject(LicensingService);
  private readonly cdr     = inject(ChangeDetectorRef);
  private readonly i18n    = inject(TranslationService);
  private readonly tenants = inject(TenantManagement);

  /** On-prem organizations only; keys are meaningless for cloud tenants. */
  onPremOrgs: Organization[] = [];
  isLoadingOrgs = false;

  private loadOnPremOrgs(): void {
    if (this.onPremOrgs.length || this.isLoadingOrgs) return;
    this.isLoadingOrgs = true;
    this.tenants.getAll()
      .pipe(takeUntil(this.destroy$), finalize(() => { this.isLoadingOrgs = false; this.cdr.markForCheck(); }))
      .subscribe({ next: (orgs) => { this.onPremOrgs = orgs.filter(o => o.deploymentType === 'OnPrem'); }, error: () => {} });
  }
  private readonly destroy$ = new Subject<void>();
  t = (k: string) => this.i18n.translate(k);

  items: LicenseKeySummaryDto[] = [];
  filtered: LicenseKeySummaryDto[] = [];

  page = 1; pageSize = 10;
  get pagedRows() { return pageSlice(this.filtered, this.page, this.pageSize); }

  isLoading = false;
  errorMessage = '';
  searchQuery = '';
  statusFilter: LicenseKeyStatus | '' = '';

  /* ---- Create modal ---- */
  showCreateModal = false;
  isCreating = false;
  createError = '';
  createForm: CreateLicenseKeyDto = { tenantId: '', type: 'Production', notes: '' };

  /* ---- Cancel confirm ---- */
  cancelTargetId: string | null = null;
  isCancelling = false;
  cancelError = '';

  get totalCount(): number    { return this.items.length; }
  get availableCount(): number { return this.items.filter(k => k.status === 'Available').length; }
  get activatedCount(): number { return this.items.filter(k => k.status === 'Activated').length; }
  get expiredCount(): number   { return this.items.filter(k => k.status === 'Expired').length; }
  get cancelledCount(): number { return this.items.filter(k => k.status === 'Cancelled').length; }

  ngOnInit(): void {
    this.searchQuery = this.route.snapshot.queryParamMap.get('q') ?? '';
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.service
      .getAll()
      .pipe(takeUntil(this.destroy$), finalize(() => { this.isLoading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: (items) => { this.items = newestFirst(items, (k) => k.createdAtUtc); this.applyFilters(); },
        error: (err) => { this.errorMessage = err?.error?.message ?? this.t('licensing.loadFailed'); },
      });
  }

  applyFilters(): void {
    const q = this.searchQuery.toLowerCase().trim();
    this.filtered = this.items.filter(k => {
      const matchSearch =
        !q ||
        (k.tenantName ?? '').toLowerCase().includes(q) ||
        k.key.toLowerCase().includes(q) ||
        (k.currentMachineHostname ?? '').toLowerCase().includes(q);
      const matchStatus = !this.statusFilter || k.status === this.statusFilter;
      return matchSearch && matchStatus;
    });
    this.page = 1;
    this.cdr.markForCheck();
  }

  view(id: string): void { this.router.navigate(['/licensing', id]); }

  /* ---- Create ---- */

  openCreate(): void {
    this.loadOnPremOrgs();
    this.createForm = { tenantId: '', type: 'Production', notes: '' };
    this.createError = '';
    this.showCreateModal = true;
  }

  closeCreate(): void { this.showCreateModal = false; this.createError = ''; }

  submitCreate(): void {
    if (!this.createForm.tenantId.trim()) { this.createError = this.t('licensing.create.tenantRequired'); return; }
    this.isCreating = true;
    this.createError = '';
    this.service
      .create(this.createForm)
      .pipe(takeUntil(this.destroy$), finalize(() => { this.isCreating = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: (key) => { this.closeCreate(); this.router.navigate(['/licensing', key.id]); },
        error: (err) => { this.createError = err?.error?.message ?? this.t('licensing.create.failed'); },
      });
  }

  /* ---- Cancel ---- */

  confirmCancel(id: string, event: Event): void {
    event.stopPropagation();
    this.cancelTargetId = id;
    this.cancelError = '';
  }

  dismissCancel(): void { this.cancelTargetId = null; this.cancelError = ''; }

  doCancel(): void {
    if (!this.cancelTargetId) return;
    this.isCancelling = true;
    this.cancelError = '';
    this.service
      .cancel(this.cancelTargetId)
      .pipe(takeUntil(this.destroy$), finalize(() => { this.isCancelling = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: () => { this.dismissCancel(); this.load(); },
        error: (err) => { this.cancelError = err?.error?.message ?? this.t('licensing.cancelModal.failed'); },
      });
  }

  statusClass(status: LicenseKeyStatus): string {
    switch (status) {
      case 'Available':  return 'ui-badge--success';
      case 'Activated':  return 'ui-badge--info';
      case 'Expired':    return 'ui-badge--warning';
      case 'Cancelled':  return 'ui-badge--neutral';
    }
  }

  typeLabel(type: LicenseKeyType): string {
    return this.t('licensing.type' + type);
  }

  statusText(status: LicenseKeyStatus): string {
    return this.t('licensing.status' + status);
  }

  truncateKey(key: string): string {
    if (key.length <= 20) return key;
    return key.slice(0, 8) + '…' + key.slice(-8);
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
