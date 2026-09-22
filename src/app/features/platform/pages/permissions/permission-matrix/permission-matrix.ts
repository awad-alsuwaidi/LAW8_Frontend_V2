import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { PlatformPermissionsService } from '../../../services/platform-permissions';
import { PlatformRolesService } from '../../../services/platform-roles';
import { PlatformPermission, PermissionGroupKey, RolePermissionGrant } from '../../../../../core/models/platform/platform-permission.model';
import { PlatformRole } from '../../../../../core/models/platform/platform-role.model';
import { TranslationService } from '../../../../auth/services/Translation.service';
import { LocalNamePipe } from '../../../../../core/ui/local-name.pipe';

interface GridRow {
  permission: PlatformPermission;
  grant: RolePermissionGrant;
  dirty: boolean;
}

type GrantFlag = 'canRead' | 'canUpdate' | 'canDelete' | 'canSearch' | 'canPrint' | 'canExport';

@Component({
  selector: 'app-permission-matrix',
  standalone: true,
  imports: [CommonModule, FormsModule, LocalNamePipe],
  templateUrl: './permission-matrix.html',
  styleUrl: './permission-matrix.scss',
})
export class PermissionMatrix implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly permService = inject(PlatformPermissionsService);
  private readonly rolesService = inject(PlatformRolesService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly i18n = inject(TranslationService);
  private readonly destroy$ = new Subject<void>();

  roleName = '';
  /** Role from Auth (id + Arabic name); null until loaded or if it doesn't exist. */
  role: PlatformRole | null = null;
  rows: GridRow[] = [];
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  successMessage = '';
  searchQuery = '';
  groupFilter = '';

  readonly flags: GrantFlag[] = ['canRead', 'canUpdate', 'canDelete', 'canSearch', 'canPrint', 'canExport'];
  readonly flagLabelKeys: Record<GrantFlag, string> = {
    canRead: 'flagRead',
    canUpdate: 'flagUpdate',
    canDelete: 'flagDelete',
    canSearch: 'flagSearch',
    canPrint: 'flagPrint',
    canExport: 'flagExport',
  };

  ngOnInit(): void {
    this.roleName = this.route.snapshot.paramMap.get('roleName') ?? '';
    this.load();
  }

  t(key: string): string {
    return this.i18n.translate(`platformPermissions.${key}`);
  }

  interpolate(key: string, vars: Record<string, string | number>): string {
    return Object.entries(vars).reduce(
      (text, [name, value]) => text.replace(`{{${name}}}`, String(value)),
      this.t(key),
    );
  }

  flagLabel(flag: GrantFlag): string {
    return this.t(this.flagLabelKeys[flag]);
  }

  /** Section order, same as the sidebar. */
  private readonly groupOrder: PermissionGroupKey[] = ['tenants', 'masterData', 'security', 'platform'];

  groupKey(row: GridRow): PermissionGroupKey {
    return row.permission.group || 'platform';
  }

  groupName(key: string): string {
    return this.t('groups.' + key);
  }

  get roleDisplayName(): string {
    const ar = this.role?.nameAr;
    return this.i18n.getCurrentLanguage() === 'ar' && ar ? ar : this.roleName;
  }

  get groups(): PermissionGroupKey[] {
    const present = new Set(this.rows.map((row) => this.groupKey(row)));
    return this.groupOrder.filter((g) => present.has(g));
  }

  get dirtyCount(): number {
    return this.rows.filter((r) => r.dirty).length;
  }

  get grantedCount(): number {
    return this.rows.filter((r) => this.rowGrantedCount(r) > 0).length;
  }

  get dirtyHint(): string {
    return this.dirtyCount === 1
      ? this.t('dirtyOne')
      : this.interpolate('dirtyMany', { count: this.dirtyCount });
  }

  get filteredRows(): GridRow[] {
    const q = this.searchQuery.trim().toLowerCase();
    return this.rows.filter((row) => {
      const p = row.permission;
      const matchesGroup = !this.groupFilter || this.groupKey(row) === this.groupFilter;
      const matchesSearch = !q
        || p.nameEn.toLowerCase().includes(q)
        || (p.nameAr ?? '').toLowerCase().includes(q)
        || p.routeName.toLowerCase().includes(q);
      return matchesGroup && matchesSearch;
    });
  }

  groupedRows(): { group: PermissionGroupKey; rows: GridRow[] }[] {
    const groups = new Map<PermissionGroupKey, GridRow[]>();
    this.filteredRows.forEach((row) => {
      const group = this.groupKey(row);
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group)!.push(row);
    });
    return this.groupOrder.filter((g) => groups.has(g)).map((group) => ({ group, rows: groups.get(group)! }));
  }

  rowGrantedCount(row: GridRow): number {
    return this.flags.filter((flag) => row.grant[flag]).length;
  }

  rowGrantLabel(row: GridRow): string {
    return this.interpolate('grantedOf', {
      granted: this.rowGrantedCount(row),
      total: this.flags.length,
    });
  }

  setGroupFilter(group: string): void {
    this.groupFilter = group;
  }

  load(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    forkJoin({
      permissions: this.permService.getAll(),
      grants: this.permService.getByRole(this.roleName),
      roles: this.rolesService.getAll(),
    })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: ({ permissions, grants, roles }) => {
          this.role = roles.find((r) => r.name.toLowerCase() === this.roleName.toLowerCase()) ?? null;
          const grantMap = new Map(grants.map((g) => [g.permissionId, g]));
          this.rows = permissions.map((p: PlatformPermission) => ({
            permission: p,
            grant: grantMap.get(p.id) ?? {
              permissionId: p.id,
              canRead: false,
              canUpdate: false,
              canDelete: false,
              canSearch: false,
              canPrint: false,
              canExport: false,
            },
            dirty: false,
          }));
        },
        error: (err) => {
          this.errorMessage = err?.error?.message ?? this.t('loadFailed');
        },
      });
  }

  toggle(row: GridRow, flag: GrantFlag): void {
    row.grant = { ...row.grant, [flag]: !row.grant[flag] };
    row.dirty = true;
    this.successMessage = '';
    this.cdr.markForCheck();
  }

  setAllForRow(row: GridRow, value: boolean): void {
    const updated: RolePermissionGrant = { ...row.grant };
    this.flags.forEach((f) => (updated[f] = value));
    row.grant = updated;
    row.dirty = true;
    this.successMessage = '';
    this.cdr.markForCheck();
  }

  setColumnAll(flag: GrantFlag, value: boolean): void {
    const target = this.filteredRows;
    target.forEach((r) => {
      r.grant = { ...r.grant, [flag]: value };
      r.dirty = true;
    });
    this.successMessage = '';
    this.cdr.markForCheck();
  }

  saveAll(): void {
    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';
    const dto = {
      // send the role id too so grants survive a rename
      roleId: this.role?.id ?? null,
      roleName: this.roleName,
      grants: this.rows.map((r) => r.grant),
    };
    this.permService
      .saveGrants(dto)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isSaving = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: () => {
          this.rows.forEach((r) => (r.dirty = false));
          this.successMessage = this.t('saved');
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.errorMessage = err?.error?.message ?? this.t('saveFailed');
        },
      });
  }

  back(): void {
    this.router.navigate(['/platform', 'roles']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
