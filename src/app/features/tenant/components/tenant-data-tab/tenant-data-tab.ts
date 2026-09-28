import { Component, Input, OnChanges, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription, timer } from 'rxjs';
import { takeUntil, finalize, switchMap } from 'rxjs/operators';
import { TenantDataService } from '../../services/tenant-data';
import {
  DataDeletionCertificateDto,
  OrganizationStorageUsageDto,
  TenantExportDto,
  TenantExportPartDto,
  formatBytes,
} from '../../../../core/models/platform-ops/platform-ops.models';
import { TranslationService } from '../../../auth/services/Translation.service';

export type TenantDataView = 'storage' | 'exports' | 'certificates';

/** Storage usage, data exports (exit plan) and deletion certificates of one organization. */
@Component({
  selector: 'app-tenant-data-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tenant-data-tab.html',
})
export class TenantDataTab implements OnChanges, OnDestroy {
  @Input({ required: true }) orgId!: string;
  @Input({ required: true }) view!: TenantDataView;

  private readonly service = inject(TenantDataService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly i18n = inject(TranslationService);
  private readonly destroy$ = new Subject<void>();
  private poll?: Subscription;
  t = (k: string) => this.i18n.translate(k);

  readonly formatBytes = formatBytes;
  isLoading = false;
  errorMessage = '';

  storage: OrganizationStorageUsageDto | null = null;
  isRefreshing = false;

  exports: TenantExportDto[] = [];
  includeAllVersions = false;
  isStarting = false;
  downloading: string | null = null;

  certificates: DataDeletionCertificateDto[] = [];
  openCertificate: DataDeletionCertificateDto | null = null;

  ngOnChanges(): void {
    this.errorMessage = '';
    this.stopPolling();
    if (this.view === 'storage') this.loadStorage();
    if (this.view === 'exports') this.loadExports();
    if (this.view === 'certificates') this.loadCertificates();
  }

  /* ---------- Storage ---------- */

  loadStorage(): void {
    this.isLoading = true;
    this.service.getStorageUsage(this.orgId)
      .pipe(takeUntil(this.destroy$), finalize(() => { this.isLoading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: (s) => { this.storage = s; },
        error: (err) => { this.errorMessage = err?.error?.message ?? this.t('tenantData.storage.loadFailed'); },
      });
  }

  refreshStorage(): void {
    this.isRefreshing = true;
    this.errorMessage = '';
    this.service.refreshStorageUsage(this.orgId)
      .pipe(takeUntil(this.destroy$), finalize(() => { this.isRefreshing = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: (s) => { this.storage = s; },
        error: (err) => { this.errorMessage = err?.error?.message ?? this.t('tenantData.storage.refreshFailed'); },
      });
  }

  share(bytes: number): number {
    const total = this.storage?.totalBytes ?? 0;
    return total > 0 ? Math.round((bytes / total) * 100) : 0;
  }

  /* ---------- Exports ---------- */

  loadExports(): void {
    this.isLoading = true;
    this.service.getExports(this.orgId)
      .pipe(takeUntil(this.destroy$), finalize(() => { this.isLoading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: (items) => { this.exports = items ?? []; this.pollWhileRunning(); },
        error: (err) => { this.errorMessage = err?.error?.message ?? this.t('tenantData.exports.loadFailed'); },
      });
  }

  get hasRunning(): boolean {
    return this.exports.some((e) => e.state === 'Running');
  }

  startExport(): void {
    this.isStarting = true;
    this.errorMessage = '';
    this.service.startExport(this.orgId, this.includeAllVersions)
      .pipe(takeUntil(this.destroy$), finalize(() => { this.isStarting = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: (e) => { this.exports = [e, ...this.exports.filter((x) => x.id !== e.id)]; this.pollWhileRunning(); },
        error: (err) => { this.errorMessage = err?.error?.message ?? this.t('tenantData.exports.startFailed'); },
      });
  }

  /** Refreshes the list every 5 seconds until no export is running. */
  private pollWhileRunning(): void {
    this.stopPolling();
    if (!this.hasRunning) return;
    this.poll = timer(5000, 5000)
      .pipe(takeUntil(this.destroy$), switchMap(() => this.service.getExports(this.orgId)))
      .subscribe({
        next: (items) => {
          this.exports = items ?? [];
          if (!this.hasRunning) this.stopPolling();
          this.cdr.markForCheck();
        },
        error: () => this.stopPolling(),
      });
  }

  private stopPolling(): void {
    this.poll?.unsubscribe();
    this.poll = undefined;
  }

  /** Signed storage link when available; otherwise the package streams through the API. */
  download(e: TenantExportDto, part: TenantExportPartDto): void {
    if (part.downloadUrl) {
      window.open(part.downloadUrl, '_blank', 'noopener');
      return;
    }
    const key = e.id + part.product;
    this.downloading = key;
    this.service.downloadExportPart(this.orgId, e.id, part.product)
      .pipe(takeUntil(this.destroy$), finalize(() => { this.downloading = null; this.cdr.markForCheck(); }))
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = part.fileName || `${part.product}-export.zip`;
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        },
        error: (err) => { this.errorMessage = err?.error?.message ?? this.t('tenantData.exports.downloadFailed'); },
      });
  }

  stateClass(state: string): string {
    switch (state) {
      case 'Completed': return 'ui-badge--success';
      case 'Running':
      case 'Queued':    return 'ui-badge--info';
      case 'Failed':    return 'ui-badge--danger';
      default:          return 'ui-badge--neutral';
    }
  }

  stateLabel(state: string): string {
    const key = 'tenantData.exports.state' + state;
    const v = this.t(key);
    return v === key ? state : v;
  }

  /* ---------- Certificates ---------- */

  loadCertificates(): void {
    this.isLoading = true;
    this.service.getDeletionCertificates(this.orgId)
      .pipe(takeUntil(this.destroy$), finalize(() => { this.isLoading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: (items) => { this.certificates = items ?? []; },
        error: (err) => { this.errorMessage = err?.error?.message ?? this.t('tenantData.certificates.loadFailed'); },
      });
  }

  formatDateTime(date: string | null | undefined): string {
    return date
      ? new Date(date).toLocaleString(this.i18n.getLocale(), { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      : '—';
  }

  ngOnDestroy(): void {
    this.stopPolling();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
