import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { lookupsPredefinedTasksEditorConfig } from './lookups-predefined-tasks-editor.config';
import { SharedModule } from 'src/app/@shared/shared.module';
import { combineLatest, finalize } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { FieldTypeConfig } from '@ngx-formly/core';
import { findField } from 'src/app/@core/utilities/functions/find-field';
import { SharedBreadcrumbComponent } from 'src/app/@shared/components/shared-breadcrumb/shared-breadcrumb.component';
import { SharedSkeletonGridComponent } from 'src/app/@shared/components/shared-skeleton-grid/shared-skeleton-grid.component';
import { FileService } from 'src/app/@shared/services/file/file.service';

@Component({
  selector: 'app-lookups-predefined-tasks-editor',
  standalone: true,
  imports: [
    SharedButtonComponent,
    FormlyConfigModule,
    SharedModule,
    SharedBreadcrumbComponent,
    SharedSkeletonGridComponent,
  ],
  templateUrl: './lookups-predefined-tasks-editor.component.html',
  styleUrl: './lookups-predefined-tasks-editor.component.scss',
})
export class LookupsPredefinedTasksEditorComponent
  extends FormBaseClass
  implements OnInit, OnDestroy
{
  _fileService = inject(FileService);
  originalAttachments: any[] = [];

  @Input() set id(value: number) {
    this.taskIdentifier = value;
  }
  taskIdentifier: any;
  ngOnInit(): void {
    this.getLookupsData();
  }
  override initForm(): void {
    this.formlyFields = lookupsPredefinedTasksEditorConfig(this);
  }
  setFormMode(readonly: boolean) {
    this.formlyOptions.formState = {
      readonly: readonly,
    };
  }

  override onSubmit(): void {
    const rawAssignees: any[] = this.formlyModel.assigneeIds || [];
    const assigneeIds: string[] = rawAssignees
      .map((item: any) =>
        item && typeof item === 'object' ? item.value : item,
      )
      .filter((v: any) => v != null && v !== '');

    const formData = new FormData();

    formData.append('NameEn', this.formlyModel.nameEn ?? '');
    formData.append('NameAr', this.formlyModel.nameAr ?? '');
    formData.append('IsActive', String(this.formlyModel.isActive ?? true));
    formData.append('PriorityId', String(this.formlyModel.priorityId ?? ''));
    formData.append('DurationType', String(this.formlyModel.durationType ?? 1));
    formData.append('Duration', String(this.formlyModel.duration ?? 0));
    formData.append(
      'ClosesMatter',
      String(this.formlyModel.closesMatter ?? false),
    );

    if (assigneeIds.length > 0) {
      assigneeIds.forEach((id) => formData.append('AssigneeIds', String(id)));
    } else {
      formData.append('AssigneeIds', '');
    }

    const attachmentField = findField(this.formlyFields, 'attachments');
    const deletedIds: number[] =
      attachmentField?.props?.['deletedAttachmentIds'] ?? [];

    if (deletedIds.length > 0) {
      deletedIds.forEach((id) =>
        formData.append('removedAttachmentIds', String(id)),
      );
    }

    const existingDocumentIds: number[] = (this.formlyModel.attachments || [])
      .filter(
        (f: any) =>
          f instanceof File &&
          (f as any)?.id != null &&
          !deletedIds.includes(Number((f as any).id)),
      )
      .map((f: any) => Number((f as any).id));

    if (existingDocumentIds.length > 0) {
      existingDocumentIds.forEach((id) =>
        formData.append('existingDocumentIds', String(id)),
      );
    }

    const newFiles = (this.formlyModel.attachments || []).filter(
      (f: any) => f instanceof File && !(f as any).id,
    );

    if (newFiles.length > 0) {
      newFiles.forEach((file: File) => formData.append('attachments', file));
    }

    const request$ = this.taskIdentifier
      ? this._apiService.put(
          `${API_Config.predefinedTasks.update}/${this.taskIdentifier}`,
          formData,
        )
      : this._apiService.post(API_Config.predefinedTasks.create, formData);

    this.isSubmitted = true;

    request$
      .pipe(
        finalize(() => (this.isSubmitted = false)),
        this._unsubscribe.takeUntilDestroy(),
      )
      .subscribe({
        next: (res: ApiRes) => {
          if (res && res.isSuccess) {
            this._toastrNotifiService.displaySuccess(res?.message);
            this._router.navigate(['/lookups/predefined-tasks']);
          } else {
            this._toastrNotifiService.displayError(res?.message);
          }
        },
        error: (err: any) => {
          this._toastrNotifiService.displayError(err?.error?.message);
        },
      });
  }

  setAssigneeValue() {
    const ids: string[] = (this.formlyModel?.assigneeIds ?? [])
      .map((x: any) => (typeof x === 'object' ? x.value : x))
      .filter(Boolean);

    const usersList = this.lookupsData?.users ?? [];
    const nameKey =
      this._languageService.getSelectedLanguage() === 'en'
        ? 'nameEn'
        : 'nameAr';

    return ids
      .map((guid) => {
        const user = usersList.find((u: any) => u.id === guid);
        if (!user) return null;
        return {
          label: user[nameKey] ?? user.name ?? guid,
          value: user.id,
        };
      })
      .filter(Boolean);
  }
  setFormData(): void {
    this._apiService
      .get(`${API_Config.predefinedTasks.getById}/${this.taskIdentifier}`)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: any) => {
          const data = res?.data ?? res?.result ?? res;
          const rawAttachments: any[] =
            data?.attachments ?? data?.attachment ?? [];
          const rawAssigneeIds: string[] = data?.assigneeIds ?? [];
          const usersList = this.lookupsData?.users ?? [];
          const priorityList = this.lookupsData?.taskPriority ?? [];
          const nameKey =
            this._languageService.getSelectedLanguage() === 'en'
              ? 'nameEn'
              : 'nameAr';

          this.originalAttachments = JSON.parse(JSON.stringify(rawAttachments));
          this.initForm();
          this.formlyModel = {
            nameEn: data.nameEn ?? data.taskDescription ?? '',
            nameAr: data.nameAr ?? data.foreignDescription ?? '',
            isActive: data.isActive ?? true,
            priorityId: data.priorityId,
            durationType: data.durationType,
            duration: data.duration,
            assigneeIds: rawAssigneeIds,
            attachments: rawAttachments.map((obj: any) => ({
              id: obj.id,
              taskId: obj.taskId ?? obj.predefinedTaskId,
              filePath:
                obj.filePath ??
                `http://placeholder.local/${obj.fileName ?? obj.id}`,
              fileName: obj.fileName,
            })),
          };
          const priorityField: FieldTypeConfig = findField(
            this.formlyFields,
            'priorityId',
          );
          if (priorityField && data.priorityId != null) {
            const selected = priorityList.find(
              (p: any) => p.id == data.priorityId,
            );
            if (selected) {
              priorityField.props['selectedObj'] = {
                label: selected[nameKey] ?? selected.name,
                value: selected.id,
              };
            }
          }
          const assigneeField: FieldTypeConfig = findField(
            this.formlyFields,
            'assigneeIds',
          );
          if (assigneeField && rawAssigneeIds.length) {
            assigneeField.props['selectedObj'] = rawAssigneeIds.map(
              (guid: string) => {
                const user = usersList.find((u: any) => u.id == guid);
                return {
                  label: user?.[nameKey] ?? user?.name ?? guid,
                  value: guid,
                };
              },
            );
          }

          this.formlyFields = [...this.formlyFields];
          this.formlyModel = { ...this.formlyModel };

          console.log('👤 assigneeIds:', this.formlyModel.assigneeIds);
          console.log('👤 selectedObj:', assigneeField?.props?.['selectedObj']);
          console.log('📎 attachments:', this.formlyModel.attachments);
        },
        error: (err) => console.error('setFormData:', err),
      });
  }

  setPriorityValue() {
    const selected = this.lookupsData?.taskPriority?.find(
      (obj: any) => obj.id == this.formlyModel?.priorityId,
    );
    if (!selected) return null;
    const nameKey =
      this._languageService.getSelectedLanguage() === 'en'
        ? 'nameEn'
        : 'nameAr';
    return { label: selected[nameKey] ?? selected.name, value: selected.id };
  }

  override getLookupsData(): void {
    this.isLoading = true;
    combineLatest({
      users: this._apiService.get(API_Config.predefinedTasks.lookupsUsers),
      taskPriority: this._apiService.get(API_Config.taskPriorities.get),
    })
      .pipe(
        finalize(() => (this.isLoading = false)),
        this._unsubscribe.takeUntilDestroy(),
      )
      .subscribe({
        next: (res: any) => {
          this.lookupsData = {
            users: res.users?.data ?? res.users?.result ?? [],
            taskPriority: res.taskPriority?.result?.items ?? [],
          };

          console.log('✅ users:', this.lookupsData.users);
          console.log('✅ taskPriority:', this.lookupsData.taskPriority);

          this.initForm();
          this.setFormMode(this._router.url.includes('view'));
          if (this.taskIdentifier) this.setFormData();
        },
      });
  }

  onEdit() {
    this.setFormMode(false);
  }

  downloadTaskAttachment(attachment: any) {
    this._fileService.downloadDocumentPredefiendTask(attachment.id).subscribe({
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

  ngOnDestroy(): void {
    this._unsubscribe.destroy();
  }
}
