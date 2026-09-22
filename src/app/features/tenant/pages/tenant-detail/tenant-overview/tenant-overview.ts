import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { TenantManagement } from '../../../services/tenant-management';
import { SubscriptionsService } from '../../../../../features/subscriptions/services/subscription-detail';
import { Organization } from '../../../../../core/models/organizations/organization.model';
import { SubscriptionDetailDto } from '../../../../../core/models/subscription/subscription.models';
import { AuditService, AuditLogDto } from '../../../../../features/audit/services/audit';
import { ProvisioningStatus } from '../../../../../core/models/organizations/provisioning-status.model';
import { TranslationService } from '../../../../auth/services/Translation.service';
import { PositiveIntegerDirective } from '../../../../../core/validators/positive-integer.directive';
import { coercePositiveInteger } from '../../../../../core/validators/common.validators';
import { UiPager, pageSlice } from '../../../../../core/ui/pager/ui-pager';
import { AuditChanges } from '../../../../audit/components/audit-changes/audit-changes';
import { auditEntityLabel } from '../../../../audit/audit-changes.util';
import { Money } from '../../../../../core/ui/money/money';
import { CurrencySymbol } from '../../../../../core/ui/money/currency-symbol';
import { ProductLabelPipe } from '../../../../../core/ui/product-label.pipe';

const SUB_COLORS = ['#3162f1', '#7c3aed', '#0891b2', '#059669', '#d97706', '#dc2626', '#6366f1', '#0d9488'];

type TabId = 'overview' | 'subscriptions' | 'auditlogs';

@Component({
  selector: 'app-tenant-overview',
  standalone: true,
  imports: [ProductLabelPipe, CurrencySymbol, CommonModule, FormsModule, RouterLink, PositiveIntegerDirective, UiPager, Money, AuditChanges],
  templateUrl: './tenant-overview.html',
  styleUrl: './tenant-overview.scss',
})
export class TenantOverview implements OnInit, OnDestroy {
  private readonly route         = inject(ActivatedRoute);
  private readonly router        = inject(Router);
  private readonly tenantService = inject(TenantManagement);
  private readonly subsSvc       = inject(SubscriptionsService);
  private readonly auditSvc      = inject(AuditService);
  private readonly cdr           = inject(ChangeDetectorRef);
  private readonly i18n          = inject(TranslationService);
  private readonly destroy$      = new Subject<void>();
  t = (k: string) => this.i18n.translate(k);

  org: Organization | null = null;
  orgId = '';
  isLoading = false;
  errorMessage = '';
  actionLoading = false;
  actionMessage = '';
  actionError = '';

  tab: TabId = 'overview';

  /* ---- Subscriptions ---- */
  subscriptions: SubscriptionDetailDto[] = [];
  isLoadingSubs = false;
  subsError = '';

  /* ---- Provisioning ---- */
  provisioning: ProvisioningStatus | null = null;

  get provisioningHealthy(): boolean {
    return !!this.provisioning?.allProvisioned;
  }

  get provisioningIssues(): string[] {
    if (!this.provisioning) return [];
    const issues: string[] = [];
    if (!this.provisioning.identityProvisioned) {
      const err = this.provisioning.identityProvisioningError;
      issues.push(this.t('tenants.overview.provisioning.identity') + (err ? ': ' + err : ''));
    }
    for (const p of this.provisioning.products) {
      if (!p.databaseProvisioned) issues.push(p.productCode + (p.provisioningError ? ': ' + p.provisioningError : ''));
    }
    return issues;
  }

  /* ---- Audit Logs ---- */
  auditLogs: AuditLogDto[] = [];
  isLoadingAudit = false;
  auditError = '';
  auditPage = 1;
  auditPageSize = 10;

  get pagedAuditLogs(): AuditLogDto[] { return pageSlice(this.auditLogs, this.auditPage, this.auditPageSize); }

  /** Arabic value when the UI is Arabic and it exists, else the English one. */
  pick(en?: string | null, ar?: string | null): string {
    return (this.i18n.getCurrentLanguage() === 'ar' && ar) ? ar : (en ?? '');
  }

  auditEntityLabel(entityName: string): string {
    return auditEntityLabel(entityName, this.t);
  }

  auditClass(action: string): string {
    const map: Record<string, string> = {
      Created: 'ui-badge--success', Updated: 'ui-badge--info', Deleted: 'ui-badge--danger',
      Suspended: 'ui-badge--warning', Reactivated: 'ui-badge--info', Cancelled: 'ui-badge--neutral',
    };
    return map[action] ?? 'ui-badge--neutral';
  }

  /* ---- Suspend / Reactivate subscription ---- */
  suspendTarget: SubscriptionDetailDto | null = null;
  suspendReason = '';
  isSuspending = false;
  suspendError = '';

  openSuspend(sub: SubscriptionDetailDto, event: Event): void {
    event.stopPropagation();
    this.suspendTarget = sub;
    this.suspendReason = '';
    this.suspendError = '';
  }

  closeSuspend(): void { this.suspendTarget = null; this.suspendReason = ''; this.suspendError = ''; }

  doSuspend(): void {
    if (!this.suspendTarget) return;
    this.isSuspending = true;
    this.suspendError = '';
    this.subsSvc
      .suspend(this.suspendTarget.id, { reason: this.suspendReason || undefined })
      .pipe(takeUntil(this.destroy$), finalize(() => { this.isSuspending = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: () => { this.closeSuspend(); this.loadSubscriptions(); },
        error: (err: any) => { this.suspendError = err?.error?.message ?? this.t('tenants.overview.suspendModal.failed'); },
      });
  }

  doReactivate(sub: SubscriptionDetailDto, event: Event): void {
    event.stopPropagation();
    this.subsSvc
      .reactivate(sub.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.loadSubscriptions(),
        error: (err: any) => { this.actionError = err?.error?.message ?? this.t('tenants.overview.suspendModal.reactivateFailed'); this.cdr.markForCheck(); },
      });
  }

  /* ---- Add Seats modal ---- */
  showSeatsModal = false;
  seatsTarget: SubscriptionDetailDto | null = null;
  seatsToAdd = 1;
  isSavingSeats = false;
  seatsError = '';

  onSeatsInput(value: unknown): void {
    this.seatsToAdd = coercePositiveInteger(value);
  }

  get priceImpact(): number {
    const n = Math.max(0, Math.floor(this.seatsToAdd || 0));
    return n * (this.seatsTarget?.pricePerAdditionalUser ?? 0);
  }

  /* ---- License key ---- */
  keyCopied = false;

  copyLicenseKey(): void {
    const key = this.org?.licenseKey;
    if (!key) return;
    navigator.clipboard?.writeText(key).then(() => {
      this.keyCopied = true;
      this.cdr.markForCheck();
      setTimeout(() => { this.keyCopied = false; this.cdr.markForCheck(); }, 1800);
    });
  }

  /* ---- Reset password ---- */
  resetPassword = '';
  showResetPassword = false;

  /** Shown as a badge on the attachments tab; null until loaded (or if the call fails). */
  attachmentCount: number | null = null;

  ngOnInit(): void {
    this.orgId = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.orgId) {
      this.load();
      this.loadSubscriptions();
      this.loadProvisioning();
      this.loadAttachmentCount();
    }
  }

  private loadAttachmentCount(): void {
    this.tenantService
      .getAttachments(this.orgId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (list) => { this.attachmentCount = list.length; this.cdr.markForCheck(); },
        error: () => { this.attachmentCount = null; },
      });
  }

  load(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.tenantService
      .getById(this.orgId)
      .pipe(takeUntil(this.destroy$), finalize(() => { this.isLoading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: (data) => { this.org = data; },
        error: (err: any) => { this.errorMessage = err?.error?.message ?? this.t('tenants.overview.loadFailed'); },
      });
  }

  loadSubscriptions(): void {
    this.isLoadingSubs = true;
    this.subsError = '';
    this.subsSvc
      .getByOrganization(this.orgId)
      .pipe(takeUntil(this.destroy$), finalize(() => { this.isLoadingSubs = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: (data) => { this.subscriptions = data ?? []; },
        error: (err: any) => { this.subsError = err?.error?.message ?? this.t('tenants.overview.subsLoadFailed'); },
      });
  }

  loadProvisioning(): void {
    this.tenantService
      .getProvisioningStatus(this.orgId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (s) => { this.provisioning = s; this.cdr.markForCheck(); },
        error: () => { this.provisioning = null; },
      });
  }

  loadAuditLogs(): void {
    if (this.auditLogs.length || this.isLoadingAudit) return;
    this.isLoadingAudit = true;
    this.auditError = '';
    this.auditSvc
      .getByEntity('Organization', this.orgId)
      .pipe(takeUntil(this.destroy$), finalize(() => { this.isLoadingAudit = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: (data) => { this.auditLogs = data ?? []; this.auditPage = 1; },
        error: (err: any) => { this.auditError = err?.error?.message ?? this.t('tenants.overview.auditLoadFailed'); },
      });
  }

  setTab(t: TabId): void {
    this.tab = t;
    if (t === 'auditlogs') this.loadAuditLogs();
  }

  /* ---- Add Seats ---- */

  openManageSeats(sub: SubscriptionDetailDto, event: Event): void {
    event.stopPropagation();
    this.seatsTarget = sub;
    this.seatsToAdd = 1;
    this.seatsError = '';
    this.showSeatsModal = true;
  }

  closeSeatsModal(): void { this.showSeatsModal = false; this.seatsTarget = null; this.seatsError = ''; }

  saveSeats(): void {
    const count = Math.floor(this.seatsToAdd || 0);
    if (!this.seatsTarget || count < 1 || !this.seatsTarget.pricePerAdditionalUser) return;

    this.isSavingSeats = true;
    this.seatsError = '';
    this.subsSvc
      .addUsers(this.seatsTarget.id, { count })
      .pipe(takeUntil(this.destroy$), finalize(() => { this.isSavingSeats = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: () => { this.closeSeatsModal(); this.loadSubscriptions(); },
        error: (err: any) => { this.seatsError = err?.error?.message ?? this.t('tenants.overview.seatsModal.failed'); },
      });
  }

  /* ---- Actions ---- */

  back(): void { this.router.navigate(['/tenants', 'directory']); }

  edit(): void { this.router.navigate(['/tenants', this.orgId, 'edit']); }

  retryProvisioning(): void {
    if (this.provisioningHealthy) return;
    this.runAction(
      () => this.tenantService.retryProvisioning(this.orgId),
      this.t('tenants.overview.retryTriggered'),
      () => { this.load(); this.loadSubscriptions(); this.loadProvisioning(); }
    );
  }

  doResetAdminPassword(): void {
    this.actionLoading = true;
    this.actionError = '';
    this.resetPassword = '';
    this.tenantService
      .resetAdminPassword(this.orgId)
      .pipe(takeUntil(this.destroy$), finalize(() => { this.actionLoading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: (pwd) => { this.resetPassword = pwd; this.showResetPassword = true; },
        error: (err: any) => { this.actionError = err?.error?.message ?? this.t('tenants.overview.actionFailed'); },
      });
  }

  private runAction(
    action: () => import('rxjs').Observable<void>,
    successMsg: string,
    onSuccess?: () => void
  ): void {
    this.actionLoading = true;
    this.actionMessage = '';
    this.actionError = '';
    action()
      .pipe(takeUntil(this.destroy$), finalize(() => { this.actionLoading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: () => { this.actionMessage = successMsg; if (onSuccess) { onSuccess(); } else { this.load(); } },
        error: (err: any) => { this.actionError = err?.error?.message ?? this.t('tenants.overview.actionFailed'); },
      });
  }

  /* ---- Helpers ---- */

  getInitials(name?: string): string {
    if (!name) return '?';
    return name.trim().split(/\s+/).slice(0, 2).map(w => w[0].toUpperCase()).join('');
  }

  subColor(index: number): string { return SUB_COLORS[index % SUB_COLORS.length]; }

  billingLabel(cycle: string): string {
    switch (cycle) {
      case 'Yearly':    return this.t('tenants.overview.billedAnnually');
      case 'Monthly':   return this.t('tenants.overview.billedMonthly');
      case 'Quarterly': return this.t('tenants.overview.billedQuarterly');
      default:          return '';
    }
  }

  deployLabel(type: string): string {
    return type === 'Cloud' ? this.t('tenants.deployCloud') : this.t('tenants.deployOnPrem');
  }

  statusLabel(status: string): string {
    return this.t('tenants.status' + status);
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      Active: 'ui-badge--success',
      Suspended: 'ui-badge--warning',
      Cancelled: 'ui-badge--danger',
      Pending: 'ui-badge--neutral',
    };
    return map[status] ?? 'ui-badge--neutral';
  }

  /** Billing-cycle suffix shown after the price (the amount itself is formatted by the money pipe). */
  cycleSuffix(sub: SubscriptionDetailDto): string {
    const key = 'subscriptions.suffix' + sub.billingCycle;
    const v = this.t(key);
    return v === key ? '' : v;
  }

  progressPct(current: number, max: number): number {
    if (!max || max === 0) return 0;
    return Math.min(100, Math.round((current / max) * 100));
  }

  activeSubscriptions(): SubscriptionDetailDto[] {
    return this.subscriptions.filter(s => s.status === 'Active');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
