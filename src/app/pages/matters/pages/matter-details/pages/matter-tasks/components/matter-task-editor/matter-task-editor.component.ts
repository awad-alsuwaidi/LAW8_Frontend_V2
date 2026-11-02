import { Component, inject, OnInit } from '@angular/core';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { matterTaskEditorFields } from './matter-task-editor-formly.config';
import { SharedModule } from 'src/app/@shared/shared.module';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { combineLatest, finalize } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { DatePipe } from '@angular/common';
import { FieldTypeConfig } from '@ngx-formly/core';
import { findField } from 'src/app/@core/utilities/functions/find-field';
import { FileService } from 'src/app/@shared/services/file/file.service';

@Component({
  selector: 'app-matter-task-editor',
  standalone: true,
  imports: [SharedModule, FormlyConfigModule, SharedButtonComponent],
  providers: [DatePipe],
  templateUrl: './matter-task-editor.component.html',
  styleUrl: './matter-task-editor.component.scss',
})
export class MatterTaskEditorComponent extends FormBaseClass implements OnInit {
  _datePipe = inject(DatePipe);
  _fileService = inject(FileService);
  mode!: string;
  Loading = false;

  ngOnInit(): void {
    this.getLookupsData();
  }

  override getLookupsData(): void {
    this.Loading = true;
    this._apiService
      .get(API_Config.general.getBatchLookups, {
        'types[0]': 'activityStatuses',
        'types[1]': 'users',
        'types[2]': 'taskPriorities',
        PageSize: 1000,
      })
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: any) => {
          const batchData = res.data || res.result || res;
          const extractList = (obj: any): any[] => {
            if (!obj) return [];
            if (Array.isArray(obj)) return obj;
            if (Array.isArray(obj.items)) return obj.items;
            if (Array.isArray(obj.result)) return obj.result;
            return [];
          };

          // دالة تطبيع الحقول (تحويل nameEn/nameAr إلى name)
          const normalize = (arr: any[]) => {
            return arr.map((item) => ({
              ...item,
              id: item.id,
              name: item.nameEn || item.nameAr || item.name || '---',
            }));
          };

          // ✅ فلترة المستخدمين ليكونوا محامين فقط (isLawyer === true)
          const allUsers = extractList(batchData.users);
          const lawyersOnly = allUsers.filter((u: any) => u.isLawyer === true);

          this.lookupsData = {
            lawyers: {
              result: normalize(lawyersOnly), // 👈 بنبعت المحامين بس
            },
            taskStatus: {
              result: normalize(extractList(batchData.activityStatuses)),
            },
            taskPriority: {
              result: normalize(extractList(batchData.taskPriorities)),
            },
          };

          this.initForm();
          this.Loading = false;
        },
        error: (err: any) => {
          console.error('Lookups error:', err);
          this.Loading = false;
          this.lookupsData = {
            lawyers: { result: [] },
            taskStatus: { result: [] },
            taskPriority: { result: [] },
          };
          this.initForm();
        },
      });
  }

  override initForm(): void {
    if (this._dynamicDialogConfig?.data?.rowData) {
      this.setFormData();
    } else {
      this.formlyFields = matterTaskEditorFields(this);
    }
  }

  setFormData(): void {
    this.mode = this._dynamicDialogConfig.data.mode;
    this.formlyOptions.formState = {
      readonly: this.mode === 'view',
    };
    const param = { id: this._dynamicDialogConfig?.data?.rowData?.id };
    const url = API_Config.matterTask.getById.includes('{id}')
      ? API_Config.matterTask.getById.replace('{id}', String(param.id))
      : `${API_Config.matterTask.getById}/${param.id}`;

    this._apiService
      .get(url)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: any) => {
          const isSuccess = res?.success ?? res?.isSuccess;
          const result = res?.data ?? res?.result;
          if (!isSuccess || !result) return;

          // 1. بناخد الـ userIds اللي جاية من الـ API
          const incomingAssigned = result.assignedUserIds || [];

          // 2. بنحولهم لـ ids عشان الـ Formly select يعرضهم صح
          const mappedIds = incomingAssigned.map((val: any) => {
            const user = this.lookupsData?.lawyers?.result.find(
              (l: any) => l.userId === val || l.id == val,
            );
            return user ? user.id : val;
          });

          this.formlyModel = {
            ...result,
            startDate: result.startDate ? new Date(result.startDate) : null,
            dueDate: result.dueDate ? new Date(result.dueDate) : null,
            attachments: result.attachments || result.attachmentList || [],
            assignedUserIds: mappedIds, // 👈 الـ ids بعد التحويل
            priorityId: result.priorityId,
            matterTaskStatusId: result.matterTaskStatusId,
          };

          this.formlyFields = matterTaskEditorFields(this);
          this.formly.patchValue(this.formlyModel);

          const priorityField: FieldTypeConfig = findField(
            this.formlyFields,
            'priorityId',
          );
          const statusField: FieldTypeConfig = findField(
            this.formlyFields,
            'matterTaskStatusId',
          );
          const assigneeField: FieldTypeConfig = findField(
            this.formlyFields,
            'assignedUserIds',
          );

          if (this.formlyModel?.priorityId && priorityField) {
            priorityField.props['selectedObj'] = this.setPriorityValue();
          }
          if (this.formlyModel?.matterTaskStatusId && statusField) {
            statusField.props['selectedObj'] = this.setStatusValue();
          }
          if (this.formlyModel?.assignedUserIds && assigneeField) {
            assigneeField.props['selectedObj'] = this.setAssigneeValue();
          }
        },
      });
  }

  setPriorityValue() {
    const selected = this.lookupsData?.taskPriority?.result.find(
      (obj: any) => obj.id == this.formlyModel?.priorityId,
    );
    return selected ? { label: selected?.name, value: selected?.id } : null;
  }

  setStatusValue() {
    const selected = this.lookupsData?.taskStatus?.result.find(
      (obj: any) => obj.id == this.formlyModel?.matterTaskStatusId,
    );
    return selected ? { label: selected?.name, value: selected?.id } : null;
  }

  onEdit() {
    this.formlyOptions.formState.readonly = false;
    this._dynamicDialogConfig.header =
      this._languageService.getTransValue('common.editTask');
  }

  setAssigneeValue() {
    const selected = this.lookupsData?.lawyers?.result.filter((obj: any) =>
      this.formlyModel?.assignedUserIds.includes(obj.id),
    );
    return selected
      ? selected.map((obj: any) => ({ label: obj?.name, value: obj?.id }))
      : null;
  }

  override onSubmit(): void {
    if (this.formly.invalid) return;
    this.isLoading = true;

    const rowData = this._dynamicDialogConfig?.data?.rowData;
    const isEdit = !!rowData?.id;

    const formData = new FormData();

    formData.append(
      'matterId',
      String(this._dynamicDialogConfig.data.matterIdentifier),
    );
    formData.append('title', this.formlyModel.title || '');
    formData.append('description', this.formlyModel.description || '');
    formData.append('priorityId', String(this.formlyModel.priorityId || 0));
    formData.append(
      'matterTaskStatusId',
      String(this.formlyModel.matterTaskStatusId || 0),
    );

    if (this.formlyModel.startDate) {
      formData.append(
        'startDate',
        new Date(this.formlyModel.startDate).toISOString(),
      );
    }
    if (this.formlyModel.dueDate) {
      formData.append(
        'dueDate',
        new Date(this.formlyModel.dueDate).toISOString(),
      );
    }

    formData.append(
      'percentComplete',
      String(this.formlyModel.percentComplete || 0),
    );
    formData.append('isPrivate', String(this.formlyModel.isPrivate || false));

    if (Array.isArray(this.formlyModel.assignedUserIds)) {
      this.formlyModel.assignedUserIds.forEach((u: any) => {
        // استخراج القيمة سواء كانت id مباشر أو object
        let idToSend = u.value || u;
        if (typeof idToSend === 'object' && idToSend !== null) {
          idToSend = idToSend.value || idToSend.id;
        }

        // بنبحث عن المستخدم عشان ناخد الـ userId
        const user = this.lookupsData?.lawyers?.result.find(
          (l: any) => l.id == idToSend || l.userId === idToSend,
        );

        // بنبعت userId، ولو مش لاقيه بنبعت القيمة زي ما هي
        const finalUserId = user ? user.userId : idToSend;
        if (finalUserId) {
          formData.append('assignedUserIds', finalUserId);
        }
      });
    }

    const attachmentList = this.formlyModel.attachments || [];
    const newFiles = attachmentList.filter(
      (file: any) => file instanceof File || file.file instanceof File,
    );
    newFiles.forEach((item: any) => {
      const file = item instanceof File ? item : item.file;
      if (file) formData.append('files', file, file.name);
    });

    const attachmentField = findField(this.formlyFields, 'attachments');
    const deletedIds = attachmentField?.props?.['deletedAttachmentIds'] || [];
    deletedIds.forEach((id: number) => {
      formData.append('removeAttachmentIds', id.toString());
    });

    if (isEdit) formData.append('id', String(rowData.id));

    const path = isEdit
      ? API_Config.matterTask.update.includes('{id}')
        ? API_Config.matterTask.update.replace('{id}', String(rowData.id))
        : `${API_Config.matterTask.update}/${rowData.id}`
      : API_Config.matterTask.create;

    const request$ = isEdit
      ? this._apiService.put(path, formData)
      : this._apiService.post(path, formData);

    request$
      .pipe(
        finalize(() => (this.isLoading = false)),
        this._unsubscribe.takeUntilDestroy(),
      )
      .subscribe({
        next: (res: any) => {
          const isSuccess = res?.success ?? res?.isSuccess;
          if (isSuccess) {
            this._toastrNotifiService.displaySuccess(res.message);
            this._dynamicDialogRef.close(true);
          } else {
            this._toastrNotifiService.displayError(res?.message);
          }
        },
        error: (err: any) => {
          this._toastrNotifiService.displayError(
            err?.error?.message || 'Something went wrong',
          );
        },
      });
  }

  downloadTaskAttachment(attachment: any) {
    this._fileService.downloadDocumentTAsk(attachment.id).subscribe({
      next: (response: any) => {
        const blob = new Blob([response.body], {
          type:
            response.headers.get('content-type') ?? 'application/octet-stream',
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = attachment.fileName ?? 'download';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
    });
  }
}
