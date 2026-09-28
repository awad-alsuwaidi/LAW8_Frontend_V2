import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataDeletionCertificateDto, formatBytes } from '../../../../core/models/platform-ops/platform-ops.models';
import { TranslationService } from '../../../auth/services/Translation.service';

/** Data deletion certificate shown after a purge and from the organization's certificates tab. */
@Component({
  selector: 'app-deletion-certificate',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './deletion-certificate.html',
  styleUrl: './deletion-certificate.scss',
})
export class DeletionCertificate {
  @Input({ required: true }) certificate!: DataDeletionCertificateDto;
  /** Shows the "data deleted" banner (right after a purge). */
  @Input() justIssued = false;
  @Output() closed = new EventEmitter<void>();

  private readonly i18n = inject(TranslationService);
  t = (k: string) => this.i18n.translate(k);

  readonly formatBytes = formatBytes;
  copied = false;

  get issuedAt(): string {
    return new Date(this.certificate.issuedAtUtc).toLocaleString(this.i18n.getLocale(), {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  }

  copyFingerprint(): void {
    navigator.clipboard?.writeText(this.certificate.fingerprint).then(() => {
      this.copied = true;
      setTimeout(() => (this.copied = false), 1500);
    }).catch(() => { /* Clipboard blocked; the value stays selectable. */ });
  }
}
