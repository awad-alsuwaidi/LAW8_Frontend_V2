import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { ApiService } from 'src/app/@core/api/api.service';
import { LanguageService } from 'src/app/@core/services';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { SharedModule } from 'src/app/@shared/shared.module';
import { matterAttachmentsColumns } from './matter-attachment-columns.config';
import { FileIconDirective } from 'src/app/@shared/directives/file-icon.directive';
import { MenuModule } from 'primeng/menu';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { IMAGE_EXTENSIONS } from 'src/app/@core/utilities/defines';
import { FileService } from 'src/app/@shared/services/file/file.service';
import { MatterAttachmentEditorComponent } from './matter-attachment-editor/matter-attachment-editor.component';
import { MatterAttachmentDto } from 'src/app/pages/matters/interfaces/matter-attachment.interface';
import { MenuItem } from 'primeng/api';
import { ConfirmDialogType } from 'src/app/@shared/enums/confirm-dialog-type';
import { SharedConfirmDialogComponent } from 'src/app/@shared/components/shared-confirm-dialog/shared-confirm-dialog.component';
import { Router } from '@angular/router';
import { PermissionService } from 'src/app/@core/services/permission.service';
import { finalize } from 'rxjs';
import { FileIconPipe } from 'src/app/@shared/services/file/file-icon.pipe';

@Component({
  selector: 'app-matter-attachment',
  standalone: true,
  imports: [
    TableModule,
    SharedButtonComponent,
    SharedModule,
    PaginatorModule,
    FileIconDirective,
    FileIconPipe,
    MenuModule,
  ],
  templateUrl: './matter-attachment.component.html',
  styleUrl: './matter-attachment.component.scss',
})
export class MatterAttachmentComponent implements OnInit, OnDestroy {
  _permissionService = inject(PermissionService);
  _dialogService = inject(DialogService);
  _languageService = inject(LanguageService);
  _unsubscribeService = inject(UnsubscribeService);
  _apiService = inject(ApiService);
  _fileService = inject(FileService);
  _router = inject(Router);
  
  deleteDialogRef!: DynamicDialogRef;
  data: MatterAttachmentDto[] = [];
  menuItems: MenuItem[] = [];
  totalRecords: number = 0;
  isLoading!: boolean;
  matterIdentifier?: number;
  matterAttachmentColumns = matterAttachmentsColumns;
  extensions = IMAGE_EXTENSIONS;

  filterOptions: any = {
    PageNumber: 1,
    PageSize: 10,
    SortBy: 'receivedDate',
    IsDescending: false,
    Filters: {},
  };
  
  sortField = '';
  sortOrder = 1;

  @Input() set id(value: number) {
    this.matterIdentifier = value;
  }
  
  ngOnInit(): void {
    this.getAttachments();
  }

  getAttachments() {
    this.filterOptions.Filters = {
      ...this.filterOptions.Filters,
      matterId: this.matterIdentifier
    };
    this.isLoading = true;

    this._apiService
      .get(API_Config.matterDocuments.get, this.filterOptions)
      .pipe(
        this._unsubscribeService.takeUntilDestroy(),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: (res: any) => {
          const isSuccess = res?.success ?? res?.isSuccess;
          const result = res?.data ?? res?.result;
          if (isSuccess && result) {
            this.data = result.items || [];
            this.totalRecords = result.totalCount || 0;
          }
        },
        error: (err) => {},
      });
  }

  onSort(event: any): void {
    this.sortField = event.field;
    this.sortOrder = event.order;

    this.filterOptions.SortBy = event.field;
    this.filterOptions.IsDescending = event.order === -1;
    this.filterOptions.PageNumber = 1;
    this.getAttachments();
  }

  // downloadAttachment(file: any) {
  //   this._fileService.downloadDocument(file.id).subscribe({
  //     next: (response: any) => {
  //       const blob = new Blob([response.body], {
  //         type: response.headers.get('content-type') ?? 'application/octet-stream',
  //       });
  //       const extension = file.fileName?.split('.').pop();
  //       const fileName = file.description ? `${file.description}.${extension}` : (file.fileName ?? 'download');
  //       const url = window.URL.createObjectURL(blob);
  //       const a = document.createElement('a');
  //       a.href = url;
  //       a.download = fileName;
  //       document.body.appendChild(a);
  //       a.click();
  //       document.body.removeChild(a);
  //       window.URL.revokeObjectURL(url);
  //     },
  //   });
  // }

  // openAttachment(attachment: any) {
  //   const cleanUrl = attachment.filePathe?.split('?')[0] || attachment.filePath?.split('?')[0];
  //   const ext = cleanUrl?.split('.').pop()?.toLowerCase();
  //   const previewExtensions = ['pdf', 'png', 'jpg', 'svg', 'jpeg', 'gif', 'bmp', 'webp'];

  //   if (previewExtensions.includes(ext!)) {
  //     this._fileService.previewFileFromPath(attachment.filePathe || attachment.filePath);
  //   } else {
  //     this.downloadAttachment(attachment);
  //   }
  // }

  openAttachmentEditor(rowData?: MatterAttachmentDto) {
    const ref = this._dialogService.open(MatterAttachmentEditorComponent, {
      header: rowData
        ? this._languageService.getTransValue('matters.updateAttachment')
        : this._languageService.getTransValue('matters.addAttachment'),
      data: { id: rowData?.id, matterIdentifier: this.matterIdentifier },
      width: '720px',
    });

    ref.onClose.subscribe({
      next: (res: boolean) => {
        if (res) this.getAttachments();
      },
    });
  }

  onRowSelected(row: MatterAttachmentDto) {
    this.menuItems = [
      {
        label: this._languageService.getTransValue('matters.edit'),
        icon: 'icon-edit',
        visible: this._permissionService.hasPermission('Update_Matter_Documents'),
        command: () => this.openAttachmentEditor(row),
      },
      { separator: true },
      {
        label: this._languageService.getTransValue('matters.delete'),
        icon: 'icon-trash',
        visible: this._permissionService.hasPermission('Delete_Matter_Documents'),
        command: () => this.onDelete(row),
      },
    ];
  }

  onDelete(attachment: MatterAttachmentDto) {
    const isLinkedToHearingSession = attachment.isLinkedToHearingSession === true;
    const message = isLinkedToHearingSession
      ? 'This document is attached to a hearing session, deleting it will unlink it from the hearing session. Do you still want to delete it?'
      : this._languageService.getTransValue('matters.deleteAttachmentMessage');

    this.deleteDialogRef = this._dialogService.open(SharedConfirmDialogComponent, {
      modal: true,
      styleClass: 'w-[400px]',
      data: {
        type: ConfirmDialogType.Danger,
        title: this._languageService.getTransValue('matters.deleteAttachmentTitle', { value: attachment?.description }),
        message: message,
        btns: [
          {
            label: 'Discard',
            styleClass: 'border border-grey500 text-grey500',
            command: () => this.deleteDialogRef.close(),
          },
          {
            label: 'Delete',
            styleClass: 'bg-textErrorBase text-white',
            command: () => this.deleteAttachment(attachment.id),
          },
        ],
      },
    });
  }
openAttachment(attachment: any) {
  const ext = attachment.extension?.replace('.', '').toLowerCase() || '';
  const previewExtensions = ['pdf', 'png', 'jpg', 'jpeg', 'svg', 'gif', 'bmp', 'webp'];
  const canPreview = previewExtensions.includes(ext);

  if (canPreview) {
    this._fileService.downloadMatterDocument(attachment.id, true).subscribe({
      next: (response: any) => {
        const blob = new Blob([response.body], {
          type: response.headers.get('content-type') ?? 'application/octet-stream',
        });
        const blobUrl = window.URL.createObjectURL(blob);
        window.open(blobUrl, '_blank', 'noopener,noreferrer');
      },
      error: (err) => console.error('Preview failed:', err),
    });
  } else {
    this.downloadAttachment(attachment);
  }
}

downloadAttachment(file: any) {
  this._fileService.downloadMatterDocument(file.id, false).subscribe({
    next: (response: any) => {
      const blob = new Blob([response.body], {
        type: response.headers.get('content-type') ?? 'application/octet-stream',
      });
      const fileName = file.description
        ? `${file.description}${file.extension || ''}`
        : (file.originalFileName ?? `document_${file.id}`);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    },
    error: (err) => {
      console.error('Download failed:', err);
    },
  });
}


  private getAttachmentUrl(attachment: MatterAttachmentDto): string {
    return attachment.url || '';
  }

  openLink(attachment: MatterAttachmentDto): void {
    const url = this.getAttachmentUrl(attachment);

    if (!url) {
      console.error('No attachment URL found', attachment);
      return;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  }
  
  copyLink(attachment: MatterAttachmentDto): void {
    const url = this.getAttachmentUrl(attachment);

    if (!url) {
      console.error('No attachment URL found', attachment);
      return;
    }

    navigator.clipboard
      .writeText(url)
      .then(() => {
        console.log('Link copied successfully');
      })
      .catch((error) => {
        console.error('Failed to copy link', error);
      });
  }
  
  deleteAttachment(attachmentId: number) {
    const url = API_Config.matterDocuments.delete.replace('{id}', String(attachmentId));
    
    this._apiService
      .delete(url)
      .pipe(this._unsubscribeService.takeUntilDestroy())
      .subscribe({
        next: (res: any) => {
          const isSuccess = res?.success ?? res?.isSuccess;
          if (isSuccess) {
            if (this.data.length === 1) this.filterOptions.PageNumber--;
            this.getAttachments();
            this.deleteDialogRef.close();
          }
        },
      });
  }

  onPageChange(event: PaginatorState): void {
    this.filterOptions.PageSize = Number(event.rows);
    this.filterOptions.PageNumber = (event.first ?? 0) / (event.rows ?? 0) + 1;
    this.getAttachments();
  }

  ngOnDestroy(): void {
    this._unsubscribeService.destroy();
  }
}