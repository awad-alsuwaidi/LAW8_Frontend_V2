import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocalNamePipe } from '../../../../../core/ui/local-name.pipe';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { OrgTypesService } from '../../../services/org-types';
import { OrgTypeDto, SaveOrgTypeDto } from '../../../../../core/models/setup/setup.models';
import { TranslationService } from '../../../../auth/services/Translation.service';
import { UiPager, pageSlice, newestFirst } from '../../../../../core/ui/pager/ui-pager';

@Component({
  selector: 'app-org-types-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UiPager, LocalNamePipe],
  templateUrl: './org-types-list.html',
  styleUrl: './org-types-list.scss',
})
export class OrgTypesList implements OnInit, OnDestroy {
  private readonly service  = inject(OrgTypesService);
  private readonly fb       = inject(FormBuilder);
  private readonly cdr      = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();
  private readonly i18n     = inject(TranslationService);
  t = (k: string) => this.i18n.translate(k);

  orgTypes:     OrgTypeDto[] = [];
  isLoading     = false;
  errorMessage  = '';

  showModal    = false;
  isSaving     = false;
  editingItem: OrgTypeDto | null = null;
  deleteTarget: OrgTypeDto | null = null;
  isDeleting   = false;

  page = 1;
  pageSize = 10;
  get pagedRows(): OrgTypeDto[] { return pageSlice(this.orgTypes, this.page, this.pageSize); }

  form = this.fb.group({
    nameAr:      ['', [Validators.maxLength(100)]],
    nameEn:      ['', [Validators.required, Validators.maxLength(100)]],
    description: [''],
    isActive:    [true],
  });

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading   = true;
    this.errorMessage = '';
    this.service.getAll()
      .pipe(takeUntil(this.destroy$), finalize(() => { this.isLoading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next:  items => { this.orgTypes = newestFirst(items); this.page = 1; },
        error: (err: any) => { this.errorMessage = err?.error?.message ?? 'Failed to load organization types.'; },
      });
  }

  openCreate(): void {
    this.editingItem = null;
    this.form.reset({ nameAr: '', nameEn: '', description: '', isActive: true });
    this.showModal = true;
  }

  openEdit(item: OrgTypeDto, event: Event): void {
    event.stopPropagation();
    this.editingItem = item;
    this.form.patchValue({ nameAr: item.nameAr ?? '', nameEn: item.nameEn, description: item.description ?? '', isActive: item.isActive });
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; this.form.reset(); this.errorMessage = ''; }

  saveModal(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isSaving = true;
    const v = this.form.getRawValue();
    const dto: SaveOrgTypeDto = {
      code:        this.editingItem ? this.editingItem.code : this.toCode(v.nameEn!),
      nameEn:      v.nameEn!.trim(),
      nameAr:      v.nameAr?.trim() || undefined,
      isActive:    v.isActive ?? true,
      description: v.description?.trim() || undefined,
    };

    const obs = this.editingItem
      ? this.service.update(this.editingItem.id, dto)
      : this.service.create(dto);

    obs.pipe(takeUntil(this.destroy$), finalize(() => { this.isSaving = false; this.cdr.markForCheck(); }))
      .subscribe({
        next:  () => { this.closeModal(); this.load(); },
        error: (err: any) => { this.errorMessage = err?.error?.message ?? 'Save failed.'; this.isSaving = false; this.cdr.markForCheck(); },
      });
  }

  confirmDelete(item: OrgTypeDto, event: Event): void {
    event.stopPropagation();
    this.deleteTarget = item;
  }

  cancelDelete(): void { this.deleteTarget = null; }

  doDelete(): void {
    if (!this.deleteTarget) return;
    this.isDeleting = true;
    this.service.delete(this.deleteTarget.id)
      .pipe(takeUntil(this.destroy$), finalize(() => { this.isDeleting = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: () => {
          this.orgTypes    = this.orgTypes.filter(o => o.id !== this.deleteTarget!.id);
          this.deleteTarget = null;
          // Clamp the page in case the last row of the final page was removed
          const maxPage = Math.max(1, Math.ceil(this.orgTypes.length / this.pageSize));
          if (this.page > maxPage) this.page = maxPage;
        },
        error: (err: any) => {
          this.errorMessage = err?.error?.message ?? 'Delete failed.';
          this.deleteTarget = null;
        },
      });
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c?.touched);
  }

  private toCode(name: string): string {
    return name.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
