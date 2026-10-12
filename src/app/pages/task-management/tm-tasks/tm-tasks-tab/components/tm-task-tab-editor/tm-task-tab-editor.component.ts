import { Component, inject, OnInit } from '@angular/core';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { matterTaskEditorFields } from './tm-task-tab-editor-formly.config';
import { SharedModule } from 'src/app/@shared/shared.module';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { combineLatest, finalize } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { DatePipe } from '@angular/common';
import { GLOBAL_DATE_TIME_Without_Seconds_FORMATE } from 'src/app/@core/utilities/defines/date-time';
import { FieldTypeConfig } from '@ngx-formly/core';
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

  ngOnInit(): void {
    this.getLookupsData();
  }

  override getLookupsData(): void {
    this.isLoading = true;
    combineLatest({
      lawyers: this._apiService.get(API_Config.general.getLawyerShort),
      taskStatus: this._apiService.get(API_Config.general.getActivityStatus),
      taskPriority: this._apiService.get(API_Config.general.getTaskPriority),
      matterCode: this._apiService.get(API_Config.general.getMatterCodes),
    })
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res) => {
          this.lookupsData = res;
          this.formlyFields = matterTaskEditorFields(this);
          if (this._dynamicDialogConfig?.data?.rowData) {
            this.setFormData();
          } else {
            this.isLoading = false;
          }
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

    this._apiService
      .get(API_Config.matterTask.getById, param)
      .pipe(
        finalize(() => (this.isLoading = false)),
        this._unsubscribe.takeUntilDestroy(),
      )
      .subscribe({
        next: (res: ApiRes) => {
          this.formlyModel = {
            ...res['result'],
            StartDate: res['result'].startDate
              ? this._datePipe.transform(
                  res['result'].startDate,
                  GLOBAL_DATE_TIME_Without_Seconds_FORMATE,
                )
              : null,
            DueDate: res['result'].dueDate
              ? this._datePipe.transform(
                  res['result'].dueDate,
                  GLOBAL_DATE_TIME_Without_Seconds_FORMATE,
                )
              : null,
            AttachmentList: res['result'].attachmentList,
            Periority: res['result'].periority,
          };
          // this.formlyFields = matterTaskEditorFields(this)
          this.formly.patchValue(this.formlyModel);
          const periorityField: FieldTypeConfig = findField(
            this.formlyFields,
            'Periority',
          );
          const statusField: FieldTypeConfig = findField(
            this.formlyFields,
            'status',
          );
          const assigneeListField: FieldTypeConfig = findField(
            this.formlyFields,
            'assigneeList',
          );
          const matterField: FieldTypeConfig = findField(
            this.formlyFields,
            'matterId',
          );
          if (this.formlyModel?.matterId && matterField) {
            matterField.props['selectedObj'] = this.setMatterValue();
          }
          if (this.formlyModel?.periority && periorityField) {
            periorityField.props['selectedObj'] = this.setPriorityValue();
          }
          if (this.formlyModel?.status && statusField) {
            statusField.props['selectedObj'] = this.setStatusValue();
          }
          if (this.formlyModel?.assigneeList && assigneeListField) {
            assigneeListField.props['selectedObj'] = this.setAssigneeValue();
          }
        },
      });
  }

  setMatterValue() {
    const selectedMatter = this.lookupsData?.matterCode?.result.find(
      (obj: any) => obj.id == this.formlyModel?.matterId,
    );

    if (!selectedMatter) return null;

    return {
      label: selectedMatter?.name,
      value: selectedMatter?.id,
    };
  }

  onEdit() {
    this.formlyOptions.formState.readonly = false;
    this._dynamicDialogConfig.header =
      this._languageService.getTransValue('common.editTask');
  }

  setPriorityValue() {
    const selectedPriority = this.lookupsData?.taskPriority?.result.find(
      (obj: any) => obj.id == this.formlyModel?.periority,
    );
    if (!selectedPriority) return null;
    return {
      label: selectedPriority?.name,
      value: selectedPriority?.id,
    };
  }
  setStatusValue() {
    const selectedStatus = this.lookupsData?.taskStatus?.result.find(
      (obj: any) => obj.id == this.formlyModel?.status,
    );
    if (!selectedStatus) return null;
    return {
      label: selectedStatus?.name,
      value: selectedStatus?.id,
    };
  }
  setAssigneeValue() {
    const selectedAssignee = this.lookupsData?.lawyers?.result.filter(
      (obj: any) => this.formlyModel?.assigneeList.includes(obj.id),
    );
    if (!selectedAssignee) return null;
    return selectedAssignee.map((obj: any) => ({
      label: obj?.name,
      value: obj?.id,
    }));
  }
  override onSubmit(): void {
    if (this.formly.invalid) return;
    delete this.formlyModel.fileName;
    this.isSubmitted = true;

    const formattedStartDate = this._datePipe.transform(
      this.formlyModel.StartDate,
      'yyyy-MM-ddTHH:mm:ss.SSSZ',
    );
    const formattedDueDate = this._datePipe.transform(
      this.formlyModel.DueDate,
      'yyyy-MM-ddTHH:mm:ss.SSSZ',
    );

    // this.formlyModel.StartDate = formattedStartDate;
    // this.formlyModel.DueDate = formattedDueDate;
    this.formlyModel.StartDate = this._datePipe.transform(
      this.formlyModel.StartDate,
      'yyyy-MM-dd',
    );

    this.formlyModel.DueDate = this._datePipe.transform(
      this.formlyModel.DueDate,
      'yyyy-MM-dd',
    );

    const requestPayload = this._dynamicDialogConfig?.data?.rowData
      ? {
          description: this.formlyModel.description,
          StartDate: this.formlyModel.StartDate,
          DueDate: this.formlyModel.DueDate,
          assigneeList: this.formlyModel.assigneeList,
          Periority: this.formlyModel.Periority,
          status: this.formlyModel.status,
          notes: this.formlyModel.notes,
          AttachmentList: this.formlyModel.AttachmentList,
          // ...this.formlyModel,
          id: this._dynamicDialogConfig?.data?.rowData?.id,
          matterId: this.formlyModel.matterId,
        }
      : {
          ...this.formlyModel,
          MatterId: this._dynamicDialogConfig?.data?.matterIdentifier,
        };

    let formData = new FormData();
    for (const [key, value] of Object.entries(requestPayload)) {
      if (key === 'AttachmentList' || key === 'assigneeList') continue;
      formData.append(key, `${value}`);
    }

    // if (this.formlyModel.AttachmentList && this.formlyModel.AttachmentList.length>0){
    //   this.formlyModel.AttachmentList.forEach((file:File) => {
    //     formData.append(`AttachmentList`, file);
    //   });
    // }
    // if (this.formlyModel.AttachmentList && this.formlyModel.AttachmentList.length>0){
    //   this.formlyModel.AttachmentList.forEach((file:File) => {
    //     formData.append(`AttachmentList`, file);
    //   });
    // }
    // this.formlyModel?.AttachmentList?.forEach((file: File) => {
    //   formData?.append('AttachmentList', file);
    // });
    const newFiles = this.formlyModel.AttachmentList.filter(
      (file: any) => file instanceof File,
    );

    newFiles.forEach((file: File) => {
      formData.append('AttachmentList', file);
    });

    const attachmentField = findField(this.formlyFields, 'AttachmentList');

    const deletedIds = attachmentField?.props?.['deletedAttachmentIds'] || [];

    deletedIds.forEach((id: number) => {
      formData.append('AttachmentListIdToDelete', id.toString());
    });

    // if (this.formlyModel.assigneeList && this.formlyModel.assigneeList.length > 0) {
    //   formData.append(`assigneeList`, JSON.stringify(this.formlyModel.assigneeList));
    // }
    if (
      this.formlyModel.assigneeList &&
      this.formlyModel.assigneeList.length > 0
    ) {
      this.formlyModel.assigneeList.forEach((id: string) => {
        formData.append('assigneeList', id);
      });
    }

    const path = this._dynamicDialogConfig?.data?.rowData
      ? API_Config.matterTask.update
      : API_Config.matterTask.create;

    this._apiService
      .post(path, formData)
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
          this._toastrNotifiService.displayError(err?.error?.message);
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
