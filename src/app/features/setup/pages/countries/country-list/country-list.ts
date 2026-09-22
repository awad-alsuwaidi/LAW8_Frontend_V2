import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocalNamePipe } from '../../../../../core/ui/local-name.pipe';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { CountriesService } from '../../../services/countries';
import { RegionsService } from '../../../services/regions';
import { CountryDto, RegionDto } from '../../../../../core/models/setup/setup.models';
import { TranslationService } from '../../../../auth/services/Translation.service';
import { UiPager, pageSlice, newestFirst } from '../../../../../core/ui/pager/ui-pager';

@Component({
  selector: 'app-country-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, UiPager, LocalNamePipe],
  templateUrl: './country-list.html',
  styleUrl: './country-list.scss',
})
export class CountryList implements OnInit, OnDestroy {
  private readonly service = inject(CountriesService);
  private readonly regionsService = inject(RegionsService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();
  private readonly i18n = inject(TranslationService);
  t = (k: string) => this.i18n.translate(k);

  countries: CountryDto[] = [];
  regions: RegionDto[] = [];
  isLoading = false;
  errorMessage = '';
  searchQuery = '';
  regionFilter = 0;

  page = 1;
  pageSize = 10;
  get pagedRows(): CountryDto[] { return pageSlice(this.filtered, this.page, this.pageSize); }

  // Add / edit modal state
  showModal = false;
  isSaving = false;
  editingItem: CountryDto | null = null;

  deleteTarget: CountryDto | null = null;
  isDeleting = false;

  form = this.fb.group({
    code:     ['', [Validators.required, Validators.maxLength(10)]],
    nameEn:   ['', [Validators.required, Validators.maxLength(100)]],
    nameAr:   ['', [Validators.maxLength(100)]],
    regionId: [0, [Validators.required, Validators.min(1)]],
    taxRate:  [null as number | null, [Validators.min(0), Validators.max(100)]],
    isActive: [true],
  });

  /** Region row for a country, so the badge can show the localized name. */
  regionOf(country: CountryDto): RegionDto | undefined {
    return this.regions.find(r => r.id === country.regionId);
  }

  ngOnInit(): void {
    this.load();
  }

  // Regions are loaded together with countries; they feed both the filter and the modal dropdown
  load(): void {
    this.isLoading = true;
    this.errorMessage = '';
    forkJoin({ countries: this.service.getAll(), regions: this.regionsService.getAll() })
      .pipe(takeUntil(this.destroy$), finalize(() => { this.isLoading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: r => { this.countries = newestFirst(r.countries); this.regions = r.regions; this.page = 1; },
        error: (err: any) => { this.errorMessage = err?.error?.message ?? 'Failed to load data.'; },
      });
  }

  get filtered(): CountryDto[] {
    let items = this.countries;
    if (this.regionFilter) items = items.filter(c => c.regionId === this.regionFilter);
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter(c =>
      c.nameEn.toLowerCase().includes(q) ||
      (c.nameAr?.toLowerCase().includes(q) ?? false) ||
      c.code.toLowerCase().includes(q)
    );
  }

  get activeCount(): number { return this.countries.filter(c => c.isActive).length; }
  get inactiveCount(): number { return this.countries.filter(c => !c.isActive).length; }

  openCreate(): void {
    this.editingItem = null;
    this.errorMessage = '';
    this.form.reset({ code: '', nameEn: '', nameAr: '', regionId: 0, taxRate: null, isActive: true });
    this.showModal = true;
  }

  openEdit(item: CountryDto, event: Event): void {
    event.stopPropagation();
    this.editingItem = item;
    this.errorMessage = '';
    this.form.patchValue({
      code: item.code,
      nameEn: item.nameEn,
      nameAr: item.nameAr ?? '',
      regionId: item.regionId,
      taxRate: item.taxRate ?? null,
      isActive: item.isActive,
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingItem = null;
    this.form.reset({ code: '', nameEn: '', nameAr: '', regionId: 0, taxRate: null, isActive: true });
    this.errorMessage = '';
  }

  saveModal(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isSaving = true;
    this.errorMessage = '';
    const v = this.form.getRawValue();
    const dto = {
      code: v.code!,
      nameEn: v.nameEn!,
      nameAr: v.nameAr || undefined,
      regionId: v.regionId!,
      taxRate: v.taxRate ?? undefined,
      isActive: v.isActive!,
    };

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

  confirmDelete(country: CountryDto, event: Event): void {
    event.stopPropagation();
    this.deleteTarget = country;
  }

  cancelDelete(): void { this.deleteTarget = null; }

  doDelete(): void {
    if (!this.deleteTarget) return;
    this.isDeleting = true;
    this.service.delete(this.deleteTarget.id)
      .pipe(takeUntil(this.destroy$), finalize(() => { this.isDeleting = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: () => {
          this.countries = this.countries.filter(c => c.id !== this.deleteTarget!.id);
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
