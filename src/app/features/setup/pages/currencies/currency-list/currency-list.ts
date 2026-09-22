import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocalNamePipe } from '../../../../../core/ui/local-name.pipe';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { CurrenciesService } from '../../../services/currencies';
import { CurrencyDto, SaveCurrencyDto } from '../../../../../core/models/setup/setup.models';
import { TranslationService } from '../../../../auth/services/Translation.service';
import { UiPager, pageSlice, newestFirst } from '../../../../../core/ui/pager/ui-pager';
import { CurrencySymbol } from '../../../../../core/ui/money/currency-symbol';

type StatusFilter = 'all' | 'active' | 'inactive';

@Component({
  selector: 'app-currency-list',
  standalone: true,
  imports: [CurrencySymbol, CommonModule, FormsModule, ReactiveFormsModule, UiPager, LocalNamePipe],
  templateUrl: './currency-list.html',
  styleUrl: './currency-list.scss',
})
export class CurrencyList implements OnInit, OnDestroy {
  private readonly service = inject(CurrenciesService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();
  private readonly i18n = inject(TranslationService);
  t = (k: string) => this.i18n.translate(k);

  currencies: CurrencyDto[] = [];
  isLoading = false;
  errorMessage = '';
  searchQuery = '';
  statusFilter: StatusFilter = 'all';

  page = 1;
  pageSize = 10;
  get pagedRows(): CurrencyDto[] { return pageSlice(this.filtered, this.page, this.pageSize); }

  // Add / edit modal state
  showModal = false;
  isSaving = false;
  editingItem: CurrencyDto | null = null;

  deleteTarget: CurrencyDto | null = null;
  isDeleting = false;

  form = this.fb.group({
    code:          ['', [Validators.required, Validators.pattern(/^[A-Z]{3}$/)]],
    nameAr:        ['', [Validators.maxLength(100)]],
    nameEn:        ['', [Validators.required, Validators.maxLength(100)]],
    symbol:        ['', [Validators.required, Validators.maxLength(8)]],
    decimalPlaces: [2, [Validators.required, Validators.min(0), Validators.max(4)]],
    isDefault:     [false],
    isActive:      [true],
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
        next: items => { this.currencies = newestFirst(items); this.page = 1; },
        error: (err: any) => { this.errorMessage = err?.error?.message ?? this.t('setup.currencies.loadFailed'); },
      });
  }

  get filtered(): CurrencyDto[] {
    const q = this.searchQuery.trim().toLowerCase();
    return this.currencies.filter(c => {
      if (this.statusFilter === 'active' && !c.isActive) return false;
      if (this.statusFilter === 'inactive' && c.isActive) return false;
      if (!q) return true;
      return c.nameEn.toLowerCase().includes(q) ||
        (c.nameAr?.toLowerCase().includes(q) ?? false) ||
        c.code.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q);
    });
  }

  get activeCount(): number { return this.currencies.filter(c => c.isActive).length; }
  get inactiveCount(): number { return this.currencies.filter(c => !c.isActive).length; }

  // Force the ISO code to uppercase as the user types
  onCodeInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const upper = input.value.toUpperCase();
    if (upper !== input.value) {
      this.form.get('code')!.setValue(upper);
    }
  }

  private defaults() {
    return { code: '', nameAr: '', nameEn: '', symbol: '', decimalPlaces: 2, isDefault: false, isActive: true };
  }

  openCreate(): void {
    this.editingItem = null;
    this.errorMessage = '';
    this.form.reset(this.defaults());
    this.showModal = true;
  }

  openEdit(item: CurrencyDto, event: Event): void {
    event.stopPropagation();
    this.editingItem = item;
    this.errorMessage = '';
    this.form.patchValue({
      code: item.code,
      nameAr: item.nameAr ?? '',
      nameEn: item.nameEn,
      symbol: item.symbol,
      decimalPlaces: item.decimalPlaces,
      isDefault: item.isDefault,
      isActive: item.isActive,
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingItem = null;
    this.form.reset(this.defaults());
    this.errorMessage = '';
  }

  saveModal(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isSaving = true;
    this.errorMessage = '';
    const v = this.form.getRawValue();
    const dto: SaveCurrencyDto = {
      code: v.code!.toUpperCase(),
      nameEn: v.nameEn!,
      nameAr: v.nameAr || undefined,
      symbol: v.symbol!,
      decimalPlaces: Number(v.decimalPlaces),
      isDefault: !!v.isDefault,
      isActive: !!v.isActive,
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

  confirmDelete(currency: CurrencyDto, event: Event): void {
    event.stopPropagation();
    this.deleteTarget = currency;
  }

  cancelDelete(): void { this.deleteTarget = null; }

  doDelete(): void {
    if (!this.deleteTarget) return;
    this.isDeleting = true;
    this.service.delete(this.deleteTarget.id)
      .pipe(takeUntil(this.destroy$), finalize(() => { this.isDeleting = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: () => {
          this.currencies = this.currencies.filter(c => c.id !== this.deleteTarget!.id);
          this.deleteTarget = null;
        },
        error: (err: any) => {
          this.errorMessage = err?.error?.message ?? this.t('setup.currencies.deleteFailed');
          this.deleteTarget = null;
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
