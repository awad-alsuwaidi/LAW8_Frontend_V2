import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { matterTaskEditorFields } from './tm-task-tab-editor-formly.config';
import { SharedModule } from 'src/app/@shared/shared.module';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { combineLatest, finalize } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { DatePipe } from '@angular/common';
import { findField } from 'src/app/@core/utilities/functions/find-field';
import { SharedSkeletonGridComponent } from 'src/app/@shared/components/shared-skeleton-grid/shared-skeleton-grid.component';
import { SharedSkeletonComponent } from 'src/app/@shared/components/shared-skeleton/shared-skeleton.component';
import { FileService } from 'src/app/@shared/services/file/file.service';

@Component({
  selector: 'app-tm-task-tab-editor',
  standalone: true,
  imports: [
    SharedModule,
    FormlyConfigModule,
    SharedButtonComponent,
    SharedSkeletonGridComponent,
    SharedSkeletonComponent,
  ],
  providers: [DatePipe],
  templateUrl: './tm-task-tab-editor.component.html',
  styleUrl: './tm-task-tab-editor.component.scss',
})
export class TmTaskTabEditorComponent extends FormBaseClass implements OnInit {
  _datePipe = inject(DatePipe);
  mode!: string;
  _fileService = inject(FileService);
  cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.getLookupsData();
  }
  override getLookupsData(): void {
    this.isLoading = true;

    combineLatest({
      lookups: this._apiService.get(API_Config.matterTask.lookups, {
        types: 'matterTaskStatuses,taskPriorities',
      }),
      users: this._apiService.get(API_Config.matterTask.usersLookup),
      matters: this._apiService.get(API_Config.matterTask.mattersLookup, {
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
            res.lookups?.data?.data ??
            res.lookups?.data ??
            res.lookups?.result ??
            res.lookups ??
            {};

          const extractList = (obj: any): any[] => {
            if (!obj) return [];

            const data = obj.data ?? obj.result ?? obj;

            if (Array.isArray(data)) return data;

            return data?.items ?? data?.dataList ?? [];
          };

          const usersList = extractList(res.users);
          const mattersList = extractList(res.matters);

          this.lookupsData = {
            taskStatus: {
              result: (lookupsData.matterTaskStatuses || []).map(
                (item: any) => ({
                  ...item,
                  name: item.nameEn,
                }),
              ),
            },
            taskPriority: {
              result: (lookupsData.taskPriorities || []).map((item: any) => ({
                ...item,
                name: item.nameEn,
              })),
            },
            lawyers: {
              result: usersList.map((item: any) => ({
                ...item,
                name: item.nameEn,
              })),
            },
            matterCode: {
              result: mattersList.map((item: any) => ({
                ...item,
                name: [item.matterCode, item.descr].filter(Boolean).join(' | '),
              })),
            },
          };

          this.formlyFields = matterTaskEditorFields(this);

          if (this._dynamicDialogConfig?.data?.rowData) {
            this.setFormData();
          }
        },
        error: (err: any) => {
          this._toastrNotifiService.displayError(
            err?.error?.message || 'Error loading lookups',
          );
        },
      });
  }

  setFormData(): void {
    this.mode = this._dynamicDialogConfig.data.mode;
    this.formlyOptions.formState = { readonly: this.mode === 'view' };

    const id = this._dynamicDialogConfig?.data?.rowData?.id;
    const url = API_Config.matterTask.getById.replace('{id}', String(id));

    this._apiService
      .get(url)
      .pipe(
        finalize(() => (this.isLoading = false)),
        this._unsubscribe.takeUntilDestroy(),
      )
      .subscribe({
        next: (res: any) => {
          const data = res?.data ?? res?.result;
          if (!data) return;

          const mappedAttachments = (data.attachments || []).map(
            (att: any) => ({
              ...att,
              fileName: att.originalFileName,
              name: att.originalFileName,
              filePath: att.attachmentPath || att.filePath,
            }),
          );

          this.formlyModel = {
            ...data,
            matterId: Number(data.matterId),
            priorityId: Number(data.priorityId),
            matterTaskStatusId: Number(data.matterTaskStatusId),
            startDate: data.startDate ? new Date(data.startDate) : null,
            dueDate: data.dueDate ? new Date(data.dueDate) : null,
            assignedUserIds: data.assignedUserIds || [],
            attachments: mappedAttachments,
          };

          this.formly.patchValue(this.formlyModel);

          setTimeout(() => {
            const statusField: any = findField(
              this.formlyFields,
              'matterTaskStatusId',
            );

            const priorityField: any = findField(
              this.formlyFields,
              'priorityId',
            );

            const matterField: any = findField(this.formlyFields, 'matterId');

            const assigneeField: any = findField(
              this.formlyFields,
              'assignedUserIds',
            );

            const status = this.lookupsData?.taskStatus?.result.find(
              (item: any) =>
                Number(item.id) === Number(data.matterTaskStatusId),
            );

            const priority = this.lookupsData?.taskPriority?.result.find(
              (item: any) => Number(item.id) === Number(data.priorityId),
            );

            if (statusField && status) {
              statusField.props['selectedObj'] = {
                label: status.name,
                value: status.id,
              };
            }

            if (priorityField && priority) {
              priorityField.props['selectedObj'] = {
                label: priority.name,
                value: priority.id,
              };
            }

            if (matterField) {
              matterField.props['selectedObj'] = this.setMatterValue();
            }

            if (assigneeField) {
              assigneeField.props['selectedObj'] = this.setAssigneeValue();
            }

            this.cdr.detectChanges();
          }, 100);
        },
        error: (err: any) => {
          this._toastrNotifiService.displayError(
            err?.error?.message || 'Error loading task',
          );
        },
      });
  }

  setMatterValue() {
    const selected = this.lookupsData?.matterCode?.result.find(
      (obj: any) => Number(obj.id) === Number(this.formlyModel?.matterId),
    );
    return selected ? { label: selected.name, value: selected.id } : null;
  }

  setPriorityValue() {
    const selected = this.lookupsData?.taskPriority?.result.find(
      (obj: any) => Number(obj.id) === Number(this.formlyModel?.priorityId),
    );
    return selected ? { label: selected.name, value: selected.id } : null;
  }

  setStatusValue() {
    const selected = this.lookupsData?.taskStatus?.result.find(
      (obj: any) =>
        Number(obj.id) === Number(this.formlyModel?.matterTaskStatusId),
    );
    return selected ? { label: selected.name, value: selected.id } : null;
  }

  setAssigneeValue() {
    const selected = this.lookupsData?.lawyers?.result.filter((obj: any) =>
      this.formlyModel?.assignedUserIds.includes(obj.userId),
    );
    return selected?.length
      ? selected.map((obj: any) => ({ label: obj.name, value: obj.userId }))
      : null;
  }

  override onSubmit(): void {
    if (this.formly.invalid) return;
    this.isSubmitted = true;

    const isEdit = !!this._dynamicDialogConfig?.data?.rowData?.id;
    const formData = new FormData();

    formData.append('matterId', String(this.formlyModel.matterId));
    formData.append('title', this.formlyModel.title || '');
    formData.append('description', this.formlyModel.description || '');
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

    if (Array.isArray(this.formlyModel.assignedUserIds)) {
      this.formlyModel.assignedUserIds.forEach((id: string) => {
        formData.append('assignedUserIds', id);
      });
    }

    const newFiles = (this.formlyModel.attachments || []).filter(
      (f: any) => !f.id,
    );
    newFiles.forEach((item: any) => {
      const file = item instanceof File ? item : item.file;
      if (file) formData.append('files', file, file.name);
    });

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
        finalize(() => (this.isSubmitted = false)),
        this._unsubscribe.takeUntilDestroy(),
      )
      .subscribe({
        next: (res: ApiRes) => {
          if (res && res.isSuccess) {
            this._toastrNotifiService.displaySuccess(res?.message);
            this._dynamicDialogRef.close(true);
          } else {
            this._toastrNotifiService.displayError(res?.message);
          }
        },
        error: (err: any) => {
          this._toastrNotifiService.displayError(
            err?.error?.message || 'Error',
          );
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

  onEdit() {
    this.formlyOptions.formState.readonly = false;
    this._dynamicDialogConfig.header =
      this._languageService.getTransValue('common.editTask');
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
        a.download = attachment.fileName ?? 'download';

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        window.URL.revokeObjectURL(url);
      },
    });
  }
}
