import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { TenantManagement } from '../../../services/tenant-management';
import { OrganizationAttachment } from '../../../../../core/models/organizations/organization-attachment.model';
import { TranslationService } from '../../../../auth/services/Translation.service';

type DocumentType = OrganizationAttachment['attachmentType'];

@Component({
  selector: 'app-attachment-upload',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './attachment-upload.html',
  styleUrl: './attachment-upload.scss',
})
export class AttachmentUpload implements OnDestroy {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly tenantService = inject(TenantManagement);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly fb = inject(FormBuilder);
  private readonly destroy$ = new Subject<void>();
  private readonly i18n = inject(TranslationService);
  t = (k: string) => this.i18n.translate(k);

  orgId = this.route.snapshot.paramMap.get('id') ?? '';
  selectedFile: File | null = null;
  fileError = '';
  isUploading = false;
  errorMessage = '';
  successMessage = '';

  form = this.fb.nonNullable.group({
    documentType: ['Other' as DocumentType, Validators.required],
  });

  get f() { return this.form.controls; }

  readonly documentTypes: DocumentType[] = [
    'TaxRegistration',
    'CommercialRegister',
    'Agreement',
    'Other',
  ];

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
    this.fileError = '';
    this.errorMessage = '';
    this.cdr.markForCheck();
  }

  clearFile(): void {
    this.selectedFile = null;
    this.fileError = '';
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  upload(): void {
    if (!this.selectedFile) {
      this.fileError = 'Please select a file to upload.';
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isUploading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.tenantService
      .uploadAttachment(this.orgId, this.selectedFile, this.f['documentType'].value)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => { this.isUploading = false; this.cdr.markForCheck(); })
      )
      .subscribe({
        next: () => {
          this.successMessage = 'Attachment uploaded successfully.';
          this.selectedFile = null;
          setTimeout(() => this.router.navigate(['/tenants', this.orgId, 'attachments']), 1200);
        },
        error: (err) => {
          this.errorMessage = err?.error?.message ?? 'Upload failed.';
        },
      });
  }

  cancel(): void {
    this.router.navigate(['/tenants', this.orgId, 'attachments']);
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
