import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { TenantManagement } from '../../../services/tenant-management';
import { Organization } from '../../../../../core/models/organizations/organization.model';
import { TranslationService } from '../../../../auth/services/Translation.service';
import { UiPager, pageSlice, newestFirst } from '../../../../../core/ui/pager/ui-pager';
import { Money } from '../../../../../core/ui/money/money';
import { ProductLabelPipe } from '../../../../../core/ui/product-label.pipe';

@Component({
  selector: 'app-tenant-list',
  standalone: true,
  imports: [ProductLabelPipe, CommonModule, FormsModule, UiPager, Money],
  templateUrl: './tenant-list.html',
  styleUrl: './tenant-list.scss',
})
export class TenantList implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly tenantService = inject(TenantManagement);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();
  private readonly i18n = inject(TranslationService);
  t = (k: string) => this.i18n.translate(k);

  organizations: Organization[] = [];
  filtered: Organization[] = [];

  page = 1; pageSize = 10;
  get pagedRows() { return pageSlice(this.filtered, this.page, this.pageSize); }

  isLoading = false;
  isExporting = false;
  errorMessage = '';
  searchQuery = '';
  deploymentFilter: '' | 'Cloud' | 'OnPrem' = '';

  get readyCount(): number { return this.organizations.filter((o) => o.identityProvisioned).length; }
  /** Cloud tenants still being provisioned; on-prem installs happen on site and are never "pending". */
  get pendingSetupCount(): number { return this.organizations.filter((o) => o.deploymentType !== 'OnPrem' && !o.identityProvisioned).length; }
  countByDeployment(type: 'Cloud' | 'OnPrem'): number { return this.organizations.filter((o) => o.deploymentType === type).length; }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.tenantService
      .getAll()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (data) => {
          this.organizations = newestFirst(data, (o) => o.createdAt);
          this.applySearch();
        },
        error: (err) => {
          this.errorMessage = err?.error?.message ?? 'Failed to load organizations.';
        },
      });
  }

  applySearch(): void {
    const q = this.searchQuery.toLowerCase().trim();
    this.filtered = this.organizations.filter((o) => {
      const matchQ = !q ||
        o.nameEn.toLowerCase().includes(q) ||
        o.subdomain.toLowerCase().includes(q) ||
        o.adminEmail.toLowerCase().includes(q) ||
        o.tenantCode.toLowerCase().includes(q);
      const matchDeploy = !this.deploymentFilter || o.deploymentType === this.deploymentFilter;
      return matchQ && matchDeploy;
    });
    this.page = 1;
    this.cdr.markForCheck();
  }

  navigateTo(id: string): void {
    this.router.navigate(['/tenants', id]);
  }

  registerNew(): void {
    this.router.navigate(['/tenants', 'register']);
  }

  exportCsv(): void {
    this.isExporting = true;
    this.tenantService
      .exportCsv()
      .pipe(takeUntil(this.destroy$), finalize(() => { this.isExporting = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `organizations-${new Date().toISOString().slice(0, 10)}.csv`;
          a.click();
          URL.revokeObjectURL(url);
        },
        error: () => { this.errorMessage = 'Export failed.'; },
      });
  }



  initials(name: string): string {
    return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');
  }

  avatarColor(name: string): string {
    const palette = ['#0e69d5', '#7c3aed', '#0891b2', '#059669', '#d97706', '#dc2626', '#6366f1', '#0d9488'];
    let h = 0;
    for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return palette[h % palette.length];
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
