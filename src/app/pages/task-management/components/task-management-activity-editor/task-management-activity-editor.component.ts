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
import { FieldTypeConfig, FormlyFieldConfig } from '@ngx-formly/core';
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
      lookups: this._apiService.get(API_Config.matterActivity.lookups, {
        types:
          'activityStatuses,activityTypes,adjournmentReasons,finalJudgements,taskPriorities',
      }),
      users: this._apiService.get(API_Config.matterActivity.usersLookup),
      matters: this._apiService.get(API_Config.matterActivity.mattersLookup, {
        pageNumber: 1,
        pageSize: 20,
        searchTerm: '',
      }),
    })
      .pipe(
        finalize(() => (this.isLoading = false)),
        this._unsubscribe.takeUntilDestroy(),
      )
      .subscribe({
        next: (res: any) => {
          const lookupsData =
            res.lookups?.data ?? res.lookups?.result ?? res.lookups ?? {};

          const extractList = (response: any): any[] => {
            if (!response) return [];
            const data = response.data ?? response.result ?? response;
            if (Array.isArray(data)) return data;
            return data?.items ?? data?.dataList ?? [];
          };

          const usersList = extractList(res.users);
          const mattersList = extractList(res.matters);
          const mapToIdAndName = (arr: any[], nameField = 'nameEn') => {
            return (arr || []).map((item: any) => ({
              ...item,
              id: item.id || item.userId,
              name: item[nameField] || item.name || item.nameAr || '---',
            }));
          };

          // ⭐ الفلترة الخاصة بـ Activity Type
          let activityTypes = lookupsData.activityTypes || [];
          if (this._router.url.includes('hearing-session')) {
            // لو إحنا في صفحة الهيرنج، بنعرض بس الـ Hearing Session
            activityTypes = activityTypes.filter((t: any) => t.id === 1);
          } else if (this._router.url.includes('activity')) {
            // لو إحنا في صفحة الاكتيفيتي، بنشيل الـ Hearing Session من الاختيارات
            activityTypes = activityTypes.filter((t: any) => t.id !== 1);
          }

          this.lookupsData = {
            activityStatus: {
              result: mapToIdAndName(lookupsData.activityStatuses),
            },
            activityType: { result: mapToIdAndName(activityTypes) }, // ⭐ هنا بنحط الداتا المفلترة
            adjournmentReasons: {
              result: mapToIdAndName(lookupsData.adjournmentReasons),
            },
            finalJudement: {
              result: mapToIdAndName(lookupsData.finalJudgements),
            },
            taskPriority: {
              result: mapToIdAndName(lookupsData.taskPriorities),
            },

            laywer: { result: mapToIdAndName(usersList, 'nameEn') },
            users: { result: mapToIdAndName(usersList, 'nameEn') },
            assigneeLawyers: { result: mapToIdAndName(usersList, 'nameEn') },
            matterCode: {
              result: mattersList.map((matter: any) => ({
                ...matter,
                id: matter.id,
                name: [matter.matterCode, matter.descr]
                  .filter(Boolean)
                  .join(' | '),
              })),
            },
          };

          this.initForm();
        },
        error: (err: any) => {
          console.error('Error loading lookups:', err);
          this._toastrNotifiService.displayError(
            'Failed to load dropdown data',
          );
          this.isLoading = false;
        },
      });
  }

  override onSubmit(): void {
    if (this.formly.invalid) return;

    this.isLoading = true;
    const rowData = this._dynamicDialogConfig?.data?.rowData;
    const isEdit = !!rowData?.id;

    const hearingAttachments = this.formlyModel?.attachments || [];

    const hearingFilesForPayload = hearingAttachments.filter(
      (f: any) =>
        !f?.isReference &&
        !f?.id &&
        (f instanceof File || f.file instanceof File || f._file instanceof File),
    );

    const deletedHearingIds = Array.from(
      new Set(
        this.hearingAttachmentsFieldInstance?.props?.['deletedAttachmentIds'] || [],
      ),
    ).map(Number);

    const currentHearingRefIds = hearingAttachments
      .filter((f: any) => f?.isReference && (f?.documentId != null || f?.id != null))
      .map((f: any) => String(f.documentId ?? f.id));

    const newSessionModel = this.formlyModel?.newSession;
    const newSessionAttachments = newSessionModel?.newSessionAttachments || [];

    const newSessionFilesForPayload = newSessionAttachments.filter(
      (f: any) =>
        !f?.isReference &&
        !f?.id &&
        (f instanceof File || f.file instanceof File || f._file instanceof File),
    );

    const deletedNewSessionIds = Array.from(
      new Set(
        this.newSessionAttachmentsFieldInstance?.props?.['deletedAttachmentIds'] || [],
      ),
    ).map(Number);

    const currentNewSessionRefIds = newSessionAttachments
      .filter((f: any) => f?.isReference && (f?.documentId != null || f?.id != null))
      .map((f: any) => String(f.documentId ?? f.id));

    const activityTypeId = Number(this.formlyModel?.law_ActivityTypeId);
    const isHearing = activityTypeId === 1;

    const startDateValue = isHearing
      ? this.formlyModel?.startDate || new Date()
      : this.formlyModel?.activityStartDate ||
        this.formlyModel?.startDate ||
        new Date();

    const eventDateValue = this.formlyModel?.isNewHearingSession
      ? this.formlyModel?.newSession?.hearingStartDate ||
        this.formlyModel?.newSession?.newSessionStartDate ||
        startDateValue
      : startDateValue;

    const formData = new FormData();

    formData.append('matterId', String(this.formlyModel.law_MatterId));
    formData.append('activityTypeId', String(activityTypeId));
    
    if (this.formlyModel.law_ActivityStatusId != null) {
      formData.append('activityStatusId', String(this.formlyModel.law_ActivityStatusId));
    }

    formData.append('description', this.formlyModel.description || '');
    formData.append('remark', this.formlyModel.remark || '');

    if (startDateValue) {
      formData.append('startDate', new Date(startDateValue).toISOString());
    }
    if (this.formlyModel.endDate) {
      formData.append('endDate', new Date(this.formlyModel.endDate).toISOString());
    }
    if (this.formlyModel.location) {
      formData.append('location', this.formlyModel.location);
    }
    if (this.formlyModel.isPrivate !== undefined && this.formlyModel.isPrivate !== null) {
      formData.append('isPrivate', String(this.formlyModel.isPrivate));
    }
    if (this.formlyModel.visibleToClient !== undefined && this.formlyModel.visibleToClient !== null) {
      formData.append('visibleToClient', String(this.formlyModel.visibleToClient));
    }

    if (Array.isArray(this.formlyModel.users)) {
      this.formlyModel.users.forEach((user: any) => {
        const userId = user.value || user.id || user;
        if (userId) {
          formData.append('assignedUserIds', String(userId));
        }
      });
    }
    if (isHearing) {
      if (this.formlyModel.chamber) formData.append('chamber', this.formlyModel.chamber);
      if (this.formlyModel.rollNumber) formData.append('rollNumber', String(this.formlyModel.rollNumber));
      if (this.formlyModel.litigatorId) formData.append('litigatorId', this.formlyModel.litigatorId);
    }

    if (isEdit) {
      formData.append('id', String(rowData.id));
      
      if (this.formlyModel.decission) formData.append('decision', this.formlyModel.decission);
      if (this.formlyModel.report) formData.append('report', this.formlyModel.report);
      
      if (this.formlyModel.law_AdjournmentReasonsId) {
        formData.append('adjournmentReasonId', String(this.formlyModel.law_AdjournmentReasonsId));
      }
      
      if (this.formlyModel.law_FinalJudgementId) {
        formData.append('finalJudgementId', String(this.formlyModel.law_FinalJudgementId));
      }
      if (this.formlyModel.cassation_Or_AppealPeriod != null) {
        formData.append('appealPeriodDays', String(this.formlyModel.cassation_Or_AppealPeriod));
      }

      deletedHearingIds.forEach((id) => formData.append('removeAttachmentIds', String(id)));
    }

    hearingFilesForPayload.forEach((item: any) => {
      const file = this.extractFile(item);
      if (file) formData.append('files', file, file.name);
    });

    currentHearingRefIds.forEach((id: any) => {
      formData.append('matterDocumentIds', String(id));
    });

    if (this.formlyModel?.isNewHearingSession && newSessionModel) {
      const ns = newSessionModel;
      const rawDate = ns.hearingStartDate || ns.newSessionStartDate;
      const nsDate = rawDate instanceof Date ? rawDate : rawDate ? new Date(rawDate) : null;

      if (nsDate && !isNaN(nsDate.getTime())) {
        formData.append('NewSession.newSessionStartDate', this.getDate(nsDate) || '');
      }
      
      if (ns.law_ActivityStatusId != null) {
        formData.append('NewSession.law_ActivityStatusId', String(ns.law_ActivityStatusId));
      }
      
      if (ns.description) formData.append('NewSession.description', String(ns.description));
      if (ns.remark) formData.append('NewSession.remark', String(ns.remark));
      if (ns.rollNumber != null && ns.rollNumber !== '') formData.append('NewSession.rollNumber', String(ns.rollNumber));
      if (ns.chamber) formData.append('NewSession.chamber', String(ns.chamber));
      if (ns.litigatorId) formData.append('NewSession.litigatorId', String(ns.litigatorId));

      const today = new Date().toISOString().split('T')[0];
      formData.append('NewSession.DocumentDate', today);
      formData.append('NewSession.ReceivedDate', today);
      formData.append('NewSession.DocumentDescription', '');

      newSessionFilesForPayload.forEach((item: any) => {
        const file = this.extractFile(item);
        if (file) formData.append('NewSession.Attachments', file, file.name);
      });

      currentNewSessionRefIds.forEach((id: any) => {
        formData.append('NewSession.matterDocumentIds', String(id));
      });
      
      deletedNewSessionIds.forEach((id) => {
        formData.append('NewSession.removeAttachmentIds', String(id));
      });
    }

    const url = isEdit
      ? API_Config.matterActivity.update.replace('{id}', String(rowData.id))
      : API_Config.matterActivity.create;

    const req$ = isEdit
      ? this._apiService.put(url, formData)
      : this._apiService.post(url, formData);

    req$
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
          this._toastrNotifiService.displayError(
            err?.error?.message || 'Error saving activity',
          );
        },
      });
  }

    setFormData() {
    const rowData = this._dynamicDialogConfig?.data?.rowData;
    this.isEditMode = !!rowData?.id;
    this.mode = this._dynamicDialogConfig.data.mode;
    this.formlyOptions.formState = { readonly: this.mode === 'view' };

    if (rowData?.id) {
      const url = API_Config.matterActivity.getById.replace('{id}', String(rowData.id));

      this._apiService.get(url)
        .pipe(this._unsubscribe.takeUntilDestroy())
        .subscribe({
          next: (res: ApiRes) => {
            const data = res?.data ?? res?.result;
            if (!data) return;

            const mappedAttachments = (data.attachments || []).map((doc: any) => ({
              id: doc.id,
              documentId: doc.matterDocumentId || doc.id,
              __docId: doc.id,
              name: doc.originalFileName,
              fileName: doc.originalFileName,
              originalFileName: doc.originalFileName,
              filePath: doc.attachmentPath || doc.viewUrl,
              isReference: false,
              file: null,
            }));

            const activityType = this.lookupsData.activityType.result.find(
              (obj: any) => Number(obj.id) === Number(data.activityTypeId),
            )?.name;

            const mappedUsers = data.assignees?.map((a: any) => ({
              label: a.name,
              value: a.userId,
            })) || [];

            this.formlyModel = {
              ...data,
              law_MatterId: Number(data.matterId),
              law_ActivityTypeId: Number(data.activityTypeId),
              law_ActivityStatusId: Number(data.activityStatusId),
              law_AdjournmentReasonsId: data.adjournmentReasonId ? Number(data.adjournmentReasonId) : null,
              law_FinalJudgementId: data.finalJudgementId ? Number(data.finalJudgementId) : null,
              decission: data.decision,
              mtrNo: data.matterCode,
              law_ActivityType: activityType,
              startDate: data.startDate ? new Date(data.startDate) : null,
              endDate: data.endDate ? new Date(data.endDate) : null,
              attachments: mappedAttachments,
              users: mappedUsers,
            };

            this.isProgrammaticMatterUpdate = true;
            this.lastMatterId = data.matterId;

            this.formlyFields = taskManagementActivityEditorFields(this);
            this.formly.patchValue(this.formlyModel);

            this.updateFieldsSelectedObj('law_ActivityStatusId', 'activityStatus');
            this.updateFieldsSelectedObj('law_ActivityTypeId', 'activityType');
            this.updateFieldsSelectedObj('law_AdjournmentReasonsId', 'adjournmentReasons');
            this.updateFieldsSelectedObj('law_MatterId', 'matterCode');
            this.updateFieldsSelectedObj('litigatorId', 'laywer');
            this.updateFieldsSelectedObj('law_FinalJudgementId', 'finalJudement');

            if (this.formlyModel?.users) {
              const usersField: FieldTypeConfig = findField(this.formlyFields, 'users');
              if (usersField) {
                usersField.props['selectedObj'] = this.setUsersValue();
              }
            }

            setTimeout(() => {
              this.isLoading = false;
              this.isProgrammaticMatterUpdate = false;
              this._cdr.detectChanges();
            }, 100);

            this.initializeDocumentTracking(data);
          },
        });
    } else {
      // ⭐ التعديل هنا: بنحط القيم الافتراضية في الـ Model في وضع الإضافة
      this.formlyModel = {
        ...this.formlyModel,
        law_ActivityTypeId: this._router.url.includes('activity') ? null : 1,
        law_ActivityStatusId: 1, // Created
      };
      
      this.formly.patchValue(this.formlyModel);
      this.isLoading = false;

      setTimeout(() => {
        this.updateFieldsSelectedObj('law_ActivityTypeId', 'activityType');
        this.updateFieldsSelectedObj('law_ActivityStatusId', 'activityStatus');
        this._cdr.detectChanges();
      }, 100);
    }
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

  getAssigneeName(user: any): string {
    if (!user) return '';
    const id = user?.value || user; 
    const found = this.lookupsData?.users?.result.find((u: any) => u.id === id);
    return found ? found.name : 'Unknown';
  }

  deleteItem(user: any) {
    const idToRemove = user?.value || user; 
    this.formlyModel.users = this.formlyModel.users.filter((u: any) => {
      const currentId = u?.value || u;
      return currentId !== idToRemove;
    });
    this.formly.get('users')?.setValue(this.formlyModel.users);
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
    } else {
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
      console.log(
        '[Main] Final merged New Session attachments Tahaaaaaaaaaaa111:',
        updated,
      );

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

    this.hearingDocumentTracker = {
      originalDocumentIds: [],
      deletedDocumentIds: [],
    };
    this.newSessionDocumentTracker = {
      originalDocumentIds: [],
      deletedDocumentIds: [],
    };
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

  setUsersValue() {
    const selectedUsers = this.lookupsData?.users?.result.filter((obj: any) =>
      this.formlyModel?.users?.some((u: any) => (u.value || u) === obj.id),
    );
    if (!selectedUsers) return null;
    return selectedUsers.map((obj: any) => ({
      label: obj?.name,
      value: obj?.id,
    }));
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

  private updateFieldsSelectedObj(key: string, lookupPath: string) {
    const modelValue = this.formlyModel?.[key];
    if (!modelValue) return;

    const lookupData = this.lookupsData?.[lookupPath]?.result || [];
    const selected = lookupData.find(
      (obj: any) => Number(obj.id) === Number(modelValue),
    );

    if (selected) {
      const selectedObj = { label: selected.name, value: selected.id };

      const traverse = (fields: any[]) => {
        fields.forEach((field) => {
          if (field.key === key) {
            field.props = field.props || {};
            field.props['selectedObj'] = selectedObj;
          }
          if (field.fieldGroup) {
            traverse(field.fieldGroup);
          }
        });
      };

      traverse(this.formlyFields);
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
