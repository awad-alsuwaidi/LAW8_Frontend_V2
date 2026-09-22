import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocalNamePipe } from '../../../../../core/ui/local-name.pipe';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { RegionsService } from '../../../services/regions';
import { RegionDto } from '../../../../../core/models/setup/setup.models';
import { TranslationService } from '../../../../auth/services/Translation.service';
import { UiPager, pageSlice, newestFirst } from '../../../../../core/ui/pager/ui-pager';

@Component({
  selector: 'app-region-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, UiPager, LocalNamePipe],
  templateUrl: './region-list.html',
  styleUrl: './region-list.scss',
})
export class RegionList implements OnInit, OnDestroy {
  private readonly service = inject(RegionsService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();
  private readonly i18n = inject(TranslationService);
  t = (k: string) => this.i18n.translate(k);

  regions: RegionDto[] = [];
  isLoading = false;
  errorMessage = '';
  searchQuery = '';

  page = 1;
  pageSize = 10;
  get pagedRows(): RegionDto[] { return pageSlice(this.filtered, this.page, this.pageSize); }

  // Add / edit modal state
  showModal = false;
  isSaving = false;
  editingItem: RegionDto | null = null;

  deleteTarget: RegionDto | null = null;
  isDeleting = false;

  form = this.fb.group({
    code:     ['', [Validators.required, Validators.maxLength(10)]],
    nameEn:   ['', [Validators.required, Validators.maxLength(100)]],
    nameAr:   ['', [Validators.maxLength(100)]],
    isActive: [true],
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.service.getAll()
      .pipe(takeUntil(this.destroy$), finalize(() => { this.isLoading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: items => { this.regions = newestFirst(items); this.page = 1; },
        error: (err: any) => { this.errorMessage = err?.error?.message ?? 'Failed to load regions.'; },
      });
  }

  get filtered(): RegionDto[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.regions;
    return this.regions.filter(r =>
      r.nameEn.toLowerCase().includes(q) ||
      (r.nameAr?.toLowerCase().includes(q) ?? false) ||
      r.code.toLowerCase().includes(q)
    );
  }

  get activeCount(): number { return this.regions.filter(r => r.isActive).length; }
  get inactiveCount(): number { return this.regions.filter(r => !r.isActive).length; }

  openCreate(): void {
    this.editingItem = null;
    this.errorMessage = '';
    this.form.reset({ code: '', nameEn: '', nameAr: '', isActive: true });
    this.showModal = true;
  }

  openEdit(item: RegionDto, event: Event): void {
    event.stopPropagation();
    this.editingItem = item;
    this.errorMessage = '';
    this.form.patchValue({ code: item.code, nameEn: item.nameEn, nameAr: item.nameAr ?? '', isActive: item.isActive });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingItem = null;
    this.form.reset({ code: '', nameEn: '', nameAr: '', isActive: true });
    this.errorMessage = '';
  }

  saveModal(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isSaving = true;
    this.errorMessage = '';
    const v = this.form.getRawValue();
    const dto = { code: v.code!, nameEn: v.nameEn!, nameAr: v.nameAr || undefined, isActive: v.isActive! };

    const obs = this.editingItem
      ? this.service.update(this.editingItem.id, dto)
      : this.service.create(dto);

    obs.pipe(takeUntil(this.destroy$), finalize(() => { this.isSaving = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: () => { this.closeModal(); this.load(); },
        error: (err: any) => { this.errorMessage = err?.error?.message ?? 'Save failed.'; },
      });
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c?.touched);
  }

  confirmDelete(region: RegionDto, event: Event): void {
    event.stopPropagation();
    this.deleteTarget = region;
  }

  cancelDelete(): void { this.deleteTarget = null; }

  doDelete(): void {
    if (!this.deleteTarget) return;
    this.isDeleting = true;
    this.service.delete(this.deleteTarget.id)
      .pipe(takeUntil(this.destroy$), finalize(() => { this.isDeleting = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: () => {
          this.regions = this.regions.filter(r => r.id !== this.deleteTarget!.id);
          this.deleteTarget = null;
        },
        error: (err: any) => {
          this.errorMessage = err?.error?.message ?? 'Delete failed.';
          this.deleteTarget = null;
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
