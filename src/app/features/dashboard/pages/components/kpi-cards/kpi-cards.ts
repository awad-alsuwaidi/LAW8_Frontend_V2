import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardSummary, RevenueByCurrency } from '../../../models/dashboard.models';
import { TranslationService } from '../../../../auth/services/Translation.service';
import { Money } from '../../../../../core/ui/money/money';
import { CurrencySymbol } from '../../../../../core/ui/money/currency-symbol';

@Component({
  selector: 'app-kpi-cards',
  standalone: true,
  imports: [CommonModule, Money, CurrencySymbol],
  templateUrl: './kpi-cards.html',
  styleUrl: './kpi-cards.scss',
})
export class KpiCards {
  @Input() summary: DashboardSummary | null = null;
  private readonly i18n = inject(TranslationService);
  t = (k: string) => this.i18n.translate(k);

  get totalOrganizations(): number { return this.summary?.totalOrganizations ?? 0; }
  get newOrganizations(): number   { return this.summary?.newOrganizationsLast30Days ?? 0; }
  get activeSubscriptions(): number { return this.summary?.totalActiveSubscriptions ?? 0; }
  get atRiskCount(): number        { return this.summary?.atRiskSubscriptionsCount ?? 0; }

  /** Revenue split per currency - totalActiveRevenue is cross-currency and never shown as one figure. */
  get revenueByCurrency(): RevenueByCurrency[] { return this.summary?.revenueByCurrency ?? []; }
  get primaryRevenue(): RevenueByCurrency | null { return this.revenueByCurrency[0] ?? null; }
  get otherRevenues(): RevenueByCurrency[] { return this.revenueByCurrency.slice(1); }
}

