import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PositiveIntegerDirective } from '../../../../../core/validators/positive-integer.directive';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { IntegrationProvidersService } from '../../../services/integration-providers';
import { ProductsService } from '../../../services/products';
import { FeaturesService } from '../../../services/features';
import {
  IntegrationConfigField,
  IntegrationProviderDto,
  IntegrationSyncMode,
  SaveIntegrationProviderDto,
} from '../../../../../core/models/platform-ops/platform-ops.models';
import { FeatureDto, ProductDto } from '../../../../../core/models/setup/setup.models';
import { TranslationService } from '../../../../auth/services/Translation.service';
import { LocalNamePipe } from '../../../../../core/ui/local-name.pipe';

interface ProviderForm {
  code: string;
  name: string;
  description: string;
  productId: number | null;
  featureId: number | null;
  scopes: string;
  events: string;
  syncModes: IntegrationSyncMode;
  defaultSyncIntervalMinutes: number;
  configFields: IntegrationConfigField[];
  isActive: boolean;
}

/**
 * Catalog of external applications a tenant can connect (e.g. an ERP). Each one is licensed by a feature of its
 * product, so it is available only to subscriptions that include that feature.
 */
@Component({
  selector: 'app-integrations-list',
  standalone: true,
  imports: [PositiveIntegerDirective, CommonModule, FormsModule, LocalNamePipe],
  templateUrl: './integrations-list.html',
})
export class IntegrationsList implements OnInit, OnDestroy {
  private readonly service = inject(IntegrationProvidersService);
  private readonly productsSvc = inject(ProductsService);
  private readonly featuresSvc = inject(FeaturesService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly i18n = inject(TranslationService);
  private readonly destroy$ = new Subject<void>();
  t = (k: string) => this.i18n.translate(k);

  providers: IntegrationProviderDto[] = [];
  products: ProductDto[] = [];
  isLoading = false;
  errorMessage = '';

  readonly modes: IntegrationSyncMode[] = ['Webhook', 'Scheduled', 'Both'];
  showModal = false;
  editing: IntegrationProviderDto | null = null;
  form: ProviderForm = this.emptyForm();
  productFeatures: FeatureDto[] = [];
  isSaving = false;
  modalError = '';

  deleteTarget: IntegrationProviderDto | null = null;
  isDeleting = false;

  ngOnInit(): void {
    this.productsSvc.getAll().pipe(takeUntil(this.destroy$)).subscribe({
      next: (p) => { this.products = p; this.cdr.markForCheck(); },
    });
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.service.getAll()
      .pipe(takeUntil(this.destroy$), finalize(() => { this.isLoading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: (items) => { this.providers = items ?? []; },
        error: (err) => { this.errorMessage = err?.error?.message ?? this.t('integrations.loadFailed'); },
      });
  }

  productName(id: number): string {
    const p = this.products.find((x) => x.id === id);
    if (!p) return String(id);
    return this.i18n.getCurrentLanguage() === 'ar' ? (p.nameAr || p.nameEn) : p.nameEn;
  }

  openCreate(): void {
    this.editing = null;
    this.form = this.emptyForm();
    this.productFeatures = [];
    this.modalError = '';
    this.showModal = true;
  }

  openEdit(x: IntegrationProviderDto): void {
    this.editing = x;
    this.form = {
      code: x.code,
      name: x.name,
      description: x.description ?? '',
      productId: x.productId,
      featureId: x.featureId,
      scopes: (x.scopes ?? []).join(', '),
      events: (x.events ?? []).join(', '),
      syncModes: x.syncModes,
      defaultSyncIntervalMinutes: x.defaultSyncIntervalMinutes,
      configFields: (x.configFields ?? []).map((f) => ({ ...f })),
      isActive: x.isActive,
    };
    this.modalError = '';
    this.showModal = true;
    this.loadFeatures();
  }

  onProductChange(): void {
    this.form.featureId = null;
    this.loadFeatures();
  }

  private loadFeatures(): void {
    this.productFeatures = [];
    const id = this.form.productId ? +this.form.productId : 0;
    if (!id) return;
    this.featuresSvc.getByProduct(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (f) => { this.productFeatures = f; this.cdr.markForCheck(); },
    });
  }

  addField(): void {
    this.form.configFields = [...this.form.configFields, { key: '', label: '', required: false, secret: false }];
  }

  removeField(index: number): void {
    this.form.configFields = this.form.configFields.filter((_, i) => i !== index);
  }

  get isFormValid(): boolean {
    const f = this.form;
    return !!f.code.trim() && !!f.name.trim() && !!f.productId && !!f.featureId
      && f.defaultSyncIntervalMinutes >= 5 && f.defaultSyncIntervalMinutes <= 10080
      && f.configFields.every((c) => !!c.key.trim() && !!c.label.trim());
  }

  private splitList(value: string): string[] {
    return value.split(/[,\n]/).map((s) => s.trim()).filter((s) => !!s);
  }

  save(): void {
    if (!this.isFormValid || this.isSaving) return;
    const f = this.form;
    const dto: SaveIntegrationProviderDto = {
      code: f.code.trim().toLowerCase(),
      name: f.name.trim(),
      description: f.description.trim() || null,
      productId: +f.productId!,
      featureId: +f.featureId!,
      scopes: this.splitList(f.scopes),
      events: this.splitList(f.events),
      syncModes: f.syncModes,
      defaultSyncIntervalMinutes: Math.floor(f.defaultSyncIntervalMinutes),
      configFields: f.configFields.map((c) => ({ key: c.key.trim(), label: c.label.trim(), required: c.required, secret: c.secret })),
      isActive: f.isActive,
    };
    this.isSaving = true;
    this.modalError = '';
    const obs = this.editing ? this.service.update(this.editing.id, dto) : this.service.create(dto);
    obs.pipe(takeUntil(this.destroy$), finalize(() => { this.isSaving = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: () => { this.showModal = false; this.load(); },
        error: (err) => { this.modalError = err?.error?.message ?? this.t('integrations.saveFailed'); },
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
        next: () => { this.providers = this.providers.filter((x) => x.id !== target.id); this.deleteTarget = null; },
        error: (err) => { this.errorMessage = err?.error?.message ?? this.t('common.deleteFailed'); this.deleteTarget = null; },
      });
  }

  private emptyForm(): ProviderForm {
    return {
      code: '', name: '', description: '', productId: null, featureId: null, scopes: '', events: '',
      syncModes: 'Both', defaultSyncIntervalMinutes: 1440, configFields: [], isActive: true,
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
