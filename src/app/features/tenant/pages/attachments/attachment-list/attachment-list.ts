import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { TenantManagement } from '../../../services/tenant-management';
import { OrganizationAttachment } from '../../../../../core/models/organizations/organization-attachment.model';
import { TranslationService } from '../../../../auth/services/Translation.service';
import { UiPager, pageSlice } from '../../../../../core/ui/pager/ui-pager';

type DocumentType = OrganizationAttachment['attachmentType'];

@Component({
  selector: 'app-attachment-list',
  standalone: true,
  imports: [CommonModule, FormsModule, UiPager],
  templateUrl: './attachment-list.html',
  styleUrl: './attachment-list.scss',
})
export class AttachmentList implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly tenantService = inject(TenantManagement);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();
  private readonly i18n = inject(TranslationService);
  t = (k: string) => this.i18n.translate(k);

  orgId = '';
  attachments: OrganizationAttachment[] = [];
  page = 1; pageSize = 10;
  get pagedRows() { return pageSlice(this.attachments, this.page, this.pageSize); }
  isLoading = false;
  errorMessage = '';
  deletingId = '';

  // ---- Upload modal ----
  readonly documentTypes: DocumentType[] = ['Logo', 'TaxRegistration', 'CommercialRegister', 'Agreement', 'Other'];
  readonly maxFileBytes = 20 * 1024 * 1024;
  readonly acceptedExtensions = ['.pdf', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.doc', '.docx'];
  showUpload = false;
  selectedFile: File | null = null;
  documentType: DocumentType = 'Other';
  fileError = '';
  uploadError = '';
  isUploading = false;

  openUpload(): void {
    this.selectedFile = null;
    this.documentType = 'Other';
    this.fileError = '';
    this.uploadError = '';
    this.showUpload = true;
  }

  closeUpload(): void {
    if (this.isUploading) return;
    this.showUpload = false;
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.fileError = '';
    this.uploadError = '';
    if (file) {
      const ext = '.' + (file.name.split('.').pop() ?? '').toLowerCase();
      if (!this.acceptedExtensions.includes(ext)) this.fileError = this.t('tenants.attachments.fileTypeError');
      else if (file.size > this.maxFileBytes) this.fileError = this.t('tenants.attachments.fileTooLarge');
    }
    this.selectedFile = this.fileError ? null : file;
    input.value = '';
    this.cdr.markForCheck();
  }

  clearFile(): void {
    this.selectedFile = null;
    this.fileError = '';
  }

  submitUpload(): void {
    if (!this.selectedFile) { this.fileError = this.t('tenants.attachments.fileRequired'); return; }
    this.isUploading = true;
    this.uploadError = '';
    this.tenantService
      .uploadAttachment(this.orgId, this.selectedFile, this.documentType)
      .pipe(takeUntil(this.destroy$), finalize(() => { this.isUploading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: () => { this.showUpload = false; this.load(); },
        error: (err) => { this.uploadError = err?.error?.message ?? this.t('tenants.attachments.uploadFailed'); },
      });
  }

  ngOnInit(): void {
    this.orgId = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.orgId) this.load();
  }

  load(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.tenantService
      .getAttachments(this.orgId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => { this.isLoading = false; this.cdr.markForCheck(); })
      )
      .subscribe({
        next: (list) => { this.attachments = list; this.page = 1; },
        error: (err) => {
          this.errorMessage = err?.error?.message ?? this.t('tenants.attachments.loadFailed');
        },
      });
  }

  upload(): void {
    this.openUpload();
  }

  busyId = '';

  /** Fetches the file with the auth header, then saves it (download) or opens it in a new tab (view). */
  private fetchFile(att: OrganizationAttachment, mode: 'download' | 'view'): void {
    this.busyId = att.id;
    this.errorMessage = '';
    this.tenantService
      .downloadAttachment(this.orgId, att.id)
      .pipe(takeUntil(this.destroy$), finalize(() => { this.busyId = ''; this.cdr.markForCheck(); }))
      .subscribe({
        next: (blob) => {
          const typed = att.contentType && blob.type !== att.contentType ? new Blob([blob], { type: att.contentType }) : blob;
          const url = URL.createObjectURL(typed);
          if (mode === 'download') {
            const a = document.createElement('a');
            a.href = url; a.download = att.fileName; a.click();
            setTimeout(() => URL.revokeObjectURL(url), 10_000);
          } else {
            // Browser renders PDFs/images inline; other types fall back to the download prompt.
            window.open(url, '_blank', 'noopener');
            setTimeout(() => URL.revokeObjectURL(url), 60_000);
          }
        },
        error: (err) => { this.errorMessage = err?.error?.message ?? this.t('tenants.attachments.downloadFailed'); },
      });
  }

  download(att: OrganizationAttachment): void { this.fetchFile(att, 'download'); }
  view(att: OrganizationAttachment): void { this.fetchFile(att, 'view'); }

  /** Only types the browser can render inline get a "view" button. */
  canView(att: OrganizationAttachment): boolean {
    const ct = (att.contentType ?? '').toLowerCase();
    return ct === 'application/pdf' || ct.startsWith('image/');
  }

  deleteTarget: OrganizationAttachment | null = null;
  confirmDelete(att: OrganizationAttachment): void { this.deleteTarget = att; }
  cancelDelete(): void { if (!this.deletingId) this.deleteTarget = null; }

  delete(att: OrganizationAttachment): void {
    this.deletingId = att.id;
    this.tenantService
      .deleteAttachment(this.orgId, att.id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => { this.deletingId = ''; this.cdr.markForCheck(); })
      )
      .subscribe({
        next: () => {
          this.deleteTarget = null;
          this.attachments = this.attachments.filter((a) => a.id !== att.id);
          // Keep the current page in range after removing a row
          const lastPage = Math.max(1, Math.ceil(this.attachments.length / this.pageSize));
          if (this.page > lastPage) this.page = lastPage;
        },
        error: (err) => {
          this.errorMessage = err?.error?.message ?? this.t('common.deleteFailed');
        },
      });
  }

  back(): void {
    this.router.navigate(['/tenants', this.orgId]);
  }

  formatSize(bytes?: number): string {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
