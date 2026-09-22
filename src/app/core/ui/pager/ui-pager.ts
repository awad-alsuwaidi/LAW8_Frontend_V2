import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslationService } from '../../../features/auth/services/Translation.service';

/** Client-side pager: page size + range label + prev/next. Pair with pageSlice() for the rows. */
@Component({
  selector: 'app-ui-pager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ui-pager.html',
  styleUrl: './ui-pager.scss',
})
export class UiPager {
  private readonly i18n = inject(TranslationService);
  t = (k: string) => this.i18n.translate(k);

  @Input({ required: true }) total = 0;
  @Input() page = 1;
  @Input() pageSize = 10;
  @Input() pageSizes: number[] = [10, 25, 50, 100];

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  get totalPages(): number { return Math.max(1, Math.ceil(this.total / this.pageSize)); }
  get from(): number { return this.total ? (this.page - 1) * this.pageSize + 1 : 0; }
  get to(): number { return Math.min(this.total, this.page * this.pageSize); }

  setSize(size: number | string): void {
    this.pageSize = Number(size);
    this.pageSizeChange.emit(this.pageSize);
    this.go(1);
  }

  prev(): void { if (this.page > 1) this.go(this.page - 1); }
  next(): void { if (this.page < this.totalPages) this.go(this.page + 1); }

  private go(p: number): void {
    this.page = p;
    this.pageChange.emit(p);
  }
}

/** Rows for the current page. */
export function pageSlice<T>(rows: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  return rows.slice(start, start + pageSize);
}

/** Newest first: by an ISO date field when present, otherwise by numeric id (auto-increment). */
export function newestFirst<T>(items: T[], date?: (x: T) => string | null | undefined): T[] {
  return [...items].sort((a, b) => {
    if (date) {
      const da = Date.parse(date(a) ?? '') || 0, db = Date.parse(date(b) ?? '') || 0;
      if (da !== db) return db - da;
    }
    const ia = (a as { id?: unknown }).id, ib = (b as { id?: unknown }).id;
    return typeof ia === 'number' && typeof ib === 'number' ? ib - ia : 0;
  });
}
