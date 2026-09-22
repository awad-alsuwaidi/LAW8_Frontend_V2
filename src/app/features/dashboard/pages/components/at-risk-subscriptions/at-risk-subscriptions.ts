import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AtRiskSubscriptionDto } from '../../../models/dashboard.models';
import { TranslationService } from '../../../../auth/services/Translation.service';

@Component({
  selector: 'app-at-risk-subscriptions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './at-risk-subscriptions.html',
  styleUrl: './at-risk-subscriptions.scss',
})
export class AtRiskSubscriptions {
  @Input() items: AtRiskSubscriptionDto[] = [];
  private readonly router = inject(Router);
  private readonly i18n = inject(TranslationService);
  t = (k: string) => this.i18n.translate(k);

  viewAll(): void {
    this.router.navigate(['/subscriptions']);
  }

  statusLabel(item: AtRiskSubscriptionDto): string {
    if (item.daysLeft < 0) {
      return this.t('dashboard.atRisk.expiredDays').replace('{{count}}', String(Math.abs(item.daysLeft)));
    }
    if (item.daysLeft === 0) return this.t('dashboard.atRisk.expiresToday');
    return this.t('dashboard.atRisk.daysLeft').replace('{{count}}', String(item.daysLeft));
  }

  statusClass(item: AtRiskSubscriptionDto): string {
    if (item.daysLeft < 0)   return 'chip chip--expired';
    if (item.daysLeft <= 7)  return 'chip chip--critical';
    if (item.daysLeft <= 14) return 'chip chip--warning';
    return 'chip chip--notice';
  }

  formatDate(dateStr: string): string {
    const locale = this.i18n.getCurrentLanguage() === 'ar' ? 'ar-EG' : 'en-US';
    return new Date(dateStr).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
