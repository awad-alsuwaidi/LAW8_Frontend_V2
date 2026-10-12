import {
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';

import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiService } from 'src/app/@core/api/api.service';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { LanguageService, ToastrNotifiService } from 'src/app/@core/services';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-select-matter-documents',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TranslateModule
  ],
  templateUrl: './select-matter-documents.component.html',
  styleUrls: ['./select-matter-documents.component.scss'],
})
export class SelectMatterDocumentsComponent implements OnInit {
  private apiService = inject(ApiService);
  public ref = inject(DynamicDialogRef);
  public config = inject(DynamicDialogConfig);
  private _cdr = inject(ChangeDetectorRef);
  private _toastrNotifiService = inject(ToastrNotifiService);
  private _languageService = inject(LanguageService);

  documents: any[] = [];
  selectedDocs: any[] = [];

  ngOnInit(): void {
    console.log('[SelectMatterDocuments] === COMPONENT INIT ===');

    const matterId = this.config.data?.matterId;

    const preselectedIds: string[] = (
      this.config.data?.selectedIds || []
    )
      .map((id: string | number) => String(id))
      .filter(
        (id: string) =>
          id !== null &&
          id !== undefined &&
          id !== '',
      );

    console.log(
      '[SelectMatterDocuments] Matter ID:',
      matterId,
    );

    console.log(
      '[SelectMatterDocuments] Pre-selected IDs:',
      preselectedIds,
    );

    if (!matterId) {
      console.warn(
        '[SelectMatterDocuments] No Matter ID provided',
      );

      return;
    }

    this.loadDocuments(matterId, preselectedIds);
  }


  private getDocumentId(doc: any): string | null {
    const id = doc?.documentId ?? doc?.id;

    if (
      id === null ||
      id === undefined ||
      id === ''
    ) {
      return null;
    }

    return String(id);
  }


  getFileName(doc: any): string {
    return (
      doc?.description ||
      doc?.fileName ||
      doc?.name ||
      doc?.documentName ||
      `document_${
        this.getDocumentId(doc) || 'unknown'
      }`
    );
  }

  trackByDocumentId(
    index: number,
    doc: any,
  ): string {
    return String(
      doc?.documentId ??
        doc?.id ??
        index,
    );
  }

  private loadDocuments(
    matterId: number,
    preselectedIds: string[],
  ): void {
    console.log(
      '[SelectMatterDocuments] Loading documents for matter:',
      matterId,
    );

    const params = {
      matterId,
      pagSize: 999999,
      pageNumber: 1,
    };

    this.apiService
      .get(API_Config.matterDocuments.get, params)
      .subscribe({
        next: (res: ApiRes) => {
          console.log(
            '[SelectMatterDocuments] API Response:',
            res,
          );

          if (!res?.isSuccess) {
            console.error(
              '[SelectMatterDocuments] API response not successful',
            );

            return;
          }

          let data =
            res.result?.dataList ||
            res.result?.items ||
            res.result?.data ||
            res.result;

          if (!Array.isArray(data)) {
            data = data ? [data] : [];
          }

          this.documents = data.map((doc: any) => ({
            ...doc,
            documentId:
              doc?.documentId ?? doc?.id,
          }));

          console.log(
            '[SelectMatterDocuments] Total documents loaded:',
            this.documents.length,
          );

          console.log(
            '[SelectMatterDocuments] First normalized document:',
            this.documents[0],
          );

          this.selectedDocs =
            this.documents.filter((doc: any) => {
              const documentId =
                this.getDocumentId(doc);

              return (
                documentId !== null &&
                preselectedIds.includes(documentId)
              );
            });

          console.log(
            '[SelectMatterDocuments] Pre-selected documents count:',
            this.selectedDocs.length,
          );

          console.log(
            '[SelectMatterDocuments] Pre-selected document IDs:',
            this.selectedDocs.map(
              (doc: any) =>
                this.getDocumentId(doc),
            ),
          );

          this._cdr.detectChanges();
        },

        error: (err) => {
          console.error(
            '[SelectMatterDocuments] Error loading matter documents:',
            err,
          );

          this._toastrNotifiService?.displayError?.(
            'Error loading documents',
          );
        },
      });
  }

  
  isSelected(doc: any): boolean {
    const documentId =
      this.getDocumentId(doc);

    if (documentId === null) {
      return false;
    }

    return this.selectedDocs.some(
      (selectedDoc: any) =>
        this.getDocumentId(selectedDoc) ===
        documentId,
    );
  }

  isAllSelected(): boolean {
    return (
      this.documents.length > 0 &&
      this.selectedDocs.length ===
        this.documents.length
    );
  }

  toggleSelection(doc: any): void {
    const documentId =
      this.getDocumentId(doc);

    if (documentId === null) {
      console.warn(
        '[SelectMatterDocuments] Document has no ID:',
        doc,
      );

      return;
    }

    const currentlySelected =
      this.isSelected(doc);

    if (currentlySelected) {
      this.selectedDocs =
        this.selectedDocs.filter(
          (selectedDoc: any) =>
            this.getDocumentId(selectedDoc) !==
            documentId,
        );
    } else {
      this.selectedDocs = [
        ...this.selectedDocs,
        doc,
      ];
    }

    this._cdr.detectChanges();
  }

  toggleAll(event: Event): void {
    const checkbox =
      event.target as HTMLInputElement;

    const checked = checkbox.checked;

    this.selectedDocs = checked
      ? [...this.documents]
      : [];

    this._cdr.detectChanges();
  }


  addSelected(): void {
    if (
      !this.selectedDocs ||
      this.selectedDocs.length === 0
    ) {
      console.warn(
        '[SelectMatterDocuments] No documents selected',
      );

      return;
    }

    const docsToReturn =
      this.selectedDocs.map((doc: any) => {
        const documentId =
          this.getDocumentId(doc);

        const fileName =
          this.getFileName(doc);

        return {
          ...doc,
          documentId,
          fileName,
          filePath:
            doc?.filePath || null,
          documentDate:
            doc?.documentDate || null,
          receivedDate:
            doc?.receivedDate || null,
          description:
            doc?.description || '',
        };
      });

    console.log(
      '[SelectMatterDocuments] Returning documents:',
      docsToReturn,
    );

    console.log(
      '[SelectMatterDocuments] Returning IDs:',
      docsToReturn.map(
        (doc: any) => doc.documentId,
      ),
    );

    this.ref.close(docsToReturn);
  }

  close(): void {
    this.ref.close();
  }
}