import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocalNamePipe } from '../../../../../core/ui/local-name.pipe';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { ProductsService } from '../../../services/products';
import { ProductDto, SaveProductDto, sortProducts } from '../../../../../core/models/setup/setup.models';
import { TranslationService } from '../../../../auth/services/Translation.service';
import { UiPager, pageSlice } from '../../../../../core/ui/pager/ui-pager';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, UiPager, LocalNamePipe],
  templateUrl: './products-list.html',
  styleUrl: './products-list.scss',
})
export class ProductsList implements OnInit, OnDestroy {
  private readonly service = inject(ProductsService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();
  private readonly i18n = inject(TranslationService);
  t = (k: string) => this.i18n.translate(k);

  products: ProductDto[] = [];
  isLoading = false;
  errorMessage = '';
  searchQuery = '';

  page = 1;
  pageSize = 10;
  get pagedRows(): ProductDto[] { return pageSlice(this.filtered, this.page, this.pageSize); }

  showModal = false;
  isSaving = false;
  editingItem: ProductDto | null = null;
  deleteTarget: ProductDto | null = null;
  isDeleting = false;

  form = this.fb.group({
    code:            ['', [Validators.required, Validators.maxLength(20)]],
    nameEn:          ['', [Validators.required, Validators.maxLength(100)]],
    nameAr:          ['', [Validators.maxLength(100)]],
    description:     [''],
    isProvisionable: [false],
    provisioningKey: ['', [Validators.maxLength(100)]],
    isActive:        [true],
  });

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.service.getAll()
      .pipe(takeUntil(this.destroy$), finalize(() => { this.isLoading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: items => { this.products = sortProducts(items); this.page = 1; },
        error: (err: any) => { this.errorMessage = err?.error?.message ?? 'Failed to load products.'; },
      });
  }

  get filtered(): ProductDto[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.products;
    return this.products.filter(p =>
      p.nameEn.toLowerCase().includes(q) ||
      (p.nameAr?.toLowerCase().includes(q) ?? false) ||
      p.code.toLowerCase().includes(q)
    );
  }

  get activeCount(): number { return this.products.filter(p => p.isActive).length; }
  get provisionableCount(): number { return this.products.filter(p => p.isProvisionable).length; }

  openCreate(): void {
    this.editingItem = null;
    this.form.reset({ code: '', nameEn: '', nameAr: '', description: '', isProvisionable: false, provisioningKey: '', isActive: true });
    this.showModal = true;
  }

  openEdit(item: ProductDto, event: Event): void {
    event.stopPropagation();
    this.editingItem = item;
    this.form.patchValue({ code: item.code, nameEn: item.nameEn, nameAr: item.nameAr ?? '', description: item.description ?? '', isProvisionable: item.isProvisionable, provisioningKey: item.provisioningKey ?? '', isActive: item.isActive });
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; this.form.reset(); }

  saveModal(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isSaving = true;
    const v = this.form.getRawValue();
    const dto: SaveProductDto = { code: v.code!, nameEn: v.nameEn!, nameAr: v.nameAr || undefined, description: v.description || undefined, isProvisionable: v.isProvisionable!, provisioningKey: v.provisioningKey || undefined, isActive: v.isActive! };

    const obs = this.editingItem
      ? this.service.update(this.editingItem.id, dto)
      : this.service.create(dto);

    obs.pipe(takeUntil(this.destroy$), finalize(() => { this.isSaving = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: () => { this.closeModal(); this.load(); },
        error: (err: any) => { this.errorMessage = err?.error?.message ?? 'Save failed.'; },
      });
  }

  confirmDelete(item: ProductDto, event: Event): void {
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
          this.products = this.products.filter(p => p.id !== this.deleteTarget!.id);
          this.deleteTarget = null;
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
