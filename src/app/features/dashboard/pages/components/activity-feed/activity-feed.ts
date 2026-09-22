import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditLogDto } from '../../../models/dashboard.models';
import { TranslationService } from '../../../../auth/services/Translation.service';
import { auditEntityLabel } from '../../../../audit/audit-changes.util';

@Component({
  selector: 'app-activity-feed',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activity-feed.html',
  styleUrl: './activity-feed.scss',
})
export class ActivityFeed {
  @Input() items: AuditLogDto[] = [];
  private readonly i18n = inject(TranslationService);
  t = (k: string) => this.i18n.translate(k);

  timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins  = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days  = Math.floor(diff / 86_400_000);

    if (days > 0)  return this.t('dashboard.feed.daysAgo').replace('{{n}}', String(days));
    if (hours > 0) return this.t('dashboard.feed.hoursAgo').replace('{{n}}', String(hours));
    if (mins > 0)  return this.t('dashboard.feed.minsAgo').replace('{{n}}', String(mins));
    return this.t('dashboard.feed.justNow');
  }

  /** Entity CLR name → UI language (shared with the audit pages). */
  entityLabel(entityName: string): string {
    return auditEntityLabel(entityName, this.t);
  }

  actionLabel(action: string): string {
    const key = 'dashboard.feed.action' + action;
    const v = this.t(key);
    return v === key ? action : v;
  }

  iconClass(action: string): string {
    const map: Record<string, string> = {
      Created:     'feed-icon--green',
      Updated:     'feed-icon--blue',
      Deleted:     'feed-icon--red',
      Suspended:   'feed-icon--amber',
      Reactivated: 'feed-icon--blue',
      Cancelled:   'feed-icon--gray',
    };
    return map[action] ?? 'feed-icon--gray';
  }
}
