import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { SharedModule } from 'src/app/@shared/shared.module';
import { matterActivityEditorFields } from './matter-activity-editor-formly.config';
import { combineLatest, finalize } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import {
  GLOBAL_DATE_TIME_Without_Seconds2_FORMATE,
} from 'src/app/@core/utilities/defines/date-time';
import { DatePipe } from '@angular/common';
import { SelectMatterDocumentsComponent } from 'src/app/@shared/components/bussiness/select-matter-documents/select-matter-documents.component';
import { FileService } from 'src/app/@shared/services/file/file.service';
import { HttpErrorResponse } from '@angular/common/http';
import { FieldTypeConfig } from '@ngx-formly/core';
import { findField } from 'src/app/@core/utilities/functions/find-field';

interface DocumentTracker {
  originalDocumentIds: string[];
  deletedDocumentIds: string[];
}

interface AttachmentItem {
  id?: string | number;
  __docId?: string | number;
  name?: string;
  fileName?: string;
  filePath?: string;
  isReference?: boolean;
  documentDate?: string;
  receivedDate?: string;
  description?: string;
  file?: File;
  _file?: File;
  blob?: Blob;
}

@Component({
  selector: 'app-matter-activity-editor',
  standalone: true,
  imports: [FormlyConfigModule, SharedButtonComponent, SharedModule],
  templateUrl: './matter-activity-editor.component.html',
  styleUrl: './matter-activity-editor.component.scss',
  providers: [DatePipe],
})
export class MatterActivityEditorComponent
  extends FormBaseClass
  implements OnInit, OnDestroy
{
  _datePipe = inject(DatePipe);
  _fileService = inject(FileService);
  _cdr = inject(ChangeDetectorRef);

  activityDetails: any = {};
  hearingAttachmentsFieldInstance: any;
  newSessionAttachmentsFieldInstance: any;
  isViewMode = false;
  isEditMode = false;
  mode!: string;

  hearingDocumentTracker: DocumentTracker = {
    originalDocumentIds: [],
    deletedDocumentIds: [],
  };

  newSessionDocumentTracker: DocumentTracker = {
    originalDocumentIds: [],
    deletedDocumentIds: [],
  };

  ngOnInit(): void {
    this.isLoading = true;
    this.isViewMode = this._dynamicDialogConfig?.data?.mode === 'view';
    this.isEditMode = !this.isViewMode;
    this.getLookupsData();
  }

  override getLookupsData(): void {
    combineLatest({
      activityType: this._apiService.get(API_Config.general.getActivityType),
      finalJudement: this._apiService.get(API_Config.general.getFinalJudgement),
      laywer: this._apiService.get(API_Config.responsibleLawyerSecurity.get),
      users: this._apiService.get(API_Config.general.getUsersLookup),
      activityStatus: this._apiService.get(
        API_Config.general.getActivityStatus
      ),
      adjournmentReasons: this._apiService.get(
        API_Config.general.getAdjournmentReasons
      ),
    })
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
        this._unsubscribe.takeUntilDestroy()
      )
      .subscribe({
        next: (res: any) => {
          this.lookupsData = res;
          this.initForm();
        },
      });
  }

  override initForm(): void {
    this.formlyFields = matterActivityEditorFields(this);
    this.formlyOptions.formState = {
      readonly: this.isViewMode,
    };
    this.setFormData();
  }

  transformDate(date: any): string | null {
    return date
      ? this._datePipe.transform(
          date,
          GLOBAL_DATE_TIME_Without_Seconds2_FORMATE
        )
      : null;
  }

  loadActivityTypeName(): void {
    if (!this.activityDetails?.law_ActivityTypeId) {
      console.warn('No law_ActivityTypeId found');
      return;
    }

    this._apiService
      .get('AppLookup/GetLaw_ActivityTypeModelLookup')
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: any) => {
          if (res?.isSuccess && Array.isArray(res.result)) {
            const foundType = res.result.find(
              (t: any) => t.id === this.activityDetails.law_ActivityTypeId
            );
            if (foundType) {
              this.formly.patchValue({
                law_ActivityType: foundType.name,
              });
            }
          }
        },
        error: (err) =>
          console.error('Error loading Law_ActivityType lookup:', err),
      });
  }

  mapUsersToSelect(userIds: string[]) {
    if (!userIds || !this.lookupsData?.users?.result) return [];

    return userIds.map(id => {
      const user = this.lookupsData.users.result.find(
        (u: any) => u.id === id
      );

      return {
        label: user?.name || 'Unknown',
        value: user?.id || id,
      };
    });
  }

  normalizeDate(val: any): Date | null {
    if (!val) return null;
    const d = new Date(val);
    if (isNaN(d.getTime())) return null;
    return new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      8, 0, 0, 0
    );
  }

  getDate(date: Date | string | null): string | null {
    if (!date) return null;
    let dateObj: Date;
    if (typeof date === 'string') {
      dateObj = new Date(date);
    } else {
      dateObj = date;
    }
    if (isNaN(dateObj.getTime())) return null;
    return new Date(
      Date.UTC(
        dateObj.getFullYear(),
        dateObj.getMonth(),
        dateObj.getDate(),
        dateObj.getHours(),
        dateObj.getMinutes(),
      ),
    ).toISOString();
  }

  switchToEditMode(): void {
    this.isViewMode = false;
    this.isEditMode = true;
    if (this.formly) {
      this.formly.enable();
    }
    this.formlyOptions.formState = {
      ...this.formlyOptions.formState,
      readonly: false
    };
    this._cdr.detectChanges();
  }


  private initializeDocumentTracking(rowData: any): void {
    if (Array.isArray(rowData?.linkedDocuments)) {
      this.hearingDocumentTracker.originalDocumentIds = rowData.linkedDocuments
        .filter((doc: any) => doc?.documentId != null)
        .map((doc: any) => String(doc.documentId));
    }
    if (Array.isArray(rowData?.newSession?.linkedDocuments)) {
      this.newSessionDocumentTracker.originalDocumentIds =
        rowData.newSession.linkedDocuments
          .filter((doc: any) => doc?.documentId != null)
          .map((doc: any) => String(doc.documentId));
    }
  }

  private getCurrentReferenceDocumentIds(
    fieldInstance: any,
    fallbackAttachments: any[] = [],
  ): string[] {
    const ids = fieldInstance?.getExistingDocumentIds?.();
    if (Array.isArray(ids) && ids.length > 0) {
      return ids.filter((id) => id != null).map((id) => String(id));
    }
    return (fallbackAttachments || [])
      .filter((f: any) => f?.isReference && f?.documentId != null)
      .map((f: any) => String(f.documentId));
  }


  openSelectMatterDocuments() {
    const matterId =
      this.formlyModel?.law_MatterId ||
      this._dynamicDialogConfig?.data?.matterIdentifier;

    if (!matterId) {
      this._toastrNotifiService.displayError(
        this._languageService.getTransValue('timesheet.selectMatterFirst'),
      );
      return;
    }

    const currentAttachments = this.formlyModel?.attachments || [];

    const currentSelectedIds = currentAttachments
      .filter(
        (f: any) => f?.isReference && (f?.documentId != null || f?.id != null),
      )
      .map((f: any) => String(f.documentId ?? f.id));

    const ref = this._dialogService.open(SelectMatterDocumentsComponent, {
      header: this._languageService.getTransValue('matters.selectFromMatter'),
      width: '800px',
      data: {
        matterId,
        selectedIds: currentSelectedIds,
      },
      styleClass: 'p-fluid',
    });

    ref.onClose.subscribe((selectedDocs: any[]) => {
      if (!Array.isArray(selectedDocs)) {
        return;
      }

      this.syncSelectedDocuments(selectedDocs, 'attachments');
      this._cdr.detectChanges();
    });
  }

  // ============================================================
  // SELECT MATTER DOCUMENTS - NEW SESSION
  // ============================================================
  openSelectMatterDocumentsForNewSession() {
    const matterId =
      this.formlyModel?.law_MatterId ||
      this._dynamicDialogConfig?.data?.matterIdentifier;

    if (!matterId) {
      this._toastrNotifiService.displayError(
        this._languageService.getTransValue('timesheet.selectMatterFirst'),
      );
      return;
    }

    const currentAttachments =
      this.formlyModel?.newSession?.newSessionAttachments || [];

    const currentSelectedIds = currentAttachments
      .filter(
        (f: any) => f?.isReference && (f?.documentId != null || f?.id != null),
      )
      .map((f: any) => String(f.documentId ?? f.id));

    const ref = this._dialogService.open(SelectMatterDocumentsComponent, {
      header: this._languageService.getTransValue('matters.selectFromMatter'),
      width: '800px',
      data: {
        matterId,
        selectedIds: currentSelectedIds,
      },
      styleClass: 'p-fluid',
    });

    ref.onClose.subscribe((selectedDocs: any[]) => {
      if (!Array.isArray(selectedDocs)) {
        return;
      }

      this.syncSelectedDocuments(selectedDocs, 'newSessionAttachments');
      this._cdr.detectChanges();
    });
  }

  // ============================================================
  // SYNC SELECTED DOCUMENTS
  // ============================================================
  private syncSelectedDocuments(
    docs: any[],
    attachmentFieldName: 'attachments' | 'newSessionAttachments',
  ): void {
    // ============================================================
    // HEARING ATTACHMENTS
    // ============================================================
    if (attachmentFieldName === 'attachments') {
      const current = this.formlyModel?.attachments || [];
      const localFiles = current.filter((f: any) => !f?.isReference);
      const existingReferenceFiles = current.filter((f: any) => f?.isReference);
      const selectedReferenceFiles = (docs || [])
        .filter((d: any) => d?.documentId != null || d?.id != null)
        .map((d: any) => {
          const documentId = String(d.documentId ?? d.id);
          const fileName =
            d.fileName || d.name || d.documentName || `document_${documentId}`;

          return {
            id: documentId,
            documentId: documentId,
            __docId: documentId,
            name: fileName,
            fileName: fileName,
            originalFileName: fileName,
            isReference: true,
            filePath: d.filePath || null,
            documentDate: d.documentDate || null,
            receivedDate: d.receivedDate || null,
            description: d.description || '',
            file: null,
          };
        });

      const selectedIds = new Set(
        selectedReferenceFiles.map((doc: any) => String(doc.documentId)),
      );
      const remainingExistingReferences = existingReferenceFiles.filter(
        (existing: any) => {
          const id = existing?.documentId ?? existing?.id ?? existing?.__docId;
          if (id == null) {
            return false;
          }
          return selectedIds.has(String(id));
        },
      );

      const referenceMap = new Map<string, any>();

      remainingExistingReferences.forEach((doc: any) => {
        const id = String(doc.documentId ?? doc.id ?? doc.__docId);
        referenceMap.set(id, doc);
      });

      selectedReferenceFiles.forEach((doc: any) => {
        const id = String(doc.documentId);
        referenceMap.set(id, doc);
      });

      const mergedReferences = Array.from(referenceMap.values());
      const updated = [...localFiles, ...mergedReferences];

      // Update model
      this.formlyModel = {
        ...this.formlyModel,
        attachments: updated,
      };

   
      const control = this.formly?.get('attachments');
      if (control) {
        control.setValue(updated);
        control.updateValueAndValidity();
      }

      setTimeout(() => {
        if (this.hearingAttachmentsFieldInstance?.setReferenceDocuments) {
          const referenceDocuments = updated.filter(
            (file: any) => file?.isReference === true,
          );
          this.hearingAttachmentsFieldInstance.setReferenceDocuments(
            referenceDocuments,
          );
        }
      });
    }
    // ============================================================
    // NEW SESSION ATTACHMENTS
    // ============================================================
    else {
      const current = this.formlyModel?.newSession?.newSessionAttachments || [];

      const localFiles = current.filter((f: any) => !f?.isReference);

      const existingReferenceFiles = current.filter((f: any) => f?.isReference);

      const selectedReferenceFiles = (docs || [])
        .filter((d: any) => d?.documentId != null || d?.id != null)
        .map((d: any) => {
          const documentId = String(d.documentId ?? d.id);
          const fileName =
            d.fileName || d.name || d.documentName || `document_${documentId}`;

          return {
            id: documentId,
            documentId: documentId,
            __docId: documentId,
            name: fileName,
            fileName: fileName,
            originalFileName: fileName,
            isReference: true,
            filePath: d.filePath || null,
            documentDate: d.documentDate || null,
            receivedDate: d.receivedDate || null,
            description: d.description || '',
            file: null,
          };
        });

      const selectedIds = new Set(
        selectedReferenceFiles.map((doc: any) => String(doc.documentId)),
      );
      const remainingExistingReferences = existingReferenceFiles.filter(
        (existing: any) => {
          const id = existing?.documentId ?? existing?.id ?? existing?.__docId;
          if (id == null) {
            return false;
          }
          return selectedIds.has(String(id));
        },
      );
      const referenceMap = new Map<string, any>();

      remainingExistingReferences.forEach((doc: any) => {
        const id = String(doc.documentId ?? doc.id ?? doc.__docId);
        referenceMap.set(id, doc);
      });

      selectedReferenceFiles.forEach((doc: any) => {
        const id = String(doc.documentId);
        referenceMap.set(id, doc);
      });

      const mergedReferences = Array.from(referenceMap.values());
      const updated = [...localFiles, ...mergedReferences];
      this.formlyModel = {
        ...this.formlyModel,
        newSession: {
          ...this.formlyModel?.newSession,
          newSessionAttachments: updated,
        },
      };
      setTimeout(() => {
        if (this.newSessionAttachmentsFieldInstance?.setReferenceDocuments) {
          const referenceDocuments = updated.filter(
            (file: any) => file?.isReference === true,
          );
          this.newSessionAttachmentsFieldInstance.setReferenceDocuments(
            referenceDocuments,
          );
        }
      });
    }

    this._cdr.detectChanges();
  }

  // ============================================================
  // LOAD EXISTING DATA (EDIT)
  // ============================================================
  // setFormData() {
  //   const rowData = this._dynamicDialogConfig?.data?.rowData;

  //   if (rowData?.id) {
  //     const param = { id: rowData.id };
  //     this._apiService
  //       .get(API_Config.matterActivity.getById, param)
  //       .pipe(this._unsubscribe.takeUntilDestroy())
  //       .subscribe({
  //         next: (res: ApiRes) => {
  //           if (res && res.isSuccess) {
  //             const result = res.result;

  //             const linkedDocuments = Array.isArray(result?.linkedDocuments)
  //               ? result.linkedDocuments
  //               : [];

  //             const mappedDocs = linkedDocuments.map((doc: any) => {
  //               const fileName =
  //                 doc.fileName ||
  //                 doc.originalFileName ||
  //                 doc.documentName ||
  //                 this.extractFileNameFromUrl(doc.filePath) ||
  //                 `document_${doc.documentId}`;
  //               return {
  //                 id: doc.documentId,
  //                 documentId: doc.documentId,
  //                 __docId: doc.documentId,
  //                 name: fileName,
  //                 fileName,
  //                 originalFileName: fileName,
  //                 filePath: doc.filePath,
  //                 isReference: true,
  //                 documentDate: doc.documentDate,
  //                 receivedDate: doc.receivedDate,
  //                 description: doc.description || '',
  //                 file: null,
  //               };
  //             });

  //             this.formlyModel = {
  //               ...result,
  //               startDate: result.startDate ? new Date(result.startDate) : null,
  //               endDate: result.endDate ? new Date(result.endDate) : null,
  //               users: this.mapUsersToSelect(result.users),
  //               newSession: result?.newSession
  //                 ? {
  //                     ...result.newSession,
  //                     startDate: this.transformDate(
  //                       result.newSession.startDate,
  //                     ),
  //                     newSessionAttachments: Array.isArray(
  //                       result.newSession.linkedDocuments,
  //                     )
  //                       ? result.newSession.linkedDocuments.map((doc: any) => {
  //                           const documentId = String(doc.documentId ?? doc.id);
  //                           const fileName =
  //                             doc.fileName ||
  //                             doc.originalFileName ||
  //                             doc.documentName ||
  //                             this.extractFileNameFromUrl(doc.filePath) ||
  //                             `document_${documentId}`;

  //                           return {
  //                             id: documentId,
  //                             documentId: documentId,
  //                             __docId: documentId,
  //                             name: fileName,
  //                             fileName: fileName,
  //                             originalFileName: fileName,
  //                             filePath: doc.filePath || null,
  //                             isReference: true,
  //                             documentDate: doc.documentDate || null,
  //                             receivedDate: doc.receivedDate || null,
  //                             description: doc.description || '',
  //                             file: null,
  //                           };
  //                         })
  //                       : [],
  //                   }
  //                 : null,
  //               attachments: mappedDocs,
  //             };

  //             setTimeout(() => {
  //               if (
  //                 this.hearingAttachmentsFieldInstance?.setReferenceDocuments
  //               ) {
  //                 this.hearingAttachmentsFieldInstance.setReferenceDocuments(
  //                   mappedDocs,
  //                 );
  //               }
  //             }, 100);

  //             this.initializeDocumentTracking(result);
  //             this.activityDetails = result;
  //             if (this.isViewMode) {
  //               setTimeout(() => {
  //                 if (this.formly) {
  //                   this.formly.disable();
  //                 }
  //                 this.formlyOptions.formState = {
  //                   ...this.formlyOptions.formState,
  //                   readonly: true
  //                 };
  //                 this._cdr.detectChanges();
  //               }, 50);
  //             }

  //             this.loadActivityTypeName();
  //           }
  //         },
  //         error: (err) => console.error('Error loading matter activity:', err),
  //       });
  //   } else {
  //     this.getMatterCodeByMatterId();
  //   }
  // }
  setFormData() {
  const rowData = this._dynamicDialogConfig?.data?.rowData;

  this.isEditMode = !!rowData?.id;
  this.mode = this._dynamicDialogConfig.data.mode;

  this.formlyOptions.formState = {
    readonly: this.mode === 'view',
  };

  if (rowData?.id) {
    const param = { id: rowData.id };

    this._apiService
      .get(API_Config.taskManagementCalender.getById, param)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res && res.isSuccess) {
            const result = res.result;

            const activityType =
              this.lookupsData.activityType.result.find(
                (obj: any) => obj.id === result?.law_ActivityTypeId,
              )?.name;

            const linkedDocuments = Array.isArray(result?.linkedDocuments)
              ? result.linkedDocuments
              : [];

            const mappedDocs = linkedDocuments.map((doc: any) => {
              const fileName =
                doc.fileName ||
                doc.originalFileName ||
                doc.documentName ||
                this.extractFileNameFromUrl(doc.filePath) ||
                `document_${doc.documentId}`;

              return {
                id: doc.documentId,
                documentId: doc.documentId,
                __docId: doc.documentId,
                name: fileName,
                fileName,
                originalFileName: fileName,
                filePath: doc.filePath,
                isReference: true,
                documentDate: doc.documentDate,
                receivedDate: doc.receivedDate,
                description: doc.description || '',
                file: null,
              };
            });

            this.formlyModel = {
              ...result,

              law_ActivityType: activityType,

              startDate: result.startDate
                ? new Date(result.startDate)
                : null,

              endDate: result.endDate
                ? new Date(result.endDate)
                : null,

              newSession: result?.newSession
                ? {
                    ...result.newSession,

                    startDate: this.transformDate(
                      result.newSession.startDate,
                    ),

                    newSessionAttachments: Array.isArray(
                      result.newSession.linkedDocuments,
                    )
                      ? result.newSession.linkedDocuments.map((doc: any) => {
                          const documentId = String(
                            doc.documentId ?? doc.id,
                          );

                          const fileName =
                            doc.fileName ||
                            doc.originalFileName ||
                            doc.documentName ||
                            this.extractFileNameFromUrl(doc.filePath) ||
                            `document_${documentId}`;

                          return {
                            id: documentId,
                            documentId,
                            __docId: documentId,
                            name: fileName,
                            fileName,
                            originalFileName: fileName,
                            filePath: doc.filePath || null,
                            isReference: true,
                            documentDate: doc.documentDate || null,
                            receivedDate: doc.receivedDate || null,
                            description: doc.description || '',
                            file: null,
                          };
                        })
                      : [],
                  }
                : null,

              attachments: mappedDocs,
            };

            setTimeout(() => {
              if (
                this.hearingAttachmentsFieldInstance
                  ?.setReferenceDocuments
              ) {
                this.hearingAttachmentsFieldInstance.setReferenceDocuments(
                  mappedDocs,
                );
              }
            }, 100);

            this.initializeDocumentTracking(result);

            this.setFieldSelectedObj(
              'law_MatterId',
              'matterCode',
            );

            this.setFieldSelectedObj(
              'law_ActivityTypeId',
              'activityType',
            );

            this.setFieldSelectedObj(
              'law_ActivityStatusId',
              'activityStatus',
            );

            this.setFieldSelectedObj(
              'litigatorId',
              'laywer',
            );

            this.setFieldSelectedObj(
              'law_FinalJudgementId',
              'finalJudement',
            );

            this.setFieldSelectedObj(
              'law_AdjournmentReasonsId',
              'adjournmentReasons',
            );
                 const usersField: FieldTypeConfig = findField(
                this.formlyFields,
                'users'
              );
              if (this.formlyModel?.users && usersField) {
                usersField.props['selectedObj'] = this.setUsersValue();
                this.formlyModel.users = this.setUsersValue();
                console.log('this.setUsersValue()', this.setUsersValue());
              }
            this.getMatterCodeByMatterId();
          }
        },
      });
  } else {
    this.getMatterCodeByMatterId();
  }
}

  setUsersValue() {
    const selectedUsers = this.lookupsData?.users?.result.filter((obj: any) =>
      this.formlyModel?.users.includes(obj.id)
    );

    if (!selectedUsers) return null;
    return selectedUsers.map((obj: any) => ({
      label: obj?.name,
      value: obj?.id,
    }));
  }

  setFieldSelectedObj(
    key: string,
    lookupPath: string,
    idProp: string = 'id',
    labelProp: string = 'name',
  ): void {
    const field: FieldTypeConfig = findField(this.formlyFields, key);
    const modelValue = this.formlyModel?.[key];
    if (field && modelValue) {
      const lookupData = this.lookupsData?.[lookupPath]?.result;
      const selected = lookupData?.find(
        (obj: any) => obj[idProp] == modelValue,
      );
      if (selected) {
        field.props['selectedObj'] = {
          label: selected[labelProp],
          value: selected[idProp],
        };
      }
    }
  }
  // ============================================================
  // FILE EXTRACTION
  // ============================================================
  private extractFile(item: AttachmentItem | File): File | null {
    if (!item) return null;
    if (item instanceof File) return item;
    if (item.file instanceof File) return item.file;
    if (item._file instanceof File) return item._file;
    if (item.blob instanceof Blob) {
      return new File([item.blob], item.name || 'file.blob', {
        type: item.blob.type,
      });
    }
    return null;
  }

  private extractFileNameFromUrl(url: string): string {
    if (!url) return 'file';
    try {
      const cleanUrl = String(url).split('?')[0];
      const segments = cleanUrl.split('/');
      const lastSegment = segments[segments.length - 1];
      return decodeURIComponent(lastSegment || 'file');
    } catch (e) {
      console.warn('Error extracting file name from URL:', url);
      return 'file';
    }
  }

  // ============================================================
  // FORM DATA CREATION
  // ============================================================
  private appendValueToFormData(
    formData: FormData,
    key: string,
    value: any,
  ): void {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item != null) formData.append(key, String(item));
      });
    } else if (value instanceof Date) {
      formData.append(key, this.getDate(value) || '');
    } else if (typeof value === 'object' && !(value instanceof File)) {
      formData.append(key, JSON.stringify(value));
    } else if (value != null) {
      formData.append(key, String(value));
    }
  }

  private createFullFormData(
    payload: any,
    hearingFiles: AttachmentItem[],
    newSessionFiles: AttachmentItem[],
  ): FormData {
    const formData = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
      if (value == null) return;
      if (key === 'newSession' && typeof value === 'object') {
        Object.entries(value).forEach(([subKey, subValue]) => {
          if (subValue == null) return;
          if (subKey.toLowerCase().includes('attachment') || subKey === 'file')
            return;
          const paramKey = `NewSession.${subKey}`;
          if (['DocumentDate', 'ReceivedDate', 'startDate'].includes(subKey)) {
            let dateStr: string;
            if (typeof subValue === 'string') dateStr = subValue;
            else if (subValue instanceof Date)
              dateStr =
                this.getDate(subValue) ||
                new Date().toISOString().split('T')[0];
            else dateStr = String(subValue);
            formData.append(paramKey, dateStr);
            return;
          }
          this.appendValueToFormData(formData, paramKey, subValue);
        });
        return;
      }
      if (key.toLowerCase().includes('attachment') || key === 'file') return;
      this.appendValueToFormData(formData, key, value);
    });

    hearingFiles.forEach((item) => {
      const file = this.extractFile(item);
      if (file) formData.append('Attachments', file, file.name);
    });

    newSessionFiles.forEach((item) => {
      const file = this.extractFile(item);
      if (file) formData.append('NewSession.Attachments', file, file.name);
    });

    return formData;
  }

  private createUpdateFormData(
    payload: any,
    hearingFiles: AttachmentItem[],
    newSessionFiles: AttachmentItem[],
  ): FormData {
    const formData = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
      if (value == null) return;
      if (key === 'newSession') return;
      if (key.toLowerCase().includes('attachment') || key === 'file') return;
      this.appendValueToFormData(formData, key, value);
    });

    if (payload.newSession) {
      Object.entries(payload.newSession).forEach(([key, value]) => {
        if (value == null) return;
        if (key.toLowerCase().includes('attachment') || key === 'file') return;
        const paramKey = `NewSession.${key}`;
        this.appendValueToFormData(formData, paramKey, value);
      });
    }

    hearingFiles.forEach((item) => {
      const file = this.extractFile(item);
      if (file) formData.append('Attachments', file, file.name);
    });

    newSessionFiles.forEach((item) => {
      const file = this.extractFile(item);
      if (file) formData.append('NewSession.Attachments', file, file.name);
    });

    return formData;
  }

  // ============================================================
  // SUBMIT
  // ============================================================
  override onSubmit(): void {
    if (this.formly.invalid) return;

    this.isLoading = true;
    const rowData = this._dynamicDialogConfig?.data?.rowData;
    const isEdit = !!rowData?.id;

    if (this.formlyModel.activityStartDate) {
      this.formlyModel.startDate = this.formlyModel.activityStartDate;
    }
    const hearingAttachments = this.formlyModel?.attachments || [];
    const hearingFilesForPayload = hearingAttachments.filter(
      (f: any) => !f?.isReference,
    );

    const hearingExistingIds = hearingAttachments
      .filter((f: any) => f?.isReference)
      .map((f: any) => f?.documentId ?? f?.id ?? f?.__docId)
      .filter((id: any) => id != null)
      .map((id: any) => String(id));

    const currentHearingIds = this.getCurrentReferenceDocumentIds(
      this.hearingAttachmentsFieldInstance,
      hearingAttachments,
    );
    const deletedHearingIds =
      this.hearingDocumentTracker.originalDocumentIds.filter(
        (id) => !currentHearingIds.includes(id),
      );

    // ============ New session ============
    const newSessionModel = this.formlyModel?.newSession || {};
    const newSessionAttachments = newSessionModel.newSessionAttachments || [];
    const newSessionFilesForPayload = newSessionAttachments.filter(
      (f: any) => !f?.isReference,
    );
    const newSessionExistingIds = newSessionAttachments
      .filter((f: any) => f?.isReference)
      .map((f: any) => f?.documentId ?? f?.id ?? f?.__docId)
      .filter((id: any) => id != null)
      .map((id: any) => String(id));

    const currentNewSessionIds = this.getCurrentReferenceDocumentIds(
      this.newSessionAttachmentsFieldInstance,
      newSessionAttachments,
    );
    const deletedNewSessionIds =
      this.newSessionDocumentTracker.originalDocumentIds.filter(
        (id) => !currentNewSessionIds.includes(id),
      );

    const { attachments, ...restModel } = this.formlyModel;

    let newSessionData: any = null;
    if (this.formlyModel?.newSession || this.formlyModel?.isNewHearingSession) {
      newSessionData = {
        ...this.formlyModel?.newSession,
        DocumentDate: new Date().toISOString().split('T')[0],
        ReceivedDate: new Date().toISOString().split('T')[0],
        DocumentDescription: this.formlyModel?.newdocumentDescription || '',
        ExistingDocumentIds: newSessionExistingIds,
        DeletedDocumentIds: deletedNewSessionIds,
      };
    }

    const requestPayload = {
      ...restModel,
      litigatorId: this.formlyModel?.litigatorId?.toString(),
      startDate: this.getDate(this.formlyModel?.startDate),
      endDate: this.getDate(this.formlyModel?.endDate),
      existingDocumentIds: hearingExistingIds,
      deletedDocumentIds: deletedHearingIds,
      newSession: newSessionData,
      ...(isEdit
        ? { id: rowData.id }
        : { Law_MatterId: this._dynamicDialogConfig?.data?.matterIdentifier }),
      users: Array.isArray(this.formlyModel?.users)
        ? this.formlyModel.users.map((u: any) => u.value)
        : [],
    };

    const path = isEdit
      ? API_Config.matterActivity.update
      : API_Config.matterActivity.create;

    let formData: FormData;
    if (isEdit) {
      formData = this.createUpdateFormData(
        requestPayload,
        hearingFilesForPayload,
        newSessionFilesForPayload,
      );
    } else {
      formData = this.createFullFormData(
        requestPayload,
        hearingFilesForPayload,
        newSessionFilesForPayload,
      );
    }

    this._apiService
      .post(path, formData)
      .pipe(
        finalize(() => (this.isLoading = false)),
        this._unsubscribe.takeUntilDestroy(),
      )
      .subscribe({
        next: (res: ApiRes) => {
          if (res?.isSuccess) {
            this._toastrNotifiService.displaySuccess(res.message);
            this._dynamicDialogRef.close(true);
          } else {
            this._toastrNotifiService.displayError(res.message);
          }
        },
        error: (err: any) => {
          this._toastrNotifiService.displayError(err?.error?.message);
        },
      });
  }

  // ============================================================
  // FILE OPERATIONS
  // ============================================================

downloadFile(attachment: any) {
  if (!attachment) {
    console.warn('MatterActivityEditor: No attachment provided');
    this._toastrNotifiService.displayError('No attachment selected');
    return;
  }
  if (attachment?.isReference) {
    const documentId = attachment?.id || attachment?.__docId;
    
    if (documentId) {
      console.log('Downloading reference document:', documentId);
      
      this._fileService
        .downloadDocument(documentId)
        .subscribe({
          next: (res: any) => {
            const blob = res.body;
            const filename =
              this.extractFilenameFromContentDisposition(
                res.headers.get('content-disposition')
              ) || attachment.fileName || `document_${documentId}`;
            
            this.triggerDownload(blob, filename);
          },
          error: (err: HttpErrorResponse) => {
            console.error('Download API error:', err);
            
            if (attachment?.filePath) {
              console.log('Falling back to direct path download');
              this._fileService.downloadFileFromPath(
                attachment.filePath,
                attachment.fileName || 'file'
              );
            } else {
              this._toastrNotifiService.displayError('Could not download document');
            }
          }
        });
    }
    else if (attachment?.filePath) {
      console.log('Downloading from filePath');
      this._fileService.downloadFileFromPath(
        attachment.filePath,
        attachment.fileName || 'file'
      );
    }
    else {
      console.warn('No download method available for attachment:', attachment);
      this._toastrNotifiService.displayError('Cannot download: missing file information');
    }
  }
  else if (attachment?.file instanceof File) {
    console.log('Downloading local file:', attachment.file.name);
    this._fileService.downloadFile(attachment.file);
  }
  else if (attachment?.blob instanceof Blob) {
    console.log('Downloading blob');
    this.triggerDownload(
      attachment.blob,
      attachment.name || 'download'
    );
  }
  else {
    console.warn('Unknown attachment type:', attachment);
    this._toastrNotifiService.displayError('Cannot determine file type');
  }
}

private extractFilenameFromContentDisposition(contentDisposition: string | null): string | null {
  if (!contentDisposition) return null;

  try {
    const matches = contentDisposition.match(/filename="?(.+?)"?(?:;|$)/);
    if (matches && matches[1]) {
      return decodeURIComponent(matches[1]);
    }
  } catch (e) {
    console.error('Error extracting filename:', e);
  }

  return null;
}

private triggerDownload(blob: Blob, fileName: string) {
  if (!fileName) {
    fileName = 'download';
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
}

// ============================================================
// Preview File
// ============================================================

previewFile(attachment: any) {
  if (!attachment) {
    console.warn('MatterActivityEditor: No attachment provided');
    return;
  }

  if (attachment?.isReference && attachment?.filePath) {
    console.log('Previewing from filePath');
    this._fileService.previewFileFromPath(attachment.filePath);
  }

  else if (attachment?.file instanceof File) {
    console.log('Previewing local file');
    this._fileService.previewFile(attachment.file);
  }

  else if (attachment?.blob instanceof Blob) {
    console.log('Previewing blob');
    const url = URL.createObjectURL(attachment.blob);
    window.open(url, '_blank');
  }
  else {
    console.warn('Cannot preview attachment:', attachment);
    this._toastrNotifiService.displayError('Cannot preview this file');
  }
}

  // ============================================================
  // UTILITY METHODS
  // ============================================================
  getMatterCodeByMatterId() {
    const param = {
      id: this._dynamicDialogConfig?.data?.matterIdentifier,
    };
    this._apiService
      .get(API_Config.matters.getMatterCodeByMatterId, param)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          this.formlyModel.mtrNo = res['result'].name;
          this.formlyModel = { ...this.formlyModel };
        },
      });
  }

  deleteItem(item: any) {
    this.formlyModel.users = this.formlyModel.users.filter(
      (obj: any) => obj.value != item.value,
    );
    this.formlyModel = { ...this.formlyModel };
  }

  syncStartDateValues() {
    const activityType = this.formly?.get('law_ActivityTypeId')?.value;
    let currentStartDate;

    if (activityType === 1) {
      currentStartDate = this.formly?.get('hearingStartDate')?.value;
    } else if (this.formly?.get('isNewHearingSession')?.value) {
      currentStartDate = this.formly?.get('newSessionStartDate')?.value;
    } else {
      currentStartDate = this.formly?.get('activityStartDate')?.value;
    }

    if (currentStartDate) {
      this.formly?.get('startDate')?.setValue(currentStartDate);
    }
  }

  ngOnDestroy() {
  }
}