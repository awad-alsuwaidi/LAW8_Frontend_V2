import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocalNamePipe } from '../../../../../core/ui/local-name.pipe';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, forkJoin, of } from 'rxjs';
import { takeUntil, finalize, catchError } from 'rxjs/operators';
import { TenantManagement } from '../../../services/tenant-management';
import { CountriesService } from '../../../../setup/services/countries';
import { CurrenciesService } from '../../../../setup/services/currencies';
import { OrgTypesService } from '../../../../setup/services/org-types';
import { CountryDto, CurrencyDto, OrgTypeDto, sortCurrencies } from '../../../../../core/models/setup/setup.models';
import { trimRequired, phoneValidator } from '../../../../../core/validators/common.validators';
import { PhoneInputDirective } from '../../../../../core/validators/phone-input.directive';
import { TranslationService } from '../../../../auth/services/Translation.service';
import { CurrencySymbol } from '../../../../../core/ui/money/currency-symbol';

@Component({
  selector: 'app-tenant-edit',
  standalone: true,
  imports: [CurrencySymbol, CommonModule, ReactiveFormsModule, PhoneInputDirective, LocalNamePipe],
  templateUrl: './tenant-edit.html',
  styleUrl: './tenant-edit.scss',
})
export class TenantEdit implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly tenantService = inject(TenantManagement);
  private readonly countriesSvc = inject(CountriesService);
  private readonly currenciesSvc = inject(CurrenciesService);
  private readonly orgTypesSvc = inject(OrgTypesService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly fb = inject(FormBuilder);
  private readonly destroy$ = new Subject<void>();
  private readonly i18n = inject(TranslationService);
  t = (k: string) => this.i18n.translate(k);

  orgId = '';
  orgName = '';
  adminEmail = '';
  subdomain = '';
  tenantCode = '';
  createdAt = '';
  deploymentType: 'Cloud' | 'OnPrem' = 'Cloud';
  currencyCode = '';
  currencySymbol = '';
  /** True when the org has Active/Suspended subscriptions - backend rejects currency changes then. */
  currencyLocked = false;

  get adminInitials(): string {
    const n = (this.form.controls.adminName.value || this.adminEmail || '?').trim();
    return n.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('') || '?';
  }
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  successMessage = '';

  countries: CountryDto[] = [];
  orgTypes: OrgTypeDto[] = [];
  currencies: CurrencyDto[] = [];

  form = this.fb.nonNullable.group({
    nameEn:             ['', [trimRequired(), Validators.minLength(2), Validators.maxLength(100)]],
    adminName:          ['', [Validators.maxLength(100)]],
    address:            ['', [Validators.maxLength(300)]],
    phoneNumber:        ['', [phoneValidator()]],
    countryId:          [null as number | null],
    organizationTypeId: [null as number | null],
    currencyId:         [null as number | null],
  });

  get f() { return this.form.controls; }

  ngOnInit(): void {
    this.orgId = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.orgId) this.load();
  }

  load(): void {
    this.isLoading = true;
    forkJoin({
      org: this.tenantService.getById(this.orgId),
      countries: this.countriesSvc.getAll().pipe(catchError(() => of([] as CountryDto[]))),
      orgTypes: this.orgTypesSvc.getAll().pipe(catchError(() => of([] as OrgTypeDto[]))),
      currencies: this.currenciesSvc.getAll().pipe(catchError(() => of([] as CurrencyDto[]))),
    })
      .pipe(takeUntil(this.destroy$), finalize(() => { this.isLoading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: ({ org, countries, orgTypes, currencies }) => {
          this.countries = countries;
          this.orgTypes = orgTypes;
          // Keep inactive currencies visible only if the org already uses one of them
          this.currencies = sortCurrencies(currencies.filter(c => c.isActive || c.id === org.currencyId));
          this.currencyCode = org.currencyCode ?? '';
          this.currencySymbol = org.currencySymbol ?? '';
          this.currencyLocked = (org.subscriptions ?? []).some(s => s.status === 'Active' || s.status === 'Suspended');
          this.orgName = org.nameEn;
          this.adminEmail = org.adminEmail;
          this.subdomain = org.subdomain;
          this.tenantCode = org.tenantCode;
          this.createdAt = org.createdAt;
          this.deploymentType = org.deploymentType;
          this.form.patchValue({
            nameEn:             org.nameEn,
            adminName:          org.adminName ?? '',
            address:            org.address ?? '',
            phoneNumber:        org.phoneNumber ?? '',
            countryId:          org.countryId ?? null,
            organizationTypeId: org.organizationTypeId ?? null,
            currencyId:         org.currencyId ?? null,
          });
          if (this.currencyLocked) this.form.controls.currencyId.disable();
        },
        error: (err) => {
          this.errorMessage = err?.error?.message ?? this.t('tenants.detail.loadFailed');
        },
      });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const v = this.form.getRawValue();

    this.tenantService
      .update(this.orgId, {
        name:               v.nameEn.trim(),
        adminNameEn:        v.adminName?.trim() || undefined,
        address:            v.address?.trim() || undefined,
        phoneNumber:        v.phoneNumber?.trim() || undefined,
        countryId:          v.countryId != null ? Number(v.countryId) : undefined,
        organizationTypeId: v.organizationTypeId != null ? Number(v.organizationTypeId) : undefined,
        currencyId:         !this.currencyLocked && v.currencyId != null ? Number(v.currencyId) : undefined,
      })
      .pipe(takeUntil(this.destroy$), finalize(() => { this.isSaving = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: () => {
          this.successMessage = this.t('tenants.detail.saveSuccess');
          setTimeout(() => this.router.navigate(['/tenants', this.orgId]), 900);
        },
        error: (err) => {
          this.errorMessage = err?.error?.message ?? this.t('tenants.detail.saveFailed');
        },
      });
  }

  cancel(): void {
    this.router.navigate(['/tenants', this.orgId]);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
