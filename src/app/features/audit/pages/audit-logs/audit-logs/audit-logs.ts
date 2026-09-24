import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { AuditService, AuditLogDto, AuditActionType } from '../../../services/audit';
import { TranslationService } from '../../../../auth/services/Translation.service';
import { UiPager, pageSlice } from '../../../../../core/ui/pager/ui-pager';
import { AuditChanges } from '../../../components/audit-changes/audit-changes';
import { AuditChange, auditEntityLabel, parseAuditChanges } from '../../../audit-changes.util';

// Every audited entity in Tenancy (the interceptor logs all auditable entities).
const ENTITY_NAMES = [
  'Organization', 'OrganizationAttachment', 'Subscription',
  'LicenseKey', 'LicenseActivation', 'LicenseRenewal', 'LicenseReleaseAudit',
  'Product', 'Feature', 'OrganizationType', 'Region', 'Country', 'Currency',
  'Permission', 'RolePermissions',
];


@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, UiPager, AuditChanges],
  templateUrl: './audit-logs.html',
  styleUrl: './audit-logs.scss',
})
export class AuditLogs implements OnInit, OnDestroy {
  private readonly service = inject(AuditService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();
  private readonly i18n = inject(TranslationService);
  t = (k: string) => this.i18n.translate(k);

  readonly entityNames = ENTITY_NAMES;

  items: AuditLogDto[] = [];
  filtered: AuditLogDto[] = [];

  page = 1; pageSize = 10;
  get pagedRows() { return pageSlice(this.filtered, this.page, this.pageSize); }

  isLoading = false;
  errorMessage = '';
  entityFilter = '';
  searchQuery = '';

  private readonly changesCache = new Map<string, AuditChange[]>();

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.service
      .getAll(this.entityFilter || undefined)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => { this.isLoading = false; this.cdr.markForCheck(); })
      )
      .subscribe({
        next: (items) => {
          this.items = items;
          this.applySearch();
        },
        error: (err) => {
          this.errorMessage = err?.error?.message ?? this.t('audit.loadFailed');
        },
      });
  }

  onEntityFilterChange(): void {
    this.load();
  }

  applySearch(): void {
    const q = this.searchQuery.toLowerCase().trim();
    this.filtered = q
      ? this.items.filter(
          (l) =>
            this.entityLabel(l.entityName).toLowerCase().includes(q) ||
            (l.changedBy ?? '').toLowerCase().includes(q) ||
            this.changesOf(l).some((c) =>
              c.label.toLowerCase().includes(q) ||
              c.oldValue.toLowerCase().includes(q) ||
              c.newValue.toLowerCase().includes(q))
        )
      : [...this.items];
    this.page = 1;
    this.cdr.markForCheck();
  }

  /** Entity name in the UI language (shared with the changes component). */
  entityLabel(entityName: string): string {
    return auditEntityLabel(entityName, this.t);
  }

  /** Parsed change list for a row - memoised so search stays cheap. */
  private changesOf(log: AuditLogDto): AuditChange[] {
    const cached = this.changesCache.get(log.id);
    if (cached) return cached;
    const parsed = parseAuditChanges(log.changes, { t: this.t, formatDateTime: (d) => this.formatDateTime(d) });
    this.changesCache.set(log.id, parsed);
    return parsed;
  }

  formatDateTime(date: string): string {
    return new Date(date).toLocaleString(this.i18n.getLocale(), {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  actionClass(action: AuditActionType): string {
    switch (action) {
      case 'Created': return 'ui-badge--success';
      case 'Updated': return 'ui-badge--info';
      case 'Deleted': return 'ui-badge--danger';
    }
  }

  countBy(action: AuditActionType): number {
    return this.items.filter((l) => l.action === action).length;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
