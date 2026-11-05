import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { SharedModule } from 'src/app/@shared/shared.module';
import { matterActivityEditorFields } from './matter-activity-editor-formly.config';
import { combineLatest, finalize } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { GLOBAL_DATE_TIME_Without_Seconds2_FORMATE } from 'src/app/@core/utilities/defines/date-time';
import { DatePipe } from '@angular/common';
import { SelectMatterDocumentsComponent } from 'src/app/@shared/components/bussiness/select-matter-documents/select-matter-documents.component';
import { FileService } from 'src/app/@shared/services/file/file.service';
import { HttpErrorResponse } from '@angular/common/http';
import { FieldTypeConfig, FormlyFieldConfig } from '@ngx-formly/core';
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
      laywer: this._apiService.get(API_Config.responsibleLawyerSecurity.get),
      batchLookups: this._apiService.get(API_Config.general.getBatchLookups, {
        'types[0]': 'activityStatuses',
        'types[1]': 'adjournmentReasons',
        'types[2]': 'finalJudgements',
        'types[3]': 'users',
        'types[4]': 'activityTypes',
        PageSize: 1000,
      }),
    })
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
        this._unsubscribe.takeUntilDestroy(),
      )
      .subscribe({
        next: (res: any) => {
          const extractList = (obj: any): any[] => {
            if (!obj) return [];
            if (Array.isArray(obj)) return obj;
            if (Array.isArray(obj.result)) return obj.result;
            if (Array.isArray(obj.data)) return obj.data;
            if (Array.isArray(obj.data?.items)) return obj.data.items;
            if (Array.isArray(obj.result?.items)) return obj.result.items;
            return [];
          };

          const normalize = (arr: any[]) => {
            if (!Array.isArray(arr)) return [];
            return arr.map((item) => {
              if (!item || typeof item !== 'object') return item;

              const id = item.userId ?? item.id ?? item.value ?? item.key ?? '';
              const name =
                item.nameEn ??
                item.nameAr ??
                item.name ??
                item.label ??
                item.title ??
                '';

              return {
                ...item,
                id: id,
                name: name || '---',
              };
            });
          };

          const batchData =
            res.batchLookups?.data ||
            res.batchLookups?.result ||
            res.batchLookups ||
            {};

          const batchObj = Array.isArray(batchData)
            ? batchData.reduce(
                (acc, curr) => ({
                  ...acc,
                  [curr.type || curr.key]: curr.items || curr,
                }),
                {},
              )
            : batchData;

          this.lookupsData = {
            activityType: {
              result: normalize(
                extractList(
                  batchObj.activityTypes ||
                    batchObj['activity-types'] ||
                    batchObj['activityType'],
                ),
              ),
            },
            laywer: { result: normalize(extractList(res.laywer)) },
            activityStatus: {
              result: normalize(
                extractList(
                  batchObj.activityStatuses || batchObj['activity-statuses'],
                ),
              ),
            },
            adjournmentReasons: {
              result: normalize(
                extractList(
                  batchObj.adjournmentReasons ||
                    batchObj['adjournment-reasons'],
                ),
              ),
            },
            finalJudement: {
              result: normalize(
                extractList(
                  batchObj.finalJudgements || batchObj['final-judgements'],
                ),
              ),
            },
            users: { result: normalize(extractList(batchObj.users)) },
          };

          this.initForm();
        },
        error: (err: any) => {
          console.error('Lookups error:', err);
          this._toastrNotifiService.displayError('Failed to load lookups');
          this.isLoading = false;

          this.lookupsData = {
            activityType: { result: [] },
            laywer: { result: [] },
            activityStatus: { result: [] },
            adjournmentReasons: { result: [] },
            finalJudement: { result: [] },
            users: { result: [] },
          };
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
          GLOBAL_DATE_TIME_Without_Seconds2_FORMATE,
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
              (t: any) => t.id === this.activityDetails.law_ActivityTypeId,
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

    return userIds.map((id) => {
      const user = this.lookupsData.users.result.find((u: any) => u.id === id);

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

  switchToEditMode(): void {
    this.isViewMode = false;
    this.isEditMode = true;
    if (this.formly) {
      this.formly.enable();
    }
    this.formlyOptions.formState = {
      ...this.formlyOptions.formState,
      readonly: false,
    };
    this._cdr.detectChanges();
  }

  private initializeDocumentTracking(rowData: any): void {
    const rootDocs = Array.isArray(rowData?.attachments)
      ? rowData.attachments
      : [];
    this.hearingDocumentTracker.originalDocumentIds = rootDocs
      .filter((doc: any) => doc?.id != null)
      .map((doc: any) => String(doc.id));

    const newSessionDocs = Array.isArray(rowData?.newSession?.attachments)
      ? rowData.newSession.attachments
      : [];
    this.newSessionDocumentTracker.originalDocumentIds = newSessionDocs
      .filter((doc: any) => doc?.id != null)
      .map((doc: any) => String(doc.id));
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

  private syncSelectedDocuments(
    docs: any[],
    attachmentFieldName: 'attachments' | 'newSessionAttachments',
  ): void {
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
    } else {
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

  setFormData() {
    const rowData = this._dynamicDialogConfig?.data?.rowData;

    this.isEditMode = !!rowData?.id;
    this.mode = this._dynamicDialogConfig.data.mode;

    this.formlyOptions.formState = {
      readonly: this.mode === 'view',
    };

    if (rowData?.id) {
      const baseUrl = API_Config.matterActivity.getById;
      const url = baseUrl.includes('{id}')
        ? baseUrl.replace('{id}', String(rowData.id))
        : `${baseUrl.replace(/\/$/, '')}/${rowData.id}`;

      this._apiService
        .get(url)
        .pipe(this._unsubscribe.takeUntilDestroy())
        .subscribe({
          next: (res: any) => {
            const isSuccess = res?.success ?? res?.isSuccess;
            const result = res?.data ?? res?.result;
            if (!isSuccess || !result) return;

            const activityType = this.lookupsData.activityType.result.find(
              (obj: any) => obj.id === result?.activityTypeId,
            )?.name;

            // ⭐ دالة المابينج الجديدة للمرفقات
            const mapAttachments = (docs: any[]) =>
              (docs || []).map((doc: any) => {
                const docId = doc?.id;
                const fileName =
                  doc?.originalFileName ||
                  doc?.fileName ||
                  doc?.documentName ||
                  this.extractFileNameFromUrl(
                    doc?.attachmentPath || doc?.filePath,
                  ) ||
                  `document_${docId}`;

                // لو فيه matterDocumentId يبقى مرجع، غير كده يبقى مرفق عادي
                const isRef = doc?.matterDocumentId != null;

                return {
                  id: docId,
                  documentId: doc?.matterDocumentId || docId,
                  __docId: docId,
                  name: fileName,
                  fileName: fileName,
                  originalFileName: fileName,
                  // ⭐ هنا بنحط المسار الجديد عشان الـ formly يقدر يعرضه
                  filePath:
                    doc?.attachmentPath ||
                    doc?.viewUrl ||
                    doc?.filePath ||
                    null,
                  isReference: isRef,
                  documentDate: doc?.documentDate || null,
                  receivedDate: doc?.receivedDate || null,
                  description: doc?.description || '',
                  size: doc?.sizeBytes,
                  file: null,
                };
              });

            // ⭐ قراءة المرفقات من الحقل الجديد attachments
            const activityDocs = Array.isArray(result?.attachments)
              ? result.attachments
              : [];
            const mappedDocs = mapAttachments(activityDocs);

            // ⭐ قراءة مرفقات الجلسة الجديدة (لو موجودة)
            const newSessionDocs = Array.isArray(
              result?.newSession?.attachments,
            )
              ? result.newSession.attachments
              : result?.nextSession?.attachments || [];

            const newSessionDateRaw =
              result?.eventDate ||
              result?.newSession?.newSessionStartDate ||
              result?.newSession?.startDate ||
              null;

            let newSessionModel: any = null;
            if (
              result?.newSession &&
              Object.keys(result.newSession).length > 0
            ) {
              newSessionModel = {
                ...(result?.newSession || {}),
                newSessionStartDate: newSessionDateRaw
                  ? new Date(newSessionDateRaw)
                  : null,
                newSessionAttachments: mapAttachments(newSessionDocs),
              };
            }

            const mappedModel: any = {
              ...result,

              law_MatterId: result.matterId,
              law_ActivityTypeId: result.activityTypeId,
              law_ActivityStatusId: result.activityStatusId,
              law_AdjournmentReasonsId: result.adjournmentReasonId,
              law_FinalJudgementId: result.finalJudgementId,
              litigatorId: result.litigatorId,
              mtrNo: result.matterCode,
              rollNumber: result.rollNumber ?? 0,
              decission: result.decision ?? '',
              cassation_Or_AppealPeriod: result.appealPeriodDays ?? 0,
              users: result.assignedUserIds || [],
              law_ActivityType: activityType,

              startDate: result.startDate ? new Date(result.startDate) : null,
              endDate: result.endDate ? new Date(result.endDate) : null,

              finalJudgement: !!result.finalJudgementId,
              isPrivate: !!result.isPrivate,
              isNewHearingSession: !!result.isNewHearingSession,
              visibleToClient: !!result.visibleToClient,
              courtNumber: result.courtNumber ?? null,
              attachmentDescription: result.attachmentDescription ?? null,

              attachments: mappedDocs,
              newSession: newSessionModel,
            };

            this.formlyModel = mappedModel;

            setTimeout(() => {
              const actualRefs = mappedDocs.filter((d) => d.isReference);
              if (
                this.hearingAttachmentsFieldInstance?.setReferenceDocuments &&
                actualRefs.length > 0
              ) {
                this.hearingAttachmentsFieldInstance.setReferenceDocuments(
                  actualRefs,
                );
              }

              if (newSessionModel?.newSessionAttachments?.length) {
                const actualNewSessionRefs =
                  newSessionModel.newSessionAttachments.filter(
                    (d: any) => d.isReference,
                  );
                if (
                  this.newSessionAttachmentsFieldInstance
                    ?.setReferenceDocuments &&
                  actualNewSessionRefs.length > 0
                ) {
                  this.newSessionAttachmentsFieldInstance.setReferenceDocuments(
                    actualNewSessionRefs,
                  );
                }
              }
            }, 100);

            this.initializeDocumentTracking(result);

            this.setFieldSelectedObj('law_ActivityTypeId', 'activityType');
            this.setFieldSelectedObj('law_ActivityStatusId', 'activityStatus');
            this.setFieldSelectedObj('litigatorId', 'laywer');
            this.setFieldSelectedObj('law_FinalJudgementId', 'finalJudement');
            this.setFieldSelectedObj(
              'law_AdjournmentReasonsId',
              'adjournmentReasons',
            );

            const usersField: FieldTypeConfig = findField(
              this.formlyFields,
              'users',
            );
            if (this.formlyModel?.users && usersField) {
              usersField.props['selectedObj'] = this.setUsersValue();
              this.formlyModel.users = this.setUsersValue();
            }

            this._cdr.detectChanges();
          },
          error: (err) => console.error('Error loading matter activity:', err),
        });
    } else {
      this.formlyModel = {
        ...this.formlyModel,
        isNewHearingSession: true,
      };

      this.getMatterCodeByMatterId();
    }
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

  override onSubmit(): void {
    if (this.formly.invalid) {
      this.formly.markAllAsTouched();
      this._toastrNotifiService.displayError(
        this._languageService.getTransValue('common.pleaseFillRequiredFields'),
      );
      return;
    }

    const matterId = Number(this._dynamicDialogConfig?.data?.matterIdentifier);
    if (!matterId || isNaN(matterId)) {
      this._toastrNotifiService.displayError(
        this._languageService.getTransValue('timesheet.selectMatterFirst'),
      );
      return;
    }

    this.isLoading = true;
    const rowData = this._dynamicDialogConfig?.data?.rowData;
    const isEdit = !!rowData?.id;
    // ============ HEARING Attachments ============
    // ============ HEARING Attachments ============
    const hearingAttachments = this.formlyModel?.attachments || [];

    const hearingFilesForPayload = hearingAttachments.filter(
      (f: any) => !f?.isReference && !f?.id && (f instanceof File || f.file instanceof File || f._file instanceof File),
    );

    // ⭐ بنجيب الملفات الممسوحة مباشرة من الكومبوننت (بيشيل كل الملفات اللي اتشالت)
    const deletedHearingIds = Array.from(
      new Set(this.hearingAttachmentsFieldInstance?.props?.['deletedAttachmentIds'] || [])
    ).map(Number);

    const currentHearingRefIds = hearingAttachments
      .filter((f: any) => f?.isReference && f?.documentId != null)
      .map((f: any) => String(f.documentId));

    // ============ NEW SESSION Attachments ============
    const newSessionModel = this.formlyModel?.newSession;
    const newSessionAttachments = newSessionModel?.newSessionAttachments || [];

    const newSessionFilesForPayload = newSessionAttachments.filter(
      (f: any) => !f?.isReference && !f?.id && (f instanceof File || f.file instanceof File || f._file instanceof File),
    );
    const deletedNewSessionIds = Array.from(
      new Set(this.newSessionAttachmentsFieldInstance?.props?.['deletedAttachmentIds'] || [])
    ).map(Number);

    const currentNewSessionRefIds = newSessionAttachments
      .filter((f: any) => f?.isReference && f?.documentId != null)
      .map((f: any) => String(f.documentId));

    const hearingExistingIds = hearingAttachments
      .filter((f: any) => f?.id != null)
      .map((f: any) => Number(f.id));

    const newSessionExistingIds = newSessionAttachments
      .filter((f: any) => f?.id != null)
      .map((f: any) => Number(f.id));


    const currentNewSessionIds = newSessionAttachments
      .filter((f: any) => f?.id != null)
      .map((f: any) => String(f.id));

    // ============ Dates ============
    const activityTypeId = Number(this.formlyModel?.law_ActivityTypeId);
    const isHearing = activityTypeId === 1;

    const startDateValue = isHearing
      ? this.formlyModel?.startDate || new Date()
      : this.formlyModel?.activityStartDate ||
        this.formlyModel?.startDate ||
        new Date();

    const eventDateValue = this.formlyModel?.isNewHearingSession
      ? this.formlyModel?.newSession?.newSessionStartDate || startDateValue
      : startDateValue;

    // ============ Flat Payload ============
    const requestPayload: any = {
      matterId,
      activityTypeId: activityTypeId || 0,
      activityStatusId: Number(this.formlyModel?.law_ActivityStatusId) || 0,

      description: this.formlyModel?.description || '',
      report: this.formlyModel?.report || '',
      decision: this.formlyModel?.decision || this.formlyModel?.decission || '',
      remark: this.formlyModel?.remark || '',

      startDate: this.getDate(startDateValue),
      endDate: this.getDate(this.formlyModel?.endDate),
      eventDate: this.getDate(eventDateValue),

      location: this.formlyModel?.location || '',
      chamber: this.formlyModel?.chamber || '',
      rollNumber: Number(this.formlyModel?.rollNumber) || 0,
      ...(this.formlyModel?.law_AdjournmentReasonsId &&
      Number(this.formlyModel.law_AdjournmentReasonsId) > 0
        ? {
            adjournmentReasonId: Number(
              this.formlyModel.law_AdjournmentReasonsId,
            ),
          }
        : {}),

      ...(this.formlyModel?.litigatorId
        ? { litigatorId: String(this.formlyModel.litigatorId) }
        : {}),

      ...(this.formlyModel?.law_FinalJudgementId &&
      Number(this.formlyModel.law_FinalJudgementId) > 0
        ? { finalJudgementId: Number(this.formlyModel.law_FinalJudgementId) }
        : {}),

      appealPeriodDays:
        Number(this.formlyModel?.cassation_Or_AppealPeriod) || 0,

      isPrivate: !!this.formlyModel?.isPrivate,
      isNewHearingSession: !!this.formlyModel?.isNewHearingSession,
      visibleToClient: !!this.formlyModel?.visibleToClient,

      ...(this.formlyModel?.courtNumber
        ? { courtNumber: String(this.formlyModel.courtNumber) }
        : {}),
      ...(this.formlyModel?.attachmentDescription
        ? {
            attachmentDescription: String(
              this.formlyModel.attachmentDescription,
            ),
          }
        : {}),

      assignedUserIds: Array.isArray(this.formlyModel?.users)
        ? this.formlyModel.users
            .map((u: any) => (u?.value != null ? String(u.value) : null))
            .filter((v: string | null) => !!v)
        : [],

      matterDocumentIds: currentHearingRefIds.map(Number),
      removeAttachmentIds: deletedHearingIds,
    };

    if (isEdit) requestPayload.id = rowData.id;

    // ============ Build FormData ============
    const formData = new FormData();

    Object.entries(requestPayload).forEach(([key, value]) => {
      if (value === null || value === undefined) return;

      if (Array.isArray(value)) {
        if (value.length === 0) return;
        value.forEach((v) => formData.append(key, String(v)));
      } else if (value instanceof Date) {
        formData.append(key, this.getDate(value) || '');
      } else {
        formData.append(key, String(value));
      }
    });

    hearingFilesForPayload.forEach((item: any) => {
      const file = this.extractFile(item);
      if (file) formData.append('files', file, file.name);
    });

    if (
      this.formlyModel?.isNewHearingSession &&
      newSessionModel &&
      newSessionModel.law_ActivityStatusId
    ) {
      const ns = newSessionModel;

      const rawDate = ns.newSessionStartDate;
      const nsDate =
        rawDate instanceof Date ? rawDate : rawDate ? new Date(rawDate) : null;

      if (nsDate && !isNaN(nsDate.getTime())) {
        formData.append(
          'NewSession.newSessionStartDate',
          this.getDate(nsDate) || '',
        );
      }

      if (ns.law_ActivityStatusId != null) {
        formData.append(
          'NewSession.law_ActivityStatusId',
          String(ns.law_ActivityStatusId),
        );
      }

      if (ns.description) {
        formData.append('NewSession.description', String(ns.description));
      }

      if (ns.remark) {
        formData.append('NewSession.remark', String(ns.remark));
      }

      if (ns.rollNumber != null && ns.rollNumber !== '') {
        formData.append('NewSession.rollNumber', String(ns.rollNumber));
      }

      if (ns.chamber) {
        formData.append('NewSession.chamber', String(ns.chamber));
      }

      if (ns.litigatorId) {
        formData.append('NewSession.litigatorId', String(ns.litigatorId));
      }

      const today = new Date().toISOString().split('T')[0];
      formData.append('NewSession.DocumentDate', today);
      formData.append('NewSession.ReceivedDate', today);
      formData.append('NewSession.DocumentDescription', '');

      newSessionFilesForPayload.forEach((item: any) => {
        const file = this.extractFile(item);
        if (file) formData.append('NewSession.Attachments', file, file.name);
      });

      if (newSessionExistingIds.length) {
        newSessionExistingIds.forEach((id: any) =>
          formData.append('NewSession.matterDocumentIds', String(id)),
        );
      }
      if (deletedNewSessionIds.length) {
        deletedNewSessionIds.forEach((id) =>
          formData.append('NewSession.removeAttachmentIds', String(id)),
        );
      }
    }

    const baseUpdate = API_Config.matterActivity.update;
    const url = isEdit
      ? baseUpdate.includes('{id}')
        ? baseUpdate.replace('{id}', String(rowData.id))
        : `${baseUpdate.replace(/\/$/, '')}/${rowData.id}`
      : API_Config.matterActivity.create;

    const request$ = isEdit
      ? this._apiService.put(url, formData)
      : this._apiService.post(url, formData);

    request$
      .pipe(
        finalize(() => (this.isLoading = false)),
        this._unsubscribe.takeUntilDestroy(),
      )
      .subscribe({
        next: (res: any) => {
          const isSuccess = res?.success ?? res?.isSuccess;
          if (isSuccess) {
            this._toastrNotifiService.displaySuccess(res?.message || 'Success');
            this._dynamicDialogRef.close(true);
          } else {
            this._toastrNotifiService.displayError(
              res?.message || 'Request failed',
            );
          }
        },
        error: (err: any) => {
          console.error('[MatterActivity] Submit error:', err);
          const message =
            err?.error?.message ||
            err?.error?.title ||
            (Array.isArray(err?.error?.error)
              ? err.error.error.join(', ')
              : null) ||
            err?.error?.errors?.[0]?.message ||
            (typeof err?.error === 'string' ? err.error : null) ||
            err?.message ||
            'Failed to save activity';
          this._toastrNotifiService.displayError(message);
        },
      });
  }

  downloadFile(attachment: any) {
    if (!attachment) {
      this._toastrNotifiService.displayError('No attachment selected');
      return;
    }
    if (attachment?.isReference) {
      const documentId = attachment?.id || attachment?.__docId;

      if (documentId) {
        this._fileService.downloadDocument(documentId).subscribe({
          next: (res: any) => {
            const blob = res.body;
            const filename =
              this.extractFilenameFromContentDisposition(
                res.headers.get('content-disposition'),
              ) ||
              attachment.fileName ||
              `document_${documentId}`;

            this.triggerDownload(blob, filename);
          },
          error: (err: HttpErrorResponse) => {
            if (attachment?.filePath) {
              this._fileService.downloadFileFromPath(
                attachment.filePath,
                attachment.fileName || 'file',
              );
            } else {
              this._toastrNotifiService.displayError(
                'Could not download document',
              );
            }
          },
        });
      } else if (attachment?.filePath) {
        this._fileService.downloadFileFromPath(
          attachment.filePath,
          attachment.fileName || 'file',
        );
      } else {
        this._toastrNotifiService.displayError(
          'Cannot download: missing file information',
        );
      }
    } else if (attachment?.file instanceof File) {
      this._fileService.downloadFile(attachment.file);
    } else if (attachment?.blob instanceof Blob) {
      this.triggerDownload(attachment.blob, attachment.name || 'download');
    } else {
      this._toastrNotifiService.displayError('Cannot determine file type');
    }
  }

  onAdjournmentReasonChange(field: FormlyFieldConfig): void {
    const value = field?.formControl?.value;
    if (value === null || value === undefined || value === '') return;

    const statusControl = this.formly?.get('law_ActivityStatusId');
    if (statusControl && Number(statusControl.value) !== 4) {
      statusControl.setValue(4, { emitEvent: false });
    }

    const newSessionControl = this.formly?.get('isNewHearingSession');
    if (newSessionControl) {
      if (newSessionControl.value === true) {
        newSessionControl.setValue(false, { emitEvent: false });
      }

      setTimeout(() => {
        newSessionControl.setValue(true, { emitEvent: true });
        this._cdr.detectChanges();
      }, 100);
    }
  }

  private extractFilenameFromContentDisposition(
    contentDisposition: string | null,
  ): string | null {
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

  previewFile(attachment: any) {
    if (!attachment) {
      return;
    }

    if (attachment?.isReference && attachment?.filePath) {
      this._fileService.previewFileFromPath(attachment.filePath);
    } else if (attachment?.file instanceof File) {
      this._fileService.previewFile(attachment.file);
    } else if (attachment?.blob instanceof Blob) {
      const url = URL.createObjectURL(attachment.blob);
      window.open(url, '_blank');
    } else {
      this._toastrNotifiService.displayError('Cannot preview this file');
    }
  }

  getMatterCodeByMatterId() {
    const matterId = this._dynamicDialogConfig?.data?.matterIdentifier;
    if (!matterId) {
      console.warn('No matterIdentifier found');
      return;
    }

    let path = API_Config.matters.getMatterCodeByMatterId;
    if (path.includes('{id}')) {
      path = path.replace('{id}', String(matterId));
    } else if (path.includes('{matterId}')) {
      path = path.replace('{matterId}', String(matterId));
    } else {
      path = `${path.replace(/\/$/, '')}/${matterId}`;
    }

    this._apiService
      .get(path)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: any) => {
          const payload = res?.data || res?.result;
          this.formlyModel.mtrNo = payload?.matterCode || payload?.name || '';
          this.formlyModel = { ...this.formlyModel };
        },
        error: (err) => {
          console.error('Error fetching matter code:', err);
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

  ngOnDestroy() {}
}
