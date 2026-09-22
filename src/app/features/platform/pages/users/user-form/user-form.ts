import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { emailValidator, phoneValidator, strongPasswordValidator, passwordChecks, generatePassword, PasswordChecks } from '../../../../../core/validators/common.validators';
import { EmailInputDirective } from '../../../../../core/validators/email-input.directive';
import { PhoneInputDirective } from '../../../../../core/validators/phone-input.directive';

import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, forkJoin } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { PlatformUsersService } from '../../../services/platform-users';
import { PlatformRolesService } from '../../../services/platform-roles';
import { PlatformRole } from '../../../../../core/models/platform/platform-role.model';
import { TranslationService } from '../../../../auth/services/Translation.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, EmailInputDirective, PhoneInputDirective],
  templateUrl: './user-form.html',
  styleUrl: './user-form.scss',
})
export class UserForm implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly usersService = inject(PlatformUsersService);
  private readonly rolesService = inject(PlatformRolesService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly i18n = inject(TranslationService);
  t = (k: string) => this.i18n.translate(k);
  private readonly destroy$ = new Subject<void>();

  userId = '';
  isEdit = false;
  isLoading = false;
  isSaving = false;
  errorMessage = '';

  roles: PlatformRole[] = [];

  showPassword = false;

  get passwordValue(): string { return this.form.controls.password.value ?? ''; }
  get pwdChecks(): PasswordChecks { return passwordChecks(this.passwordValue); }

  generatePwd(): void {
    this.form.controls.password.setValue(generatePassword());
    this.form.controls.password.markAsDirty();
    this.showPassword = true;
  }

  get displayName(): string {
    const ar = this.i18n.getCurrentLanguage() === 'ar';
    const en = (this.form.controls.nameEn.value ?? '').trim();
    const arName = (this.form.controls.nameAr.value ?? '').trim();
    return (ar ? arName || en : en || arName);
  }

  get initials(): string {
    const src = this.displayName || this.form.controls.email.value || '';
    return src.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');
  }
  selectedRoles: Set<string> = new Set();

  form = this.fb.group({
    email:       ['', [Validators.required, emailValidator()]],
    password:    ['', [strongPasswordValidator()]],
    nameEn:      ['', [Validators.maxLength(100)]],
    nameAr:      ['', [Validators.maxLength(100)]],
    phoneNumber: ['', [phoneValidator()]],
    active:      [true],
    locked:      [false],
  });

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id') ?? '';
    this.isEdit = !!this.userId;
    this.load();
  }

  load(): void {
    this.isLoading = true;
    const obs: Observable<any> = this.isEdit
      ? forkJoin({ roles: this.rolesService.getAll(), user: this.usersService.getById(this.userId) })
      : forkJoin({ roles: this.rolesService.getAll() });

    obs
      .pipe(takeUntil(this.destroy$), finalize(() => { this.isLoading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: (result: any) => {
          this.roles = result.roles;
          if (this.isEdit && result.user) {
            const u = result.user;
            this.form.patchValue({
              email: u.email,
              nameEn: u.nameEn ?? '',
              nameAr: u.nameAr ?? '',
              phoneNumber: u.phoneNumber ?? '',
              active: u.active,
              locked: u.locked,
            });
            this.form.get('password')?.disable();
            this.selectedRoles = new Set(u.roles);
          }
        },
        error: (err: any) => {
          this.errorMessage = err?.error?.message ?? this.t('platformUsers.form.loadFailed');
        },
      });
  }

  toggleRole(name: string): void {
    if (this.selectedRoles.has(name)) {
      this.selectedRoles.delete(name);
    } else {
      this.selectedRoles.add(name);
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    const v = this.form.getRawValue();

    const obs: Observable<any> = this.isEdit
      ? this.usersService.update(this.userId, {
          email: v.email ?? undefined,
          nameEn: v.nameEn ?? undefined,
          nameAr: v.nameAr ?? undefined,
          phoneNumber: v.phoneNumber ?? undefined,
          active: v.active ?? undefined,
          locked: v.locked ?? undefined,
        })
      : this.usersService.create({
          email: v.email!,
          password: v.password || undefined,
          nameEn: v.nameEn || undefined,
          nameAr: v.nameAr || undefined,
          phoneNumber: v.phoneNumber || undefined,
          roles: Array.from(this.selectedRoles),
        });

    obs
      .pipe(takeUntil(this.destroy$), finalize(() => { this.isSaving = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: () => {
          setTimeout(() => this.router.navigate(['/platform', 'users']), 800);
        },
        error: (err: any) => {
          this.errorMessage = err?.error?.message ?? this.t('platformUsers.form.saveFailed');
        },
      });
  }

  back(): void {
    this.router.navigate(['/platform', 'users']);
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c?.touched);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
