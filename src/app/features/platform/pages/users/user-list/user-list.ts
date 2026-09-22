import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { PlatformUsersService } from '../../../services/platform-users';
import { PlatformRolesService } from '../../../services/platform-roles';
import { PlatformUser } from '../../../../../core/models/platform/platform-user.model';
import { PlatformRole } from '../../../../../core/models/platform/platform-role.model';
import { ResetPasswordModal } from '../reset-password-modal/reset-password-modal';
import { TranslationService } from '../../../../auth/services/Translation.service';
import { UiPager, pageSlice, newestFirst } from '../../../../../core/ui/pager/ui-pager';
import { LocalNamePipe } from '../../../../../core/ui/local-name.pipe';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [LocalNamePipe, CommonModule, FormsModule, ResetPasswordModal, UiPager],
  templateUrl: './user-list.html',
  styleUrl: './user-list.scss',
})
export class UserList implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly usersService = inject(PlatformUsersService);
  private readonly rolesService = inject(PlatformRolesService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly i18n = inject(TranslationService);
  t = (k: string) => this.i18n.translate(k);
  private readonly destroy$ = new Subject<void>();

  users: PlatformUser[] = [];
  filtered: PlatformUser[] = [];
  roles: PlatformRole[] = [];

  page = 1;
  pageSize = 10;
  get pagedRows() { return pageSlice(this.filtered, this.page, this.pageSize); }

  isLoading = false;
  errorMessage = '';
  searchQuery = '';
  roleFilter = '';

  deleteConfirmId = '';
  deleteLoading = false;
  deleteError = '';

  resetTarget: PlatformUser | null = null;

  get isAr(): boolean { return this.i18n.getCurrentLanguage() === 'ar'; }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.errorMessage = '';
    forkJoin({
      users: this.usersService.getAll(),
      roles: this.rolesService.getAll(),
    })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => { this.isLoading = false; this.cdr.markForCheck(); })
      )
      .subscribe({
        next: ({ users, roles }) => {
          this.users = newestFirst(users, (u) => u.createdAt);
          this.roles = roles;
          this.applyFilters();
        },
        error: (err) => {
          this.errorMessage = err?.error?.message ?? this.t('platformUsers.loadFailed');
        },
      });
  }

  applyFilters(): void {
    const q = this.searchQuery.toLowerCase().trim();
    this.filtered = this.users.filter((u) => {
      const matchSearch = !q ||
        (u.nameEn ?? '').toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phoneNumber ?? '').toLowerCase().includes(q);
      const matchRole = !this.roleFilter || u.roles.includes(this.roleFilter);
      return matchSearch && matchRole;
    });
    this.page = 1;
    this.cdr.markForCheck();
  }

  addUser(): void {
    this.router.navigate(['/platform', 'users', 'new']);
  }

  editUser(id: string): void {
    this.router.navigate(['/platform', 'users', id, 'edit']);
  }

  openResetPassword(user: PlatformUser): void {
    this.resetTarget = user;
  }

  closeResetModal(): void {
    this.resetTarget = null;
  }

  confirmDelete(id: string): void {
    this.deleteConfirmId = id;
    this.deleteError = '';
  }

  cancelDelete(): void {
    this.deleteConfirmId = '';
    this.deleteError = '';
  }

  doDelete(): void {
    this.deleteLoading = true;
    this.deleteError = '';
    this.usersService
      .delete(this.deleteConfirmId)
      .pipe(takeUntil(this.destroy$), finalize(() => { this.deleteLoading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: () => {
          this.deleteConfirmId = '';
          this.load();
        },
        error: (err) => {
          this.deleteError = err?.error?.message ?? this.t('platformUsers.deleteFailed');
        },
      });
  }

  statusLabel(user: PlatformUser): string {
    if (user.locked) return this.t('platformUsers.statusLocked');
    return user.active ? this.t('platformUsers.statusActive') : this.t('platformUsers.statusInactive');
  }

  statusClass(user: PlatformUser): string {
    if (user.locked) return 'ui-badge--danger';
    return user.active ? 'ui-badge--success' : 'ui-badge--neutral';
  }

  countActive(): number {
    return this.users.filter((u) => u.active && !u.locked).length;
  }

  countLocked(): number {
    return this.users.filter((u) => u.locked).length;
  }

  countInactive(): number {
    return this.users.filter((u) => !u.active && !u.locked).length;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
