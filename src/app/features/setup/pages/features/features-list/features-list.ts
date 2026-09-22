import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LocalNamePipe } from '../../../../../core/ui/local-name.pipe';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { FeaturesService } from '../../../services/features';
import { ProductsService } from '../../../services/products';
import { FeatureDto, ProductDto, SaveFeatureDto, SaveProductDto, sortProducts } from '../../../../../core/models/setup/setup.models';
import { TranslationService } from '../../../../auth/services/Translation.service';
import { newestFirst } from '../../../../../core/ui/pager/ui-pager';

// Same avatar palette as tenant-list so section icons match across the app
const PRODUCT_COLORS = ['#0e69d5', '#7c3aed', '#0891b2', '#059669', '#d97706', '#dc2626', '#6366f1', '#0d9488'];

@Component({
  selector: 'app-features-list',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule, FormsModule, LocalNamePipe],
  templateUrl: './features-list.html',
  styleUrl: './features-list.scss',
})
export class FeaturesList implements OnInit, OnDestroy {
  private readonly featureSvc  = inject(FeaturesService);
  private readonly productSvc  = inject(ProductsService);
  private readonly fb          = inject(FormBuilder);
  private readonly cdr         = inject(ChangeDetectorRef);
  private readonly destroy$    = new Subject<void>();
  private readonly i18n        = inject(TranslationService);
  t = (k: string) => this.i18n.translate(k);

  products:    ProductDto[] = [];
  featuresMap  = new Map<number, FeatureDto[]>();
  isLoading    = false;
  errorMessage = '';

  /* ---- Feature modal ---- */
  showFeatureModal  = false;
  isSavingFeature   = false;
  targetProduct:   ProductDto | null = null;
  editingFeature:  FeatureDto | null = null;
  deleteTarget:    FeatureDto | null = null;
  isDeleting       = false;

  featureForm = this.fb.group({
    nameAr:      ['', [Validators.maxLength(200)]],
    nameEn:      ['', [Validators.required, Validators.maxLength(200)]],
    description: [''],
    isActive:    [true],
  });

  /* ---- Product modal ---- */
  showProductModal = false;
  isSavingProduct  = false;
  editingProduct:  ProductDto | null = null;

  productForm = this.fb.group({
    nameEn:          ['', [Validators.required, Validators.maxLength(200)]],
    description:     [''],
    isProvisionable: [false],
    isActive:        [true],
  });

  ngOnInit(): void { this.loadAll(); }

  loadAll(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.productSvc.getAll()
      .pipe(takeUntil(this.destroy$), finalize(() => { this.isLoading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: products => {
          this.products = sortProducts(products);
          products.forEach(p => { if (!this.featuresMap.has(p.id)) this.featuresMap.set(p.id, []); });
          this.loadAllFeatures(products);
        },
        error: (err: any) => { this.errorMessage = err?.error?.message ?? 'Failed to load products.'; },
      });
  }

  private loadAllFeatures(products: ProductDto[]): void {
    products.forEach(p => {
      this.featureSvc.getByProduct(p.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe(features => {
          this.featuresMap.set(p.id, newestFirst(features));
          this.cdr.markForCheck();
        });
    });
  }

  featuresOf(productId: number): FeatureDto[] { return this.featuresMap.get(productId) ?? []; }

  productColor(index: number): string { return PRODUCT_COLORS[index % PRODUCT_COLORS.length]; }

  /* ---- Feature modal ---- */

  openAddFeature(product: ProductDto): void {
    this.targetProduct  = product;
    this.editingFeature = null;
    this.featureForm.reset({ nameAr: '', nameEn: '', description: '', isActive: true });
    this.showFeatureModal = true;
  }

  openEditFeature(feature: FeatureDto, product: ProductDto, event: Event): void {
    event.stopPropagation();
    this.targetProduct  = product;
    this.editingFeature = feature;
    this.featureForm.patchValue({ nameAr: feature.nameAr ?? '', nameEn: feature.nameEn, description: feature.description ?? '', isActive: feature.isActive });
    this.showFeatureModal = true;
  }

  closeFeatureModal(): void { this.showFeatureModal = false; this.featureForm.reset(); this.errorMessage = ''; }

  saveFeature(): void {
    if (this.featureForm.invalid || !this.targetProduct) { this.featureForm.markAllAsTouched(); return; }
    this.isSavingFeature = true;
    const v = this.featureForm.getRawValue();
    const dto: SaveFeatureDto = {
      productId:   this.targetProduct.id,
      nameEn:      v.nameEn!.trim(),
      nameAr:      v.nameAr?.trim() || undefined,
      description: v.description?.trim() || undefined,
      priceAddOn:  0,
      isActive:    v.isActive!,
    };

    const obs = this.editingFeature
      ? this.featureSvc.update(this.editingFeature.id, dto)
      : this.featureSvc.create(dto);

    obs.pipe(takeUntil(this.destroy$), finalize(() => { this.isSavingFeature = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: () => {
          const pid = this.targetProduct!.id;
          this.closeFeatureModal();
          this.featureSvc.getByProduct(pid).pipe(takeUntil(this.destroy$)).subscribe(f => {
            this.featuresMap.set(pid, f);
            this.cdr.markForCheck();
          });
        },
        error: (err: any) => { this.errorMessage = err?.error?.message ?? 'Save failed.'; this.isSavingFeature = false; this.cdr.markForCheck(); },
      });
  }

  confirmDelete(feature: FeatureDto, event: Event): void { event.stopPropagation(); this.deleteTarget = feature; }
  cancelDelete(): void { this.deleteTarget = null; }

  doDelete(): void {
    if (!this.deleteTarget) return;
    this.isDeleting = true;
    const pid = this.deleteTarget.productId;
    this.featureSvc.delete(this.deleteTarget.id)
      .pipe(takeUntil(this.destroy$), finalize(() => { this.isDeleting = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: () => {
          this.featuresMap.set(pid, (this.featuresMap.get(pid) ?? []).filter(f => f.id !== this.deleteTarget!.id));
          this.deleteTarget = null;
        },
        error: (err: any) => { this.errorMessage = err?.error?.message ?? 'Delete failed.'; this.deleteTarget = null; },
      });
  }

  /* ---- Product modal ---- */

  openAddProduct(): void {
    this.editingProduct = null;
    this.productForm.reset({ nameEn: '', description: '', isProvisionable: false, isActive: true });
    this.showProductModal = true;
  }

  closeProductModal(): void { this.showProductModal = false; this.productForm.reset(); this.errorMessage = ''; }

  saveProduct(): void {
    if (this.productForm.invalid) { this.productForm.markAllAsTouched(); return; }
    this.isSavingProduct = true;
    const v = this.productForm.getRawValue();
    const code = v.nameEn!.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    const dto: SaveProductDto = {
      code,
      nameEn:          v.nameEn!.trim(),
      description:     v.description?.trim() || undefined,
      isProvisionable: v.isProvisionable!,
      isActive:        v.isActive!,
    };

    const obs = this.editingProduct
      ? this.productSvc.update(this.editingProduct.id, dto)
      : this.productSvc.create(dto);

    obs.pipe(takeUntil(this.destroy$), finalize(() => { this.isSavingProduct = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: () => { this.closeProductModal(); this.loadAll(); },
        error: (err: any) => { this.errorMessage = err?.error?.message ?? 'Save failed.'; this.isSavingProduct = false; this.cdr.markForCheck(); },
      });
  }

  isFeatureInvalid(field: string): boolean {
    const c = this.featureForm.get(field);
    return !!(c?.invalid && c?.touched);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
