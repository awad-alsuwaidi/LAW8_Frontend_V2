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

          const normalize = (arr: any[]) => {
            return arr.map((item) => ({
              ...item,
              id: item.id,
              name: item.nameEn || item.nameAr || item.name || '---',
            }));
          };

          const allUsers = extractList(batchData.users);
          const lawyersOnly = allUsers.filter((u: any) => u.isLawyer === true);

          this.lookupsData = {
            lawyers: { result: normalize(lawyersOnly) },
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
    this.formlyFields = matterTaskEditorFields(this);
    if (this._dynamicDialogConfig?.data?.rowData) {
      this.setFormData();
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

          const incomingAssigned = result.assignedUserIds || [];
          const mappedIds = incomingAssigned.map((userId: any) => {
            const user = this.lookupsData?.lawyers?.result.find(
              (l: any) => l.userId === userId || l.id == userId,
            );
            return user ? user.id : userId;
          });

          const mappedAttachments = (result.attachments || []).map((att: any) => {
            return {
              ...att,
              fileName: att.originalFileName || att.fileName,
              name: att.originalFileName || att.name,
              size: att.sizeBytes || att.size,
              url: att.attachmentPath,
              filePath: att.attachmentPath,
            };
          });

          this.formlyModel = {
            ...result,
            startDate: result.startDate ? new Date(result.startDate) : null,
            dueDate: result.dueDate ? new Date(result.dueDate) : null,
            attachments: mappedAttachments,
            assignedUserIds: mappedIds,
            priorityId: result.priorityId,
            matterTaskStatusId: result.matterTaskStatusId,
          };

          // تحديث القيم جوه الفورم
          this.formly.patchValue(this.formlyModel);

          // 3. تحديث الحقول المخصصة
          const priorityField: FieldTypeConfig = findField(this.formlyFields, 'priorityId');
          const statusField: FieldTypeConfig = findField(this.formlyFields, 'matterTaskStatusId');
          const assigneeField: FieldTypeConfig = findField(this.formlyFields, 'assignedUserIds');

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

  setAssigneeValue() {
    const selected = this.lookupsData?.lawyers?.result.filter((obj: any) =>
      this.formlyModel?.assignedUserIds.includes(obj.id),
    );
    return selected
      ? selected.map((obj: any) => ({ label: obj?.name, value: obj?.id }))
      : null;
  }

  onEdit() {
    this.formlyOptions.formState.readonly = false;
    this._dynamicDialogConfig.header =
      this._languageService.getTransValue('common.editTask');
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
        let idToSend = u.value || u;
        if (typeof idToSend === 'object' && idToSend !== null) {
          idToSend = idToSend.value || idToSend.id;
        }

        const user = this.lookupsData?.lawyers?.result.find(
          (l: any) => l.id == idToSend || l.userId === idToSend,
        );

        const finalUserId = user ? user.userId : idToSend;
        if (finalUserId) {
          formData.append('assignedUserIds', finalUserId);
        }
      });
    }
    // ============ Attachments Handling ============
    const attachmentList = this.formlyModel.attachments || [];
        const newFiles = attachmentList.filter(
      (file: any) =>
        !file?.id &&
        (file instanceof File || 
         (file.file && file.file instanceof File) || 
         (file._file && file._file instanceof File)),
    );
    
    newFiles.forEach((item: any) => {
      const file = item instanceof File ? item : (item.file || item._file);
      if (file) {
        formData.append('files', file, file.name);
      }
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
    const taskId = this._dynamicDialogConfig?.data?.rowData?.id; 
    const attachmentId = attachment.id;

    if (!taskId || !attachmentId) {
      console.error('Task ID or Attachment ID is missing');
      return;
    }
    this._fileService.downloadTaskAttachment(taskId, attachmentId).subscribe({
      next: (response: any) => {
        const blob = new Blob([response.body], {
          type: response.headers.get('content-type') ?? 'application/octet-stream',
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = attachment.originalFileName ?? attachment.fileName ?? 'download';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err: any) => {
        this._toastrNotifiService.displayError('Failed to download file');
        console.error(err);
      }
    });
  }
  
}
