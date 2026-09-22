import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { LicensingService } from '../../services/licensing';
import {
  LicenseKeyDetailsDto,
  ActivationSummaryDto,
  ReleaseActivationDto,
} from '../../../../core/models/licensing/license-key.model';
import { TranslationService } from '../../../auth/services/Translation.service';
import { UiPager, pageSlice } from '../../../../core/ui/pager/ui-pager';

@Component({
  selector: 'app-licensing-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, UiPager],
  templateUrl: './licensing-detail.html',
  styleUrl: './licensing-detail.scss',
})
export class LicensingDetail implements OnInit, OnDestroy {
  private readonly route   = inject(ActivatedRoute);
  private readonly router  = inject(Router);
  private readonly service = inject(LicensingService);
  private readonly cdr     = inject(ChangeDetectorRef);
  private readonly i18n    = inject(TranslationService);
  private readonly destroy$ = new Subject<void>();
  t = (k: string) => this.i18n.translate(k);

  key: LicenseKeyDetailsDto | null = null;

  actPage = 1; actPageSize = 10;
  renPage = 1; renPageSize = 5;
  copied = false;

  get pagedActivations() { return pageSlice(this.key?.activations ?? [], this.actPage, this.actPageSize); }
  get pagedRenewals() { return pageSlice(this.key?.renewals ?? [], this.renPage, this.renPageSize); }

  copyKey(): void {
    if (!this.key) return;
    navigator.clipboard?.writeText(this.key.key).then(() => {
      this.copied = true; this.cdr.markForCheck();
      setTimeout(() => { this.copied = false; this.cdr.markForCheck(); }, 1800);
    });
  }
  keyId = '';
  isLoading = false;
  errorMessage = '';

  /* ---- Cancel ---- */
  isCancelling = false;
  cancelError = '';
  showCancelConfirm = false;

  /* ---- Release activation ---- */
  releaseTarget: ActivationSummaryDto | null = null;
  releaseReason = '';
  isReleasing = false;
  releaseError = '';

  ngOnInit(): void {
    this.keyId = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.keyId) this.load();
  }

  load(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.service
      .getById(this.keyId)
      .pipe(takeUntil(this.destroy$), finalize(() => { this.isLoading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: (data) => { this.key = data; this.actPage = 1; this.renPage = 1; },
        error: (err) => { this.errorMessage = err?.error?.message ?? this.t('licensing.detail.loadFailed'); },
      });
  }

  back(): void { this.router.navigate(['/licensing']); }

  /* ---- Cancel ---- */

  openCancel(): void { this.cancelError = ''; this.showCancelConfirm = true; }
  closeCancel(): void { this.showCancelConfirm = false; this.cancelError = ''; }

  doCancel(): void {
    this.isCancelling = true;
    this.cancelError = '';
    this.service
      .cancel(this.keyId)
      .pipe(takeUntil(this.destroy$), finalize(() => { this.isCancelling = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: () => { this.closeCancel(); this.load(); },
        error: (err) => { this.cancelError = err?.error?.message ?? this.t('licensing.cancelModal.failed'); },
      });
  }

  /* ---- Release activation ---- */

  openRelease(activation: ActivationSummaryDto): void {
    this.releaseTarget = activation;
    this.releaseReason = '';
    this.releaseError = '';
  }

  closeRelease(): void { this.releaseTarget = null; this.releaseReason = ''; this.releaseError = ''; }

  doRelease(): void {
    if (!this.releaseTarget || !this.releaseReason.trim()) {
      this.releaseError = this.t('licensing.release.reasonRequired');
      return;
    }
    const dto: ReleaseActivationDto = { reason: this.releaseReason };
    this.isReleasing = true;
    this.releaseError = '';
    this.service
      .releaseActivation(this.releaseTarget.id, dto)
      .pipe(takeUntil(this.destroy$), finalize(() => { this.isReleasing = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: () => { this.closeRelease(); this.load(); },
        error: (err) => { this.releaseError = err?.error?.message ?? this.t('licensing.release.failed'); },
      });
  }

  statusText(status: string): string { return this.t('licensing.status' + status); }
  typeText(type: string): string { return this.t('licensing.type' + type); }
  activationStatusText(status: string): string { return this.t('licensing.activation' + status); }

  /* Badge modifier for the license key status */
  statusClass(status: string): string {
    switch (status) {
      case 'Available': return 'ui-badge--success';
      case 'Activated': return 'ui-badge--info';
      case 'Expired':   return 'ui-badge--warning';
      case 'Cancelled': return 'ui-badge--neutral';
      default:          return 'ui-badge--neutral';
    }
  }

  /* Badge modifier for an activation row status */
  activationClass(status: string): string {
    switch (status) {
      case 'Active':   return 'ui-badge--info';
      case 'Expired':  return 'ui-badge--warning';
      case 'Released': return 'ui-badge--neutral';
      default:         return 'ui-badge--neutral';
    }
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
