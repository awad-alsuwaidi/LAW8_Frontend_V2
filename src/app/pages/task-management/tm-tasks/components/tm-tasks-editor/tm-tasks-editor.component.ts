import { DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FieldTypeConfig } from '@ngx-formly/core';
import { combineLatest, finalize } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { GLOBAL_DATE_TIME_Without_Seconds_FORMATE } from 'src/app/@core/utilities/defines/date-time';
import { findField } from 'src/app/@core/utilities/functions/find-field';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { SharedModule } from 'src/app/@shared/shared.module';
import { matterTaskEditorFields } from './tm-tasks-editor-formly.config';
import { SharedSkeletonGridComponent } from 'src/app/@shared/components/shared-skeleton-grid/shared-skeleton-grid.component';

@Component({
  selector: 'app-tm-tasks-editor',
  standalone: true,
  imports: [
    SharedModule,
    FormlyConfigModule,
    SharedButtonComponent,
    SharedSkeletonGridComponent
  ],
  providers: [DatePipe],
  templateUrl: './tm-tasks-editor.component.html',
  styleUrl: './tm-tasks-editor.component.scss'
})
export class TmTasksEditorComponent extends FormBaseClass implements OnInit {
  private readonly _datePipe = inject(DatePipe);
  mode!: string;

  ngOnInit(): void {
    this.getLookupsData();
  }

  override getLookupsData(): void {
    this.isLoading=true
    combineLatest({
      lawyers: this._apiService.get(API_Config.general.getLawyerShort),
      taskStatus: this._apiService.get(API_Config.general.getActivityStatus),
      taskPriority: this._apiService.get(API_Config.general.getTaskPriority),
      matterCode: this._apiService.get(API_Config.general.getMatterCodes),
    })
      .pipe(
        finalize(()=>this.isLoading=false),
        this._unsubscribe.takeUntilDestroy()
      )
      .subscribe({
        next: (res) => {
          this.lookupsData = res;
          this.lookupsData.taskPriority.result = this.lookupsData.taskPriority.result
            .filter((obj: any) => obj.id !== 5 );
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

  private setFormData(): void {
    this.mode = this._dynamicDialogConfig.data.mode;
    this.formlyOptions.formState = {
      readonly: this.mode === 'view'
    };

    const param = { id: this._dynamicDialogConfig?.data?.rowData?.id };

    this._apiService
      .get(API_Config.matterTask.getById, param)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          this.prepareFormlyModel(res.result);
          this.formlyFields = matterTaskEditorFields(this);
          this.formly.patchValue(this.formlyModel);
          this.setSelectedValuesForFields();
        },
      });
  }

  private prepareFormlyModel(result: any): void {
    this.formlyModel = {
      ...result,
      StartDate: result.startDate
        ? this._datePipe.transform(result.startDate, GLOBAL_DATE_TIME_Without_Seconds_FORMATE)
        : null,
      DueDate: result.dueDate
        ? this._datePipe.transform(result.dueDate, GLOBAL_DATE_TIME_Without_Seconds_FORMATE)
        : null,
      AttachmentList: result.attachmentList,
      Periority: result.periority,
    };
  }

  private setSelectedValuesForFields(): void {
    const periorityField: FieldTypeConfig = findField(this.formlyFields, 'Periority');
    const statusField: FieldTypeConfig = findField(this.formlyFields, 'status');
    const assigneeListField: FieldTypeConfig = findField(this.formlyFields, 'assigneeList');

    if (this.formlyModel?.periority && periorityField) {
      periorityField.props['selectedObj'] = this.setPriorityValue();
    }

    if (this.formlyModel?.status && statusField) {
      statusField.props['selectedObj'] = this.setStatusValue();
    }

    if (this.formlyModel?.assigneeList && assigneeListField) {
      assigneeListField.props['selectedObj'] = this.setAssigneeValue();
    }
  }

  onEdit(): void {
    this.formlyOptions.formState.readonly = false;
  }

  private setPriorityValue(): { label: string; value: any } | null {
    const selectedPriority = this.lookupsData?.taskPriority?.result
      .find((obj: any) => obj.id == this.formlyModel?.periority);

    return selectedPriority ? { label: selectedPriority.name, value: selectedPriority.id } : null;
  }

  private setStatusValue(): { label: string; value: any } | null {
    const selectedStatus = this.lookupsData?.taskStatus?.result
      .find((obj: any) => obj.id == this.formlyModel?.status);

    return selectedStatus ? { label: selectedStatus.name, value: selectedStatus.id } : null;
  }

  private setAssigneeValue(): { label: string; value: any }[] | null {
    const selectedAssignee = this.lookupsData?.lawyers?.result
      .filter((obj: any) => this.formlyModel?.assigneeList.includes(obj.id));

    return selectedAssignee?.map((obj: any) => ({ label: obj.name, value: obj.id })) || null;
  }

  override onSubmit(): void {
    if (this.formly.invalid) return;

    delete this.formlyModel.fileName;
    this.isSubmitted = true;

    this.prepareDatesForSubmission();
    const requestPayload = this.prepareRequestPayload();
    const formData = this.createFormData(requestPayload);

    const path = this._dynamicDialogConfig?.data?.rowData
      ? API_Config.matterTask.update
      : API_Config.matterTask.create;

    this.submitFormData(path, formData);
  }

  private prepareDatesForSubmission(): void {
    this.formlyModel.StartDate = new Date(this.formlyModel.StartDate).toISOString();
    this.formlyModel.DueDate = new Date(this.formlyModel.DueDate).toISOString();
  }

  private prepareRequestPayload(): any {
    return this._dynamicDialogConfig?.data?.rowData
      ? {
        ...this.formlyModel,
        id: this._dynamicDialogConfig?.data?.rowData?.id,
      }
      : {
        ...this.formlyModel,
        // MatterId: this._dynamicDialogConfig?.data?.matterIdentifier,
      };
  }

  private createFormData(requestPayload: any): FormData {
    const formData = new FormData();

    // Append simple fields
    Object.entries(requestPayload).forEach(([key, value]) => {
      if (key !== 'AttachmentList' && key !== 'assigneeList') {
        formData.append(key, `${value}`);
      }
    });

    // Append attachments
    this.formlyModel?.AttachmentList?.forEach((file: File) => {
      formData.append('AttachmentList', file);
    });

    // Append assignees
    if (this.formlyModel.assigneeList?.length > 0) {
      this.formlyModel.assigneeList.forEach((id: string) => {
        formData.append('assigneeList', id);
      });
    }

    return formData;
  }

  private submitFormData(path: string, formData: FormData): void {
    this._apiService
      .post(path, formData)
      .pipe(
        finalize(() => this.isSubmitted = false),
        this._unsubscribe.takeUntilDestroy()
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
          this._toastrNotifiService.displayError(err?.error?.message);
        },
      });
  }
}