import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { combineLatest, finalize } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { SharedModule } from 'src/app/@shared/shared.module';
import { taskManagementActivityEditorFields } from './task-management-activity-editor-formly.config';
import { FieldTypeConfig } from '@ngx-formly/core';
import { findField } from 'src/app/@core/utilities/functions/find-field';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { GLOBAL_DATE_TIME_Without_Seconds2_FORMATE } from 'src/app/@core/utilities/defines/date-time';
import { DatePipe } from '@angular/common';
import { SharedSkeletonGridComponent } from 'src/app/@shared/components/shared-skeleton-grid/shared-skeleton-grid.component';
import { SelectMatterDocumentsComponent } from 'src/app/@shared/components/bussiness/select-matter-documents/select-matter-documents.component';
import { FileService } from 'src/app/@shared/services/file/file.service';

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
  selector: 'app-task-management-activity-editor',
  standalone: true,
  imports: [
    FormlyConfigModule,
    SharedButtonComponent,
    SharedModule,
    ProgressSpinnerModule,
    SharedSkeletonGridComponent,
  ],
  templateUrl: './task-management-activity-editor.component.html',
  styleUrl: './task-management-activity-editor.component.scss',
  providers: [DatePipe],
})
export class TaskManagementActivityEditorComponent
  extends FormBaseClass
  implements OnInit, OnDestroy
{
  mode!: string;
  _datePipe = inject(DatePipe);
  _fileService = inject(FileService);
  _cdr = inject(ChangeDetectorRef);
  liveDateIntervals: Record<string, any> = {};
  selectedMatterDocIds: (string | number)[] = [];
  hearingAttachmentsFieldInstance: any;
  newSessionAttachmentsFieldInstance: any;
  isEditMode = false;
  isNewSessionHearingTimeChanged = false;

  hearingDocumentTracker: DocumentTracker = {
    originalDocumentIds: [],
    deletedDocumentIds: [],
  };

  newSessionDocumentTracker: DocumentTracker = {
    originalDocumentIds: [],
    deletedDocumentIds: [],
  };
private isProgrammaticMatterUpdate = false;
private lastMatterId: any = null;
  
ngOnInit(): void {
  this.getLookupsData();

  this.formly.valueChanges
    .pipe(this._unsubscribe.takeUntilDestroy())
    .subscribe((v: any) => {
      if (this.isProgrammaticMatterUpdate) return;
      if (v?.law_MatterId === this.lastMatterId) return;
      this.lastMatterId = v?.law_MatterId;
      this.resetAttachmentsOnMatterChange();
    });
}
  override getLookupsData(): void {
    this.isLoading = true;
    combineLatest({
      activityType: this._apiService.get(API_Config.general.getActivityType),
      finalJudement: this._apiService.get(API_Config.general.getFinalJudgement),
      laywer: this._apiService.get(API_Config.responsibleLawyerSecurity.get),
      activityStatus: this._apiService.get(
        API_Config.general.getActivityStatus,
      ),
      adjournmentReasons: this._apiService.get(
        API_Config.general.getAdjournmentReasons,
      ),
      matterCode: this._apiService.get(API_Config.general.getMatterCodes),
      users: this._apiService.get(API_Config.general.getUsersLookup),
      assigneeLawyers: this._apiService.get(API_Config.general.getLawyerShort),
      taskPriority: this._apiService.get(API_Config.general.getTaskPriority),
    })
      .pipe(
        finalize(() => (this.isLoading = false)),
        this._unsubscribe.takeUntilDestroy(),
      )
      .subscribe({
        next: (res: any) => {
          this.lookupsData = res;
          if (this._router.url.includes('activity')) {
            this.lookupsData.activityType.result =
              this.lookupsData.activityType.result.filter(
                (obj: any) => obj.id !== 1 && obj.id !== 9 && obj.id !== 2,
              );
          }
          this.initForm();
        },
      });
  }

  override initForm(): void {
    this.formlyFields = taskManagementActivityEditorFields(this);
    this.setFormData();
  }

  onEdit() {
    this.formlyOptions.formState.readonly = false;
    this._dynamicDialogConfig.header = this._languageService.getTransValue(
      'matters.editContact',
    );
  }

  setUsersValue() {
    const selectedUsers = this.lookupsData?.users?.result.filter((obj: any) =>
      this.formlyModel?.users.includes(obj.id),
    );
    if (!selectedUsers) return null;
    return selectedUsers.map((obj: any) => ({
      label: obj?.name,
      value: obj?.id,
    }));
  }
  

  transformDate(date: any): string | null {
    return date
      ? this._datePipe.transform(
          date,
          GLOBAL_DATE_TIME_Without_Seconds2_FORMATE,
        )
      : null;
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

  normalizeDate(val: any): Date | null {
    if (!val) return null;
    const d = new Date(val);
    if (isNaN(d.getTime())) return null;
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 8, 0, 0, 0);
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

  deleteItem(item: any) {
    this.formlyModel.users = this.formlyModel.users.filter(
      (obj: any) => obj.value != item.value,
    );
    this.formlyModel = { ...this.formlyModel };
  }

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

    console.log('[Main] New Session existing IDs:', currentSelectedIds);

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

    console.log(
      '[Main] Opening selector with existing IDs:',
      currentSelectedIds,
    );

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

      console.log('[Main] Documents returned from selector:', selectedDocs);

      this.syncSelectedDocuments(selectedDocs, 'attachments');

      this._cdr.detectChanges();
    });
  }

  private syncSelectedDocuments(
    docs: any[],
    attachmentFieldName: 'attachments' | 'newSessionAttachments',
  ): void {
    console.log('[Main] === SYNC SELECTED DOCUMENTS ===');

    console.log('[Main] Field:', attachmentFieldName);

    console.log('[Main] Documents returned from popup:', docs);
    if (attachmentFieldName === 'attachments') {
      const current = this.formlyModel?.attachments || [];

      console.log('[Main] Current attachments:', current);
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

      console.log('[Main] Final merged hearing attachments:', updated);

      console.log(
        '[Main] Final hearing IDs:',
        updated.map((f: any) => f?.documentId ?? f?.id ?? 'local-file'),
      );
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
    else {
      const current = this.formlyModel?.newSession?.newSessionAttachments || [];

      console.log('[Main] Current New Session attachments:', current);

  
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
      console.log('[Main] Final merged New Session attachments Tahaaaaaaaaaaa111:', updated);

  
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

  private resetAttachmentsOnMatterChange(): void {
    this.formlyModel = {
      ...this.formlyModel,
      attachments: [],
      newSession: this.formlyModel?.newSession
        ? { ...this.formlyModel.newSession, newSessionAttachments: [] }
        : this.formlyModel?.newSession,
    };

    this.hearingDocumentTracker = { originalDocumentIds: [], deletedDocumentIds: [] };
    this.newSessionDocumentTracker = { originalDocumentIds: [], deletedDocumentIds: [] };
    this.selectedMatterDocIds = [];

    this.hearingAttachmentsFieldInstance?.setReferenceDocuments?.([]);
    this.newSessionAttachmentsFieldInstance?.setReferenceDocuments?.([]);

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
              const activityType = this.lookupsData.activityType.result.find(
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
              this.isProgrammaticMatterUpdate = true;
              this.lastMatterId = result?.law_MatterId ?? null;

              this.formlyModel = {
                ...result,
                law_ActivityType: activityType,
                startDate: result.startDate ? new Date(result.startDate) : null,
                endDate: result.endDate ? new Date(result.endDate) : null,
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
                            const documentId = String(doc.documentId ?? doc.id);

                            const fileName =
                              doc.fileName ||
                              doc.originalFileName ||
                              doc.documentName ||
                              this.extractFileNameFromUrl(doc.filePath) ||
                              `document_${documentId}`;

                            return {
                              id: documentId,

                              documentId: documentId,

                              __docId: documentId,

                              name: fileName,

                              fileName: fileName,

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
                  this.hearingAttachmentsFieldInstance?.setReferenceDocuments
                ) {
                  this.hearingAttachmentsFieldInstance.setReferenceDocuments(
                    mappedDocs,
                  );
                }
                 this.isProgrammaticMatterUpdate = false;
              }, 100);

              this.initializeDocumentTracking(result);

              this.setFieldSelectedObj('law_MatterId', 'matterCode');
              this.setFieldSelectedObj('law_ActivityTypeId', 'activityType');
              this.setFieldSelectedObj(
                'law_ActivityStatusId',
                'activityStatus',
              );
              this.setFieldSelectedObj('litigatorId', 'laywer');
              this.setFieldSelectedObj('law_FinalJudgementId', 'finalJudement');
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
            }
          },
        });
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

  override onSubmit(): void {
    if (this.formly.invalid) return;

    this.isLoading = true;
    const rowData = this._dynamicDialogConfig?.data?.rowData;
    const isEdit = !!rowData?.id;

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
const newSessionModel = this.formlyModel?.newSession || {};

let hearingStartDate = newSessionModel.hearingStartDate
  ? new Date(newSessionModel.hearingStartDate)
  : new Date();

if (isNaN(hearingStartDate.getTime())) {
  hearingStartDate = new Date();
}

if (!this.isNewSessionHearingTimeChanged) {
  hearingStartDate.setHours(8, 0, 0, 0);
}

newSessionData = {
  ...newSessionModel,
  hearingStartDate,
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
    

    let path: string;
    if (this.formlyModel?.law_ActivityTypeId === 2) {
      path = isEdit
        ? API_Config.matterTask.update
        : API_Config.matterTask.create;
    } else {
      path = isEdit
        ? API_Config.taskManagementCalender.update
        : API_Config.taskManagementCalender.create;
    }

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

  private normalizeHearingStartDate(date: Date | string | null): Date | null {
  if (!date) return null;

  const d = new Date(date);
  if (isNaN(d.getTime())) return null;

  return d;
}

  // ============================================================
  // FILE OPERATIONS
  // ============================================================

  downloadFile(attachment: any) {
    if (attachment?.isReference && attachment?.filePath) {
      if (attachment?.id || attachment?.__docId) {
        this._fileService
          .downloadDocument(attachment.__docId || attachment.id)
          .subscribe({
            next: (res: any) => {
              const blob = res.body;
              const filename =
                res.headers.get('content-disposition')?.split('filename=')[1] ||
                attachment.fileName ||
                'file';
              this.triggerDownload(blob, filename);
            },
            error: (err) => {
              this._toastrNotifiService.displayError('Error downloading file');
              console.error('Download error:', err);
            },
          });
      } else {
        this._fileService.downloadFileFromPath(
          attachment.filePath,
          attachment.fileName || 'file',
        );
      }
    } else if (attachment?.file instanceof File) {
      this._fileService.downloadFile(attachment.file);
    }
  }

  previewFile(attachment: any) {
    if (attachment?.isReference && attachment?.filePath) {
      this._fileService.previewFileFromPath(attachment.filePath);
    } else if (attachment?.file instanceof File) {
      const url = URL.createObjectURL(attachment.file);
      window.open(url, '_blank');
    }
  }

  private triggerDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'file';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  ngOnDestroy() {
    Object.values(this.liveDateIntervals).forEach((interval) =>
      clearInterval(interval),
    );
  }
}