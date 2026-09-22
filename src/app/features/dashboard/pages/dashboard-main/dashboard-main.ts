import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { DashboardService } from '../../services/dashboard';
import { DashboardSummary, CountByLabel } from '../../models/dashboard.models';
import { KpiCards } from '../components/kpi-cards/kpi-cards';
import { AtRiskSubscriptions } from '../components/at-risk-subscriptions/at-risk-subscriptions';
import { ActivityFeed } from '../components/activity-feed/activity-feed';
import { SubscriptionsChart } from '../components/subscriptions-chart/subscriptions-chart';
import { BreakdownList } from '../components/breakdown-list/breakdown-list';
import { TranslationService } from '../../../auth/services/Translation.service';
import { TenantManagement } from '../../../tenant/services/tenant-management';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-dashboard-main',
  standalone: true,
  imports: [CommonModule, KpiCards, AtRiskSubscriptions, ActivityFeed, SubscriptionsChart, BreakdownList],
  templateUrl: './dashboard-main.html',
  styleUrl: './dashboard-main.scss',
})
export class DashboardMain implements OnInit, OnDestroy {
  private readonly dashboardService = inject(DashboardService);
  private readonly tenantService = inject(TenantManagement);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();
  private readonly i18n = inject(TranslationService);
  private readonly auth = inject(AuthService);
  t = (k: string) => this.i18n.translate(k);

  readonly user = toSignal(this.auth.currentUser$, { initialValue: null });

  /** First name in the UI language for the hero greeting. */
  get firstName(): string {
    const u = this.user();
    if (!u) return '';
    const isAr = this.i18n.getCurrentLanguage() === 'ar';
    const ar = (u.nameAr ?? '').trim(), en = (u.nameEn ?? '').trim();
    const full = isAr ? (ar || en) : (en || ar);
    return full.split(/\s+/)[0] ?? '';
  }

  get greeting(): string {
    const h = this.today.getHours();
    return this.t(h < 12 ? 'dashboard.hero.morning' : h < 17 ? 'dashboard.hero.afternoon' : 'dashboard.hero.evening');
  }

  get todayLabel(): string {
    const locale = this.i18n.getCurrentLanguage() === 'ar' ? 'ar-u-nu-latn' : 'en-GB';
    return this.today.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  /** Local label helper for enum-keyed groups (Cloud / OnPrem). */
  deploymentLabel(label: string): string {
    return this.t(label === 'Cloud' ? 'dashboard.insights.cloud' : 'dashboard.insights.onPrem');
  }

  readonly summary = signal<DashboardSummary | null>(null);
  readonly loading = signal(true);
  readonly exporting = signal(false);
  readonly error = signal<string | null>(null);

  readonly today = new Date();

  readonly byStatus  = computed<CountByLabel[]>(() => this.summary()?.subscriptionsByStatus ?? []);
  readonly byProduct = computed<CountByLabel[]>(() => this.sorted(this.summary()?.subscriptionsByProduct));
  readonly byOrgType = computed<CountByLabel[]>(() => this.sorted(this.summary()?.organizationsByType));
  readonly byDeployment = computed<CountByLabel[]>(() => this.summary()?.organizationsByDeploymentType ?? []);
  readonly totalOrgs = computed(() => this.summary()?.totalOrganizations ?? 0);

  deploymentPct(label: string): number {
    const total = this.byDeployment().reduce((s, d) => s + d.count, 0);
    const item = this.byDeployment().find(d => d.label === label);
    return total && item ? Math.round((item.count / total) * 100) : 0;
  }

  deploymentCount(label: string): number {
    return this.byDeployment().find(d => d.label === label)?.count ?? 0;
  }

  ngOnInit(): void {
    this.load();
  }

  newTenant(): void {
    this.router.navigate(['/tenants/register']);
  }

  exportReport(): void {
    this.exporting.set(true);
    this.tenantService
      .exportCsv()
      .pipe(takeUntil(this.destroy$), finalize(() => this.exporting.set(false)))
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `organizations-${this.today.toISOString().slice(0, 10)}.csv`;
          a.click();
          URL.revokeObjectURL(url);
        },
        error: () => this.error.set(this.t('dashboard.exportFailed')),
      });
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.dashboardService
      .getSummary()
      .pipe(takeUntil(this.destroy$), finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => this.summary.set(data),
        error: () => this.error.set(this.t('dashboard.loadFailed')),
      });
  }

  private sorted(list?: CountByLabel[]): CountByLabel[] {
    return [...(list ?? [])].sort((a, b) => b.count - a.count);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
