import {
  ChangeDetectorRef,
  Component,
  OnInit,
  OnDestroy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocalNamePipe } from '../../../../../core/ui/local-name.pipe';
import { CurrencyRef } from '../../../../../core/ui/money.pipe';
import { EmailInputDirective } from '../../../../../core/validators/email-input.directive';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, interval } from 'rxjs';
import { takeUntil, finalize, switchMap, takeWhile } from 'rxjs/operators';
import { TenantManagement, SubscriptionRequest } from '../../../services/tenant-management';
import { CountriesService } from '../../../../setup/services/countries';
import { CurrenciesService } from '../../../../setup/services/currencies';
import { OrgTypesService } from '../../../../setup/services/org-types';
import { ProductsService } from '../../../../setup/services/products';
import { FeaturesService } from '../../../../setup/services/features';
import { CountryDto, CurrencyDto, OrgTypeDto, ProductDto, FeatureDto, sortProducts, sortCurrencies } from '../../../../../core/models/setup/setup.models';
import { trimRequired, subdomainValidator, emailValidator, coercePositiveInteger } from '../../../../../core/validators/common.validators';
import { TranslationService } from '../../../../auth/services/Translation.service';
import { ProvisioningStatus } from '../../../../../core/models/organizations/provisioning-status.model';
import { Money } from '../../../../../core/ui/money/money';
import { BillingCycle } from '../../../../../core/models/subscription/subscription.models';
import { BILLING_CYCLES, computeEndDate } from '../../../../../core/models/subscription/billing-cycle';
import { PositiveIntegerDirective } from '../../../../../core/validators/positive-integer.directive';
import { CurrencySymbol } from '../../../../../core/ui/money/currency-symbol';
import { Organization } from '../../../../../core/models/organizations/organization.model';
import { SubscriptionsService } from '../../../../subscriptions/services/subscription-detail';
import { LimitDefinition } from '../../../../../core/models/subscription/subscription.models';
import { NotificationsService } from '../../../../../core/notifications/notifications.service';
import { PlanTemplatesService } from '../../../../setup/services/plan-templates';
import { PlanTemplateDto } from '../../../../../core/models/platform-ops/platform-ops.models';

type WizardStep = 'org-admin' | 'subscriptions' | 'provisioning';

export interface ProductSubForm {
  enabled: boolean;
  numberOfUsers: number;
  billingCycle: BillingCycle;
  /** Number of periods (months / quarters / years); ignored when billingCycle is None. */
  cycleCount: number;
  startDate: string;
  /** Typed by the admin only for None; computed (read-only) for every other cycle. */
  endDate: string;
  totalPrice: number | null;
  discountValue: number;
  /** Trial subscription: may be free. */
  isTrial: boolean;
  /** Quotas for a limited ("Lite") plan keyed by limit key; empty = unlimited. */
  limits: Record<string, number | null>;
}

@Component({
  selector: 'app-register-wizard',
  standalone: true,
  imports: [CurrencySymbol, CommonModule, ReactiveFormsModule, FormsModule, EmailInputDirective, PositiveIntegerDirective, LocalNamePipe, Money],
  templateUrl: './register-wizard.html',
  styleUrl: './register-wizard.scss',
})
export class RegisterWizard implements OnInit, OnDestroy {
  private readonly router        = inject(Router);
  private readonly tenantService = inject(TenantManagement);
  private readonly cdr           = inject(ChangeDetectorRef);
  private readonly fb            = inject(FormBuilder);
  private readonly countrySvc    = inject(CountriesService);
  private readonly currencySvc   = inject(CurrenciesService);
  private readonly orgTypeSvc    = inject(OrgTypesService);
  private readonly productSvc    = inject(ProductsService);
  private readonly featureSvc    = inject(FeaturesService);
  private readonly destroy$      = new Subject<void>();
  private readonly i18n          = inject(TranslationService);
  t = (k: string) => this.i18n.translate(k);

  step: WizardStep = 'org-admin';
  isSubmitting  = false;
  isLoadingData = true;
  errorMessage  = '';
  createdOrgId  = '';
  createdOrg: Organization | null = null;
  private readonly notifications = inject(NotificationsService);
  get createdIsOnPrem(): boolean { return this.createdOrg?.deploymentType === 'OnPrem'; }
  keyCopied = false;

  copyLicenseKey(): void {
    const key = this.createdOrg?.licenseKey;
    if (!key) return;
    navigator.clipboard?.writeText(key).then(() => {
      this.keyCopied = true;
      this.cdr.markForCheck();
      setTimeout(() => { this.keyCopied = false; this.cdr.markForCheck(); }, 1800);
    });
  }

  provisioningData: ProvisioningStatus | null = null;

  get provisioningComplete(): boolean { return !!this.provisioningData?.allProvisioned; }
  get provisioningFailed(): boolean {
    if (!this.provisioningData) return false;
    return !!(
      this.provisioningData.identityProvisioningError ||
      this.provisioningData.products?.some(p => p.provisioningError)
    );
  }
  get provisioningErrorMessage(): string {
    if (!this.provisioningData) return '';
    if (this.provisioningData.identityProvisioningError) return this.provisioningData.identityProvisioningError;
    const failed = this.provisioningData.products?.find(p => p.provisioningError);
    return failed?.provisioningError ?? this.t('tenants.register.provFailedTitle');
  }

  countries:  CountryDto[]  = [];
  currencies: CurrencyDto[] = [];
  orgTypes:   OrgTypeDto[]  = [];
  products:   ProductDto[]  = [];
  featuresMap = new Map<number, FeatureDto[]>();
  selectedFeaturesMap = new Map<number, Set<number>>();
  subForms: Record<number, ProductSubForm> = {};

  private readonly subscriptionsSvc = inject(SubscriptionsService);
  /** Limit definitions keyed by product code; products without any show no limits section. */
  limitDefinitions: Record<string, LimitDefinition[]> = {};

  private readonly planTemplatesSvc = inject(PlanTemplatesService);
  /** Active plan templates keyed by product id, and the one picked per product. */
  templatesMap = new Map<number, PlanTemplateDto[]>();
  selectedTemplate: Record<number, number | null> = {};

  templatesOf(productId: number): PlanTemplateDto[] { return this.templatesMap.get(productId) ?? []; }

  /** Fills the product's form from a ready-made plan; every field stays editable afterwards. */
  applyTemplate(product: ProductDto, templateId: number | null): void {
    this.selectedTemplate[product.id] = templateId;
    const tpl = this.templatesOf(product.id).find(x => x.id === +(templateId ?? 0));
    if (!tpl) return;
    const form = this.subForms[product.id];
    if (!form.startDate) form.startDate = new Date().toISOString().slice(0, 10);
    form.numberOfUsers = tpl.numberOfUsers;
    form.billingCycle = tpl.billingCycle;
    if (tpl.billingCycle === 'None') {
      const end = new Date(form.startDate);
      end.setDate(end.getDate() + (tpl.durationDays ?? 0));
      form.endDate = end.toISOString().slice(0, 10);
    } else {
      form.cycleCount = tpl.cycleCount ?? 1;
    }
    form.totalPrice = tpl.totalPrice ?? null;
    form.isTrial = tpl.isTrial;
    form.limits = { ...(tpl.limits ?? {}) };
    const available = new Set(this.featuresOf(product.id).map(f => f.id));
    this.selectedFeaturesMap.set(product.id, new Set((tpl.featureIds ?? []).filter(id => available.has(id))));
    this.cdr.markForCheck();
  }

  limitsFor(product: ProductDto): LimitDefinition[] {
    return this.limitDefinitions[product.code] ?? [];
  }

  limitName(d: LimitDefinition): string {
    return this.i18n.getLocale().startsWith('ar') ? d.nameAr : d.nameEn;
  }

  orgAdminForm = this.fb.nonNullable.group({
    nameEn:             ['', [trimRequired(), Validators.minLength(2), Validators.maxLength(100)]],
    subdomain:          ['', [trimRequired(), Validators.minLength(3), Validators.maxLength(50), subdomainValidator()]],
    countryId:          [null as number | null, Validators.required],
    deploymentType:     ['Cloud' as 'Cloud' | 'OnPrem'],
    currencyId:         [null as number | null, Validators.required],
    organizationTypeId: [null as number | null, Validators.required],
    adminName:          ['', [trimRequired(), Validators.minLength(2), Validators.maxLength(100)]],
    adminEmail:         ['', [trimRequired(), emailValidator()]],
  });

  get f() { return this.orgAdminForm.controls; }

  get stepLabel(): string {
    if (this.step === 'provisioning') return this.t('tenants.register.stepDone');
    return this.t('tenants.register.stepOf').replace('{{n}}', String(this.stepIndex + 1));
  }

  get stepIndex(): number {
    const steps: WizardStep[] = ['org-admin', 'subscriptions', 'provisioning'];
    return steps.indexOf(this.step);
  }

  get selectedCountryName(): string { return this.localName(this.countries.find(c => c.id === this.f['countryId'].value)); }
  get selectedCurrency(): CurrencyDto | undefined { return this.currencies.find(c => c.id === this.f['currencyId'].value); }
  /** Currency reference for the money pipe, based on the currency chosen in step 1. */
  get currencyRef(): CurrencyRef {
    const c = this.selectedCurrency;
    return { currencyCode: c?.code, currencySymbol: c?.symbol, currencyDecimals: c?.decimalPlaces };
  }
  get selectedOrgTypeName(): string { return this.localName(this.orgTypes.find(o => o.id === this.f['organizationTypeId'].value)); }
  private localName(x?: { nameEn?: string; nameAr?: string }): string {
    if (!x) return '';
    return this.i18n.getCurrentLanguage() === 'ar' ? (x.nameAr || x.nameEn || '') : (x.nameEn || x.nameAr || '');
  }
  get enabledProducts(): ProductDto[] { return this.products.filter(p => this.subForms[p.id]?.enabled); }
  get grandTotal(): number { return this.enabledProducts.reduce((s, p) => s + this.totalAfterDiscount(p.id), 0); }

  readonly billingCycles = BILLING_CYCLES;

  cycleLabel(cycle: BillingCycle): string {
    return this.t('subscriptions.cycle' + cycle);
  }

  /** "Number of months / quarters / years" depending on the chosen cycle. */
  cycleCountLabel(cycle: BillingCycle): string {
    return this.t('tenants.register.cycleCount' + cycle);
  }

  onCycleCountInput(form: ProductSubForm, value: unknown): void {
    form.cycleCount = coercePositiveInteger(value);
  }

  /** End date the backend will store for a cycle-based subscription. */
  computedEndDate(form: ProductSubForm): string {
    return computeEndDate(form.startDate, form.billingCycle, form.cycleCount);
  }

  /** Per-product form validity, mirroring OrganizationsFeature's rules. */
  isSubFormValid(form: ProductSubForm): boolean {
    if (!form.enabled) return true;
    if (!form.startDate || !(form.numberOfUsers >= 1)) return false;
    if (form.billingCycle === 'None') return !!form.endDate && form.endDate > form.startDate;
    return form.cycleCount >= 1;
  }

  get allSubFormsValid(): boolean {
    return this.products.every(p => this.isSubFormValid(this.subForms[p.id]));
  }

  get hasAnySubscription(): boolean {
    return this.products.some(p => this.subForms[p.id]?.enabled);
  }

  ngOnInit(): void {
    this.countrySvc.getAll().pipe(takeUntil(this.destroy$)).subscribe(c => { this.countries = c.filter(x => x.isActive); });
    this.orgTypeSvc.getAll().pipe(takeUntil(this.destroy$)).subscribe(t => { this.orgTypes = t.filter(x => x.isActive); });
    this.currencySvc.getAll().pipe(takeUntil(this.destroy$)).subscribe(c => {
      this.currencies = sortCurrencies(c.filter(x => x.isActive));
      // Preselect the default currency when the user has not picked one yet
      const def = this.currencies.find(x => x.isDefault);
      if (def && this.f['currencyId'].value === null) this.orgAdminForm.patchValue({ currencyId: def.id });
      this.cdr.markForCheck();
    });
    this.productSvc.getAll()
      .pipe(takeUntil(this.destroy$), finalize(() => { this.isLoadingData = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: products => {
          this.products = sortProducts(products.filter(p => p.isActive));
          this.products.forEach(p => {
            this.subForms[p.id] = {
              enabled: false, numberOfUsers: 1, billingCycle: 'Monthly', cycleCount: 1,
              startDate: '', endDate: '', totalPrice: null, discountValue: 0,
              isTrial: false, limits: {},
            };
            this.selectedFeaturesMap.set(p.id, new Set());
          });
          this.loadAllFeatures();
          this.subscriptionsSvc.getLimitDefinitions().pipe(takeUntil(this.destroy$)).subscribe({
            next: (defs) => { this.limitDefinitions = defs ?? {}; this.cdr.markForCheck(); },
            error: () => { /* No limits section then; subscriptions stay unlimited. */ },
          });
          this.planTemplatesSvc.getAll(undefined, true).pipe(takeUntil(this.destroy$)).subscribe({
            next: (items) => {
              for (const x of items ?? []) {
                this.templatesMap.set(x.productId, [...(this.templatesMap.get(x.productId) ?? []), x]);
              }
              this.cdr.markForCheck();
            },
            error: () => { /* No template picker then; the form is filled by hand. */ },
          });
        },
        error: () => { this.errorMessage = this.t('tenants.register.errorLoadSetup'); },
      });
  }

  /** Filled limit fields only; none means an unlimited subscription. */
  private collectLimits(form: ProductSubForm): Record<string, number> | undefined {
    const limits: Record<string, number> = {};
    for (const [key, value] of Object.entries(form.limits ?? {})) {
      if (value !== null && value !== undefined && `${value}` !== '' && Number(value) >= 0) limits[key] = Math.floor(Number(value));
    }
    return Object.keys(limits).length ? limits : undefined;
  }

  private loadAllFeatures(): void {
    this.products.forEach(p => {
      this.featureSvc.getByProduct(p.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe(features => {
          this.featuresMap.set(p.id, features.filter(f => f.isActive));
          this.cdr.markForCheck();
        });
    });
  }

  featuresOf(productId: number): FeatureDto[] { return this.featuresMap.get(productId) ?? []; }

  isFeatureSelected(productId: number, featureId: number): boolean {
    return this.selectedFeaturesMap.get(productId)?.has(featureId) ?? false;
  }

  toggleFeature(productId: number, featureId: number): void {
    const set = this.selectedFeaturesMap.get(productId) ?? new Set<number>();
    if (set.has(featureId)) set.delete(featureId); else set.add(featureId);
    this.selectedFeaturesMap.set(productId, set);
  }

  totalAfterDiscount(productId: number): number {
    const form = this.subForms[productId];
    if (!form) return 0;
    const base = form.totalPrice ?? 0;
    const disc = Math.min(100, Math.max(0, form.discountValue ?? 0));
    return base * (1 - disc / 100);
  }

  setDeployment(value: 'Cloud' | 'OnPrem'): void {
    this.orgAdminForm.patchValue({ deploymentType: value });
  }

  next(): void {
    this.errorMessage = '';
    if (this.step === 'org-admin') {
      if (this.orgAdminForm.invalid) {
        this.orgAdminForm.markAllAsTouched();
        return;
      }
      this.step = 'subscriptions';
    }
  }

  back(): void {
    this.errorMessage = '';
    if (this.step === 'subscriptions') this.step = 'org-admin';
    else if (this.step === 'org-admin') this.router.navigate(['/tenants']);
  }

  submit(): void {
    if (!this.hasAnySubscription) {
      this.errorMessage = this.t('tenants.register.errorNoSubscription');
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const v = this.orgAdminForm.getRawValue();

    const subscriptions: SubscriptionRequest[] = this.products
      .filter(p => this.subForms[p.id]?.enabled)
      .map(p => {
        const form    = this.subForms[p.id];
        const featIds = [...(this.selectedFeaturesMap.get(p.id) ?? new Set<number>())];
        return {
          productCode:   p.code,
          featureIds:    featIds.length ? featIds : undefined,
          numberOfUsers: form.numberOfUsers,
          totalPrice:    form.totalPrice ?? undefined,
          discountValue: form.discountValue > 0 ? form.discountValue : undefined,
          discountType:  form.discountValue > 0 ? 'Percentage' as const : undefined,
          billingCycle:  form.billingCycle,
          cycleCount:    form.billingCycle === 'None' ? undefined : Math.max(1, Math.floor(form.cycleCount || 1)),
          startDate:     form.startDate,
          endDate:       form.billingCycle === 'None' ? form.endDate : undefined,
          isTrial:       form.isTrial || undefined,
          limits:        this.collectLimits(form),
        };
      });

    this.tenantService
      .register({
        name:               v.nameEn.trim(),
        subdomain:          v.subdomain.trim().toLowerCase(),
        adminEmail:         v.adminEmail.trim(),
        adminNameEn:        v.adminName.trim() || undefined,
        countryId:          v.countryId ?? undefined,
        organizationTypeId: v.organizationTypeId ?? undefined,
        deploymentType:     v.deploymentType,
        currencyId:         v.currencyId ?? undefined,
        subscriptions,
      })
      .pipe(takeUntil(this.destroy$), finalize(() => { this.isSubmitting = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: (org) => {
          this.createdOrgId = org.id;
          this.createdOrg = org;
          this.step = 'provisioning';
          // Cloud databases are created by a background job (the header bell reports
          // completion); on-prem is installed on site. Nothing to wait for either way.
          this.notifications.refresh();
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.errorMessage = err?.error?.message ?? this.t('tenants.register.errorRegistrationFailed');
          this.cdr.markForCheck();
        },
      });
  }

  private pollProvisioning(): void {
    interval(3000)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.tenantService.getProvisioningStatus(this.createdOrgId)),
        takeWhile(
          (s) => !s.allProvisioned && !s.identityProvisioningError && !s.products?.some(p => p.provisioningError),
          true
        )
      )
      .subscribe({
        next: (s) => {
          this.provisioningData = s;
          this.cdr.markForCheck();
        },
        error: () => {
          this.provisioningData = {
            organizationId: this.createdOrgId,
            subdomain: '',
            identityProvisioned: false,
            identityProvisioningError: this.t('tenants.register.errorProvisioningUnreachable'),
            products: [],
            allProvisioned: false,
          };
          this.cdr.markForCheck();
        },
      });
  }

  viewOrg():  void { this.router.navigate(['/tenants', this.createdOrgId]); }
  goToList(): void { this.router.navigate(['/tenants']); }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
