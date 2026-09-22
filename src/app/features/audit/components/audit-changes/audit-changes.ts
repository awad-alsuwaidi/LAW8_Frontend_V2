import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditLogDto } from '../../services/audit';
import { AuditChange, auditChangesSummary, auditEntityLabel, parseAuditChanges } from '../../audit-changes.util';
import { TranslationService } from '../../../auth/services/Translation.service';

/** "Changes" cell for an audit row: summary, field chips, and a hover popover with before/after. Popover is fixed so the table can't clip it. */
@Component({
  selector: 'app-audit-changes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audit-changes.html',
  styleUrl: './audit-changes.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuditChanges {
  private readonly i18n = inject(TranslationService);
  private readonly cdr = inject(ChangeDetectorRef);
  t = (k: string) => this.i18n.translate(k);

  @Input({ required: true }) set log(value: AuditLogDto) {
    this._log = value;
    this.changes = parseAuditChanges(value.changes, { t: this.t, formatDateTime: (d) => this.formatDateTime(d) });
  }
  get log(): AuditLogDto { return this._log; }
  private _log!: AuditLogDto;

  /** Chips shown inline before collapsing to "+n". */
  @Input() maxChips = 3;

  changes: AuditChange[] = [];
  open = false;
  popTop = 0;
  popLeft = 0;

  get summary(): string { return auditChangesSummary(this.log, this.changes, this.t); }
  get entityLabel(): string { return auditEntityLabel(this.log.entityName, this.t); }
  get chipFields(): string[] { return this.changes.slice(0, this.maxChips).map((c) => c.label); }
  get extraCount(): number { return Math.max(0, this.changes.length - this.maxChips); }

  actionClass(action: string): string {
    switch (action) {
      case 'Created': return 'ui-badge--success';
      case 'Updated': return 'ui-badge--info';
      case 'Deleted': return 'ui-badge--danger';
      default: return 'ui-badge--neutral';
    }
  }

  show(event: MouseEvent): void {
    if (this.changes.length === 0) return;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const width = 380;
    const isRtl = document.documentElement.dir === 'rtl';
    const preferred = isRtl ? rect.right - width : rect.left;
    this.popTop = rect.bottom + 6;
    // keep it inside the viewport
    this.popLeft = Math.max(8, Math.min(preferred, window.innerWidth - width - 8));
    this.open = true;
    this.cdr.markForCheck();
  }

  hide(): void {
    this.open = false;
    this.cdr.markForCheck();
  }

  private formatDateTime(date: string): string {
    return new Date(date).toLocaleString(this.i18n.getCurrentLanguage() === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  }
}
