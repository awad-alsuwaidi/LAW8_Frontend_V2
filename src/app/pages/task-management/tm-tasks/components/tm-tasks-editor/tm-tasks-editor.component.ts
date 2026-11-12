import { Component, inject, OnInit } from '@angular/core';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { SharedModule } from 'src/app/@shared/shared.module';
import { matterTaskEditorFields } from './tm-tasks-editor-formly.config';
import { combineLatest, finalize, map } from 'rxjs';
import { findField } from 'src/app/@core/utilities/functions/find-field';
import { FieldTypeConfig } from '@ngx-formly/core';
import { SharedSkeletonGridComponent } from 'src/app/@shared/components/shared-skeleton-grid/shared-skeleton-grid.component';
import { FileService } from 'src/app/@shared/services/file/file.service';

@Component({
  selector: 'app-tm-tasks-editor',
  standalone: true,
  imports: [
    SharedModule,
    FormlyConfigModule,
    SharedButtonComponent,
    SharedSkeletonGridComponent,
  ],
  templateUrl: './tm-tasks-editor.component.html',
  styleUrl: './tm-tasks-editor.component.scss',
})
export class TmTasksEditorComponent extends FormBaseClass implements OnInit {
  mode!: string;
  _fileService = inject(FileService);

  ngOnInit(): void {
    this.getLookupsData();
  }

  override getLookupsData(): void {
    this.isLoading = true;
    
    combineLatest({
      lookups: this._apiService.get(API_Config.matterTask.lookups, {
        types: 'matterTaskStatuses,taskPriorities'
      }),
      users: this._apiService.get(API_Config.matterTask.usersLookup),
      matters: this._apiService.get(API_Config.matterTask.mattersLookup, {
        pageNumber: 1, pageSize: 20, searchTerm: ''
      }),
    })
      .pipe(
        finalize(() => this.isLoading = false),
        this._unsubscribe.takeUntilDestroy()
      )
      .subscribe({
        next: (res: any) => {
          const extractList = (obj: any): any[] => {
            if (!obj) return [];
            if (Array.isArray(obj)) return obj;
            const d = obj.data ?? obj.result ?? obj;
            if (Array.isArray(d)) return d;
            return d?.items ?? d?.dataList ?? [];
          };
          let lookupsObj = res.lookups;
          if (lookupsObj?.data) lookupsObj = lookupsObj.data;
          if (lookupsObj?.result) lookupsObj = lookupsObj.result;

          const usersList = extractList(res.users);
          const mattersList = extractList(res.matters);

          console.log('Lookups from API:', lookupsObj);

          const mappedStatuses = (lookupsObj?.matterTaskStatuses || []).map((s: any) => ({
            ...s,
            name: s.nameEn || s.nameAr || '---'
          }));

          const mappedPriorities = (lookupsObj?.taskPriorities || []).map((p: any) => ({
            ...p,
            name: p.nameEn || p.nameAr || '---'
          }));

          const mappedUsers = usersList.map((u: any) => ({
            ...u,
            name: u.nameEn || u.nameAr || '---'
          }));

          const mappedMatters = mattersList.map((m: any) => ({
            ...m,
            name: [m.matterCode, m.descr].filter(Boolean).join(' | ')
          }));

          this.lookupsData = {
            taskStatus: { result: mappedStatuses },
            taskPriority: { result: mappedPriorities },
            users: { result: mappedUsers },
            matters: { result: mappedMatters },
          };
          
          this.initForm();
        },
        error: (err) => {
          console.error('Lookup error:', err);
          this.isLoading = false;
        }
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
          type:
            response.headers.get('content-type') ?? 'application/octet-stream',
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download =
          attachment.originalFileName ?? attachment.fileName ?? 'download';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err: any) => {
        this._toastrNotifiService.displayError('Failed to download file');
        console.error(err);
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
    this.formlyOptions.formState = { readonly: this.mode === 'view' };

    const param = { id: this._dynamicDialogConfig?.data?.rowData?.id };
    const url = API_Config.matterTask.getById.replace('{id}', String(param.id));

    this._apiService
      .get(url)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: any) => {
          const data = res?.data ?? res?.result;
          if (!data) return;
          this.formlyModel = {
            ...data,
            startDate: data.startDate ? new Date(data.startDate) : null,
            dueDate: data.dueDate ? new Date(data.dueDate) : null,
            assignedUserIds: data.assignees?.map((a: any) => a.userId) || [],
          };

          this.formly.patchValue(this.formlyModel);

          const statusField: FieldTypeConfig = findField(
            this.formlyFields,
            'matterTaskStatusId',
          );
          const priorityField: FieldTypeConfig = findField(
            this.formlyFields,
            'priorityId',
          );
          const assigneeField: FieldTypeConfig = findField(
            this.formlyFields,
            'assignedUserIds',
          );

          if (data.matterTaskStatusId && statusField) {
            const status = this.lookupsData.taskStatus.result.find(
              (s: any) => s.id === data.matterTaskStatusId,
            );
            statusField.props['selectedObj'] = {
              label: status?.nameEn,
              value: status?.id,
            };
          }
          if (data.priorityId && priorityField) {
            const priority = this.lookupsData.taskPriority.result.find(
              (p: any) => p.id === data.priorityId,
            );
            priorityField.props['selectedObj'] = {
              label: priority?.nameEn,
              value: priority?.id,
            };
          }
        },
      });
  }

  onEdit(): void {
    this.formlyOptions = {
      ...this.formlyOptions,
      formState: {
        ...this.formlyOptions.formState,
        readonly: false,
      },
    };
  }

  override onSubmit(): void {
    if (this.formly.invalid) return;
    this.isLoading = true;

    const isEdit = !!this._dynamicDialogConfig?.data?.rowData?.id;
    const formData = new FormData();

    // ⭐ 1. تجهيز الحقول زي السواجر بالظبط
    formData.append('matterId', String(this.formlyModel.matterId || ''));
    formData.append('title', this.formlyModel.title || ''); // Description
    formData.append('description', this.formlyModel.description || ''); // Notes
    formData.append('priorityId', String(this.formlyModel.priorityId || ''));
    formData.append(
      'matterTaskStatusId',
      String(this.formlyModel.matterTaskStatusId || ''),
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

    // ⭐ 2. الـ Assigned Users (بتتبعت كـ assignedUserIds متكررة)
    if (Array.isArray(this.formlyModel.assignedUserIds)) {
      this.formlyModel.assignedUserIds.forEach((user: any) => {
        const userId = user.value || user;
        if (userId) formData.append('assignedUserIds', userId);
      });
    }

    // ⭐ 3. المرفقات (بتتبعت كـ files)
    const attachments = this.formlyModel.attachments || [];
    attachments.forEach((item: any) => {
      const file = item instanceof File ? item : item.file;
      if (file && !item.id) {
        // لو ملف جديد
        formData.append('files', file, file.name);
      }
    });

    // 4. لو تعديل بنضيف المرفقات اللي اتشالت
    if (isEdit) {
      const attachmentField = findField(this.formlyFields, 'attachments');
      const deletedIds = attachmentField?.props?.['deletedAttachmentIds'] || [];
      deletedIds.forEach((id: number) => {
        formData.append('removeAttachmentIds', id.toString());
      });
    }

    const url = isEdit
      ? API_Config.matterTask.update.replace(
          '{id}',
          this._dynamicDialogConfig.data.rowData.id,
        )
      : API_Config.matterTask.create;

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
}
