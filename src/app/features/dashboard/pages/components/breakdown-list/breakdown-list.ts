import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CountByLabel } from '../../../models/dashboard.models';
import { TranslationService } from '../../../../auth/services/Translation.service';

const PALETTE = ['#0e69d5', '#7c3aed', '#0891b2', '#059669', '#d97706', '#dc2626', '#6366f1', '#0d9488'];

@Component({
  selector: 'app-breakdown-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './breakdown-list.html',
  styleUrl: './breakdown-list.scss',
})
export class BreakdownList {
  @Input() items: CountByLabel[] = [];
  @Input() compact = false;
  @Input() emptyText = '';
  @Input() max = 6;
  private readonly i18n = inject(TranslationService);

  /** Arabic label when available and the UI is Arabic; "Unclassified" is a backend sentinel we translate. */
  label(item: CountByLabel): string {
    if (item.label === 'Unclassified') return this.i18n.translate('dashboard.insights.unclassified');
    return this.i18n.getCurrentLanguage() === 'ar' && item.labelAr ? item.labelAr : item.label;
  }

  get visible(): CountByLabel[] { return this.items.slice(0, this.max); }
  get total(): number { return this.items.reduce((s, i) => s + i.count, 0); }
  get peak(): number { return Math.max(1, ...this.items.map(i => i.count)); }

  pct(count: number): number { return Math.round((count / this.peak) * 100); }
  share(count: number): number { return this.total ? Math.round((count / this.total) * 100) : 0; }
  color(i: number): string { return PALETTE[i % PALETTE.length]; }
}
