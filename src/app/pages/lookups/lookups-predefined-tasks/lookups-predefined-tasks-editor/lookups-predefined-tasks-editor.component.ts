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
    .map((item: any) => (item && typeof item === 'object' ? item.value : item))
    .filter((v: any) => v != null && v !== '');

  const formData = new FormData();
  formData.append('nameEn', this.formlyModel.nameEn ?? '');
  formData.append('nameAr', this.formlyModel.nameAr ?? '');
  formData.append('isActive', String(this.formlyModel.isActive ?? true));
  formData.append('priorityId', String(this.formlyModel.priorityId ?? ''));
  formData.append('durationType', String(this.formlyModel.durationType ?? 1));
  formData.append('duration', String(this.formlyModel.duration ?? 0));

  if (assigneeIds.length > 0) {
    assigneeIds.forEach((id) => formData.append('assigneeIds', String(id)));
  } else {
    formData.append('assigneeIds', '');
  }

  // ============================================================
  // ★★★ المرفقات — 3 حاجات منفصلة
  // ============================================================

  // 1) الملفات المحذوفة — ابعت IDs كل واحد لوحده
  const attachmentField = findField(this.formlyFields, 'attachments');
  const deletedIds: number[] =
    attachmentField?.props?.['deletedAttachmentIds'] ?? [];

  deletedIds.forEach((id) =>
    formData.append('AttachmentIdsToDelete', String(id))   // ★ repeated
  );

  // 2) الملفات الجديدة — ارفعها
  const newFiles = (this.formlyModel.attachments || []).filter(
    (f: any) => f instanceof File
  );
  newFiles.forEach((file: File) =>
    formData.append('attachments', file)
  );

  // ★ شيل السطر ده — مش محتاجه دلوقتي
  // formData.append('ReplaceAttachments', 'true');

  // ============================================================

  const request$ = this.taskIdentifier
    ? this._apiService.put(
        `${API_Config.predefinedTasks.update}/${this.taskIdentifier}`,
        formData
      )
    : this._apiService.post(API_Config.predefinedTasks.create, formData);

  this.isSubmitted = true;

  request$
    .pipe(
      finalize(() => (this.isSubmitted = false)),
      this._unsubscribe.takeUntilDestroy()
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
    this._languageService.getSelectedLanguage() === 'en' ? 'nameEn' : 'nameAr';

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
        const rawAttachments: any[] = data?.attachments ?? data?.attachment ?? [];
        const rawAssigneeIds: string[] = data?.assigneeIds ?? [];
        const usersList = this.lookupsData?.users ?? [];
        const priorityList = this.lookupsData?.taskPriority ?? [];
        const nameKey =
          this._languageService.getSelectedLanguage() === 'en'
            ? 'nameEn'
            : 'nameAr';

        // snapshot
        this.originalAttachments = JSON.parse(JSON.stringify(rawAttachments));

        // ★ 1) rebuild الـ fields الأول
        this.initForm();

        // ★ 2) عيّن الـ model — assigneeIds كـ VALUES فقط
        this.formlyModel = {
          nameEn: data.nameEn ?? data.taskDescription ?? '',
          nameAr: data.nameAr ?? data.foreignDescription ?? '',
          isActive: data.isActive ?? true,
          priorityId: data.priorityId,
          durationType: data.durationType,
          duration: data.duration,
          assigneeIds: rawAssigneeIds,          // ★ ["664...", ...]
attachments: rawAttachments.map((obj: any) => ({
  id: obj.id,
  taskId: obj.taskId ?? obj.predefinedTaskId,
  // ★★★★ ضيف placeholder URL عشان الـ shared component يشتغل
  filePath: obj.filePath ?? `http://placeholder.local/${obj.fileName ?? obj.id}`,
  fileName: obj.fileName,
})),
        };

        // ★ 3) عيّن selectedObj للـ priority (single select)
        const priorityField: FieldTypeConfig = findField(this.formlyFields, 'priorityId');
        if (priorityField && data.priorityId != null) {
          const selected = priorityList.find((p: any) => p.id == data.priorityId);
          if (selected) {
            priorityField.props['selectedObj'] = {
              label: selected[nameKey] ?? selected.name,
              value: selected.id,
            };
          }
        }

        // ★ 4) عيّن selectedObj للـ assignee (multi select) كـ [{label,value}]
        const assigneeField: FieldTypeConfig = findField(this.formlyFields, 'assigneeIds');
        if (assigneeField && rawAssigneeIds.length) {
          assigneeField.props['selectedObj'] = rawAssigneeIds.map((guid: string) => {
            const user = usersList.find((u: any) => u.id == guid);
            return {
              label: user?.[nameKey] ?? user?.name ?? guid,
              value: guid,
            };
          });
        }

        // ★ 5) trigger change detection على الـ fields والـ model
        this.formlyFields = [...this.formlyFields];
        this.formlyModel = { ...this.formlyModel };

        console.log('👤 assigneeIds:', this.formlyModel.assigneeIds);
        console.log('👤 selectedObj:', assigneeField?.props?.['selectedObj']);
        console.log('📎 attachments:', this.formlyModel.attachments);
      },
      error: (err) => console.error('❌ setFormData:', err),
    });
}

setPriorityValue() {
  const selected = this.lookupsData?.taskPriority?.find(   // ★ شيل .result
    (obj: any) => obj.id == this.formlyModel?.priorityId
  );
  if (!selected) return null;
  const nameKey =
    this._languageService.getSelectedLanguage() === 'en' ? 'nameEn' : 'nameAr';
  return { label: selected[nameKey] ?? selected.name, value: selected.id };
}
private hasAttachmentsChanged(): boolean {
  const current = this.formlyModel?.attachments ?? [];
  const newFiles = current.filter((f: any) => f instanceof File);
  const currentExisting = current.filter(
    (f: any) => !(f instanceof File) && f?.id != null
  );

  console.log('🔍 current:', current);
  console.log('🔍 newFiles:', newFiles.length);
  console.log('🔍 currentExisting:', currentExisting.length);
  console.log('🔍 original:', this.originalAttachments.length);

  if (newFiles.length > 0) return true;
  if (currentExisting.length !== this.originalAttachments.length) return true;
  return false;
}

override getLookupsData(): void {
  this.isLoading = true;
  combineLatest({
    users: this._apiService.get(API_Config.predefinedTasks.lookupsUsers),
    taskPriority: this._apiService.get(API_Config.taskPriorities.get),
  })
    .pipe(
      finalize(() => (this.isLoading = false)),
      this._unsubscribe.takeUntilDestroy()
    )
    .subscribe({
      next: (res: any) => {
        // ★ users: { data: [...] }
        // ★ taskPriority: { result: { items: [...] } }
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
