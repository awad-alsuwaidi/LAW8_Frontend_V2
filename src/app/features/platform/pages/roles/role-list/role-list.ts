import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { PlatformRolesService } from '../../../services/platform-roles';
import { PlatformRole } from '../../../../../core/models/platform/platform-role.model';
import { TranslationService } from '../../../../auth/services/Translation.service';
import { UiPager, pageSlice } from '../../../../../core/ui/pager/ui-pager';

type RoleTypeFilter = 'all' | 'system' | 'custom';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, UiPager],
  templateUrl: './role-list.html',
  styleUrl: './role-list.scss',
})
export class RoleList implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly rolesService = inject(PlatformRolesService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly i18n = inject(TranslationService);
  private readonly fb = inject(FormBuilder);
  private readonly destroy$ = new Subject<void>();

  roles: PlatformRole[] = [];
  isLoading = false;
  errorMessage = '';
  searchQuery = '';
  typeFilter: RoleTypeFilter = 'all';

  page = 1;
  pageSize = 10;
  get pagedRows(): PlatformRole[] { return pageSlice(this.filtered, this.page, this.pageSize); }

  deleteConfirmName = '';
  deleteLoading = false;
  deleteError = '';

  // Create / edit modal
  showModal = false;
  isSaving = false;
  saveError = '';
  editingRole: PlatformRole | null = null;
  form = this.fb.group({
    nameAr: ['', [Validators.maxLength(100)]],
    name: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(/^[a-zA-Z][a-zA-Z0-9_-]*$/)]],
  });

  isInvalid(ctrl: 'name' | 'nameAr'): boolean {
    const c = this.form.get(ctrl);
    return !!c && c.invalid && c.touched;
  }

  closeModal(): void {
    if (this.isSaving) return;
    this.showModal = false;
    this.saveError = '';
  }

  saveModal(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isSaving = true;
    this.saveError = '';
    const v = this.form.value;
    const dto = { name: v.name!.trim(), nameAr: v.nameAr?.trim() || null };
    const call = this.editingRole ? this.rolesService.update(this.editingRole.name, dto) : this.rolesService.create(dto);
    call
      .pipe(takeUntil(this.destroy$), finalize(() => { this.isSaving = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: () => { this.showModal = false; this.load(); },
        error: (err) => { this.saveError = err?.error?.message ?? this.t(this.editingRole ? 'updateFailed' : 'createFailed'); },
      });
  }

  readonly reservedRoles = ['SuperAdmin'];

  ngOnInit(): void {
    this.load();
  }

  t(key: string): string {
    return this.i18n.translate(`platformRoles.${key}`);
  }

  interpolate(key: string, vars: Record<string, string | number>): string {
    return Object.entries(vars).reduce(
      (text, [name, value]) => text.replace(`{{${name}}}`, String(value)),
      this.t(key),
    );
  }

  /** Arabic name when the UI is Arabic and Auth has one; the technical name otherwise. */
  displayName(role: PlatformRole): string {
    return this.i18n.getCurrentLanguage() === 'ar' && role.nameAr ? role.nameAr : role.name;
  }

  get filtered(): PlatformRole[] {
    const q = this.searchQuery.trim().toLowerCase();
    return this.roles.filter((role) => {
      const matchesType =
        this.typeFilter === 'all' ||
        (this.typeFilter === 'system' && this.isReserved(role.name)) ||
        (this.typeFilter === 'custom' && !this.isReserved(role.name));
      const matchesSearch = !q || role.name.toLowerCase().includes(q) || (role.nameAr ?? '').toLowerCase().includes(q);
      return matchesType && matchesSearch;
    });
  }

  get systemCount(): number {
    return this.roles.filter((r) => this.isReserved(r.name)).length;
  }

  get customCount(): number {
    return this.roles.length - this.systemCount;
  }

  grantLabel(count: number): string {
    return count === 1
      ? this.t('grantOne')
      : this.interpolate('grantMany', { count });
  }

  load(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.rolesService
      .getAll()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (data) => {
          this.roles = data;
          this.page = 1;
        },
        error: (err) => {
          this.errorMessage = err?.error?.message ?? this.t('loadFailed');
        },
      });
  }

  setFilter(filter: RoleTypeFilter): void {
    this.typeFilter = filter;
    this.page = 1;
  }

  createRole(): void {
    this.editingRole = null;
    this.form.reset({ nameAr: '', name: '' });
    this.saveError = '';
    this.showModal = true;
  }

  editRole(role: PlatformRole, event?: Event): void {
    event?.stopPropagation();
    if (this.isReserved(role.name)) return;
    this.editingRole = role;
    this.form.reset({ nameAr: role.nameAr ?? '', name: role.name });
    this.saveError = '';
    this.showModal = true;
  }

  openPermissions(roleName: string, event?: Event): void {
    event?.stopPropagation();
    this.router.navigate(['/platform', 'permissions', roleName]);
  }

  isReserved(roleName: string): boolean {
    return this.reservedRoles.includes(roleName);
  }

  confirmDelete(name: string, event?: Event): void {
    event?.stopPropagation();
    this.deleteConfirmName = name;
    this.deleteError = '';
  }

  cancelDelete(): void {
    this.deleteConfirmName = '';
    this.deleteError = '';
  }

  doDelete(): void {
    this.deleteLoading = true;
    this.deleteError = '';
    this.rolesService
      .delete(this.deleteConfirmName)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.deleteLoading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: () => {
          this.deleteConfirmName = '';
          this.load();
        },
        error: (err) => {
          this.deleteError = err?.error?.message ?? this.t('deleteFailed');
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
