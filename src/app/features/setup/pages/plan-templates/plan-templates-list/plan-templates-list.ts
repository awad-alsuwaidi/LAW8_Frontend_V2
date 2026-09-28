import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PositiveIntegerDirective } from '../../../../../core/validators/positive-integer.directive';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { PlanTemplatesService } from '../../../services/plan-templates';
import { ProductsService } from '../../../services/products';
import { FeaturesService } from '../../../services/features';
import { SubscriptionsService } from '../../../../subscriptions/services/subscription-detail';
import { PlanTemplateDto, SavePlanTemplateDto } from '../../../../../core/models/platform-ops/platform-ops.models';
import { FeatureDto, ProductDto } from '../../../../../core/models/setup/setup.models';
import { BillingCycle, LimitDefinition } from '../../../../../core/models/subscription/subscription.models';
import { BILLING_CYCLES } from '../../../../../core/models/subscription/billing-cycle';
import { TranslationService } from '../../../../auth/services/Translation.service';
import { LocalNamePipe } from '../../../../../core/ui/local-name.pipe';
import { UiPager, pageSlice } from '../../../../../core/ui/pager/ui-pager';

interface TemplateForm {
  productId: number | null;
  code: string;
  nameEn: string;
  nameAr: string;
  description: string;
  isTrial: boolean;
  billingCycle: BillingCycle;
  cycleCount: number | null;
  durationDays: number | null;
  numberOfUsers: number;
  pricePerAdditionalUser: number | null;
  totalPrice: number | null;
  sortOrder: number;
  isActive: boolean;
}

/** Ready-made plans (e.g. "Doc8 Lite", "Doc8 Pro") picked with one click when registering an organization. */
@Component({
  selector: 'app-plan-templates-list',
  standalone: true,
  imports: [PositiveIntegerDirective, CommonModule, FormsModule, LocalNamePipe, UiPager],
  templateUrl: './plan-templates-list.html',
})
export class PlanTemplatesList implements OnInit, OnDestroy {
  private readonly service = inject(PlanTemplatesService);
  private readonly productsSvc = inject(ProductsService);
  private readonly featuresSvc = inject(FeaturesService);
  private readonly subscriptionsSvc = inject(SubscriptionsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly i18n = inject(TranslationService);
  private readonly destroy$ = new Subject<void>();
  t = (k: string) => this.i18n.translate(k);

  templates: PlanTemplateDto[] = [];
  products: ProductDto[] = [];
  limitDefinitions: Record<string, LimitDefinition[]> = {};
  isLoading = false;
  errorMessage = '';
  productFilter: number | null = null;

  page = 1;
  pageSize = 10;

  readonly cycles = BILLING_CYCLES;
  showModal = false;
  editing: PlanTemplateDto | null = null;
  form: TemplateForm = this.emptyForm();
  /** Features of the selected product, and the ones ticked. */
  productFeatures: FeatureDto[] = [];
  selectedFeatures = new Set<number>();
  /** Limit values keyed by limit key; empty = unlimited. */
  limitValues: Record<string, number | null> = {};
  isSaving = false;
  modalError = '';

  deleteTarget: PlanTemplateDto | null = null;
  isDeleting = false;

  get filtered(): PlanTemplateDto[] {
    return this.productFilter ? this.templates.filter((x) => x.productId === +this.productFilter!) : this.templates;
  }

  get pagedRows(): PlanTemplateDto[] { return pageSlice(this.filtered, this.page, this.pageSize); }

  get formProduct(): ProductDto | undefined {
    return this.products.find((p) => p.id === +(this.form.productId ?? 0));
  }

  get formLimitDefinitions(): LimitDefinition[] {
    const p = this.formProduct;
    return p ? this.limitDefinitions[p.code] ?? [] : [];
  }

  ngOnInit(): void {
    this.productsSvc.getAll().pipe(takeUntil(this.destroy$)).subscribe({
      next: (p) => { this.products = p; this.cdr.markForCheck(); },
    });
    this.subscriptionsSvc.getLimitDefinitions().pipe(takeUntil(this.destroy$)).subscribe({
      next: (d) => { this.limitDefinitions = d ?? {}; this.cdr.markForCheck(); },
      error: () => { /* Templates then carry no limits. */ },
    });
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.service.getAll()
      .pipe(takeUntil(this.destroy$), finalize(() => { this.isLoading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: (items) => { this.templates = items ?? []; this.page = 1; },
        error: (err) => { this.errorMessage = err?.error?.message ?? this.t('planTemplates.loadFailed'); },
      });
  }

  productName(id: number): string {
    const p = this.products.find((x) => x.id === id);
    if (!p) return String(id);
    return this.i18n.getCurrentLanguage() === 'ar' ? (p.nameAr || p.nameEn) : p.nameEn;
  }

  cycleLabel(c: string): string {
    const key = 'subscriptions.cycle' + c;
    const v = this.t(key);
    return v === key ? c : v;
  }

  periodLabel(x: PlanTemplateDto): string {
    if (x.billingCycle === 'None') return `${x.durationDays ?? '—'} ${this.t('planTemplates.days')}`;
    return `${this.cycleLabel(x.billingCycle)} × ${x.cycleCount ?? 1}`;
  }

  limitsSummary(x: PlanTemplateDto): string {
    const keys = Object.keys(x.limits ?? {});
    if (!keys.length) return this.t('subscriptions.limits.unlimited');
    const code = this.products.find((p) => p.id === x.productId)?.code ?? '';
    const defs = this.limitDefinitions[code] ?? [];
    return keys.map((k) => {
      const d = defs.find((z) => z.key === k);
      return `${d ? this.limitName(d) : k}: ${x.limits[k]}${d?.unit === 'MB' ? ' MB' : ''}`;
    }).join(' · ');
  }

  limitName(d: LimitDefinition): string {
    return this.i18n.getCurrentLanguage() === 'ar' ? d.nameAr : d.nameEn;
  }

  openCreate(): void {
    this.editing = null;
    this.form = this.emptyForm();
    if (this.productFilter) this.form.productId = +this.productFilter;
    this.selectedFeatures = new Set();
    this.limitValues = {};
    this.modalError = '';
    this.showModal = true;
    this.onProductChange();
  }

  openEdit(x: PlanTemplateDto): void {
    this.editing = x;
    this.form = {
      productId: x.productId,
      code: x.code,
      nameEn: x.nameEn,
      nameAr: x.nameAr ?? '',
      description: x.description ?? '',
      isTrial: x.isTrial,
      billingCycle: x.billingCycle,
      cycleCount: x.cycleCount ?? 1,
      durationDays: x.durationDays ?? null,
      numberOfUsers: x.numberOfUsers,
      pricePerAdditionalUser: x.pricePerAdditionalUser ?? null,
      totalPrice: x.totalPrice ?? null,
      sortOrder: x.sortOrder,
      isActive: x.isActive,
    };
    this.selectedFeatures = new Set(x.featureIds ?? []);
    this.limitValues = { ...(x.limits ?? {}) };
    this.modalError = '';
    this.showModal = true;
    this.loadProductFeatures();
  }

  /** A different product has other features and limits: start those over. */
  onProductChange(): void {
    this.selectedFeatures = new Set();
    this.limitValues = {};
    this.loadProductFeatures();
  }

  private loadProductFeatures(): void {
    this.productFeatures = [];
    const id = this.form.productId ? +this.form.productId : 0;
    if (!id) return;
    this.featuresSvc.getByProduct(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (f) => { this.productFeatures = f.filter((x) => x.isActive || this.selectedFeatures.has(x.id)); this.cdr.markForCheck(); },
    });
  }

  toggleFeature(id: number, checked: boolean): void {
    if (checked) this.selectedFeatures.add(id); else this.selectedFeatures.delete(id);
  }

  get isFormValid(): boolean {
    const f = this.form;
    if (!f.productId || !f.code.trim() || !f.nameEn.trim() || f.numberOfUsers < 1) return false;
    if (f.billingCycle === 'None') return !!f.durationDays && f.durationDays >= 1;
    return !!f.cycleCount && f.cycleCount >= 1;
  }

  save(): void {
    if (!this.isFormValid || this.isSaving) return;
    const f = this.form;
    const limits: Record<string, number> = {};
    for (const d of this.formLimitDefinitions) {
      const v = this.limitValues[d.key];
      if (v !== null && v !== undefined && `${v}` !== '') limits[d.key] = Math.max(0, Math.floor(+v));
    }
    const dto: SavePlanTemplateDto = {
      productId: +f.productId!,
      code: f.code.trim().toLowerCase(),
      nameEn: f.nameEn.trim(),
      nameAr: f.nameAr.trim() || null,
      description: f.description.trim() || null,
      isTrial: f.isTrial,
      billingCycle: f.billingCycle,
      cycleCount: f.billingCycle === 'None' ? null : Math.floor(f.cycleCount ?? 1),
      durationDays: f.billingCycle === 'None' ? Math.floor(f.durationDays ?? 0) : null,
      numberOfUsers: Math.floor(f.numberOfUsers),
      pricePerAdditionalUser: f.pricePerAdditionalUser ?? null,
      totalPrice: f.totalPrice ?? null,
      featureIds: [...this.selectedFeatures],
      limits,
      sortOrder: Math.floor(f.sortOrder || 0),
      isActive: f.isActive,
    };
    this.isSaving = true;
    this.modalError = '';
    const obs = this.editing ? this.service.update(this.editing.id, dto) : this.service.create(dto);
    obs.pipe(takeUntil(this.destroy$), finalize(() => { this.isSaving = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: () => { this.showModal = false; this.load(); },
        error: (err) => { this.modalError = err?.error?.message ?? this.t('planTemplates.saveFailed'); },
      });
  }

  closeModal(): void {
    if (!this.isSaving) this.showModal = false;
  }

  doDelete(): void {
    const target = this.deleteTarget;
    if (!target) return;
    this.isDeleting = true;
    this.service.delete(target.id)
      .pipe(takeUntil(this.destroy$), finalize(() => { this.isDeleting = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: () => { this.templates = this.templates.filter((x) => x.id !== target.id); this.deleteTarget = null; },
        error: (err) => { this.errorMessage = err?.error?.message ?? this.t('common.deleteFailed'); this.deleteTarget = null; },
      });
  }

  private emptyForm(): TemplateForm {
    return {
      productId: null, code: '', nameEn: '', nameAr: '', description: '', isTrial: false,
      billingCycle: 'Yearly', cycleCount: 1, durationDays: 14, numberOfUsers: 5,
      pricePerAdditionalUser: null, totalPrice: null, sortOrder: 0, isActive: true,
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
