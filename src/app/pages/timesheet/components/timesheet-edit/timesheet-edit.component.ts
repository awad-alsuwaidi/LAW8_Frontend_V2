import { Component, inject, OnInit } from '@angular/core';
import { combineLatest, finalize } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { AuthService } from 'src/app/@core/services';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { SharedModule } from 'src/app/@shared/shared.module';
import { timesheetEditorFormlyConfig } from './timesheet-edit-formly.config';
import { GLOBAL_DATE_TIME_Without_Seconds2_FORMATE } from 'src/app/@core/utilities/defines/date-time';
import { DatePipe } from '@angular/common';

// export enum TaskEnum {
//   Billable = 1,
//   NonBillable = 2,
//   Internal = 3,
// }
export enum TaskEnum {
  Billable = 1,
  NonBillable = 2,
  NoCharge = 3,
}
@Component({
  selector: 'app-timesheet-edit',
  standalone: true,
  imports: [FormlyConfigModule, SharedButtonComponent, SharedModule],
  templateUrl: './timesheet-edit.component.html',
  styleUrl: './timesheet-edit.component.scss',
  providers: [DatePipe],
})
export class TimesheetEditComponent extends FormBaseClass implements OnInit {
  private readonly _datePipe = inject(DatePipe);
  _authService = inject(AuthService);
  zeroAmountTaskIds = [TaskEnum.NonBillable, TaskEnum.NoCharge];


ngOnInit(): void {
  this.getLookupsData();
}

  transformDate(date: any): string | null {
    return date
      ? this._datePipe.transform(
          date,
          GLOBAL_DATE_TIME_Without_Seconds2_FORMATE
        )
      : null;
  }

  override getLookupsData(): void {
    this.isLoading = true;
    combineLatest({
      matterId: this._apiService.get(API_Config.general.getMatterCodes),
      lawyers: this._apiService.get(
        API_Config.general.getUsersInitialSaparateForTimeShet
      ),
      tasks: this._apiService.get(API_Config.general.getTaskCode),
      holds: this._apiService.get(API_Config.general.getAllBillingHold),
    })
      .pipe(
        finalize(() => (this.isLoading = false)),
        this._unsubscribe.takeUntilDestroy()
      )
      .subscribe({
        next: (res) => {
          this.lookupsData = res;
          this.initForm();
        },
      });
  }

  override getData(): void {
    if (this._dynamicDialogConfig.data?.id) {
      const params = { id: this._dynamicDialogConfig.data.id };
      this._apiService
        .get(API_Config.timesheet.getById, params)
        .pipe(this._unsubscribe.takeUntilDestroy())
        .subscribe({
          next: (res: ApiRes) => {
            if (res && res.isSuccess) {
            //   this.formlyModel = {
            //     ...res.result,
            //   };
           const dateValue = res.result.tmDateDate || res.result.tmDate;

this.formlyModel = {
  ...res.result,
  tmDateDate: dateValue
    ? new Date(
        new Date(dateValue).getFullYear(),
        new Date(dateValue).getMonth(),
        new Date(dateValue).getDate()
      )
    : null,
};
              this.convertMatterIdToObject();
              this.setFormData();
setTimeout(() => {
  this.calculateAmount();
});
            }
          },
        });
    }
  }

isZeroAmountTask(taskId: any): boolean {
  const id = typeof taskId === 'object' ? taskId?.value : taskId;
  return this.zeroAmountTaskIds.includes(Number(id));
}

calculateAmount(): void {
  const taskId = this.formly.get('law_TaskCodeId')?.value;
  const amountControl = this.formly.get('amount');
  if (this.isZeroAmountTask(taskId)) {
    amountControl?.setValue(0, { emitEvent: false });
    this.formlyModel = {
      ...this.formlyModel,
      amount: 0,
    };
    return;
  }
  const rate = Number(this.formly.get('rate')?.value) || 0;
  const hours = Number(this.formly.get('hours')?.value) || 0;
  const amount = +(rate * hours).toFixed(2);
  amountControl?.setValue(amount, { emitEvent: false });

  this.formlyModel = {
    ...this.formlyModel,
    amount,
  };
}

handleAmountByTask(): void {
  const taskValue = this.formly.get('law_TaskCode')?.value 
                 || this.formly.get('taskId')?.value;

  const taskId = typeof taskValue === 'object' ? taskValue.value : taskValue;

  const amountControl = this.formly.get('amount');

  if (this.zeroAmountTaskIds.includes(taskId)) {
    amountControl?.setValue(0, { emitEvent: false });
    amountControl?.disable({ emitEvent: false });
    this.formlyModel.amount = 0;
  } else {
    amountControl?.enable({ emitEvent: false });
  }
}

  initForm(): void {
    this.formlyFields = timesheetEditorFormlyConfig(this);
    if (this._dynamicDialogConfig.data?.id) {
      this.getData();
    } else {
      this.setFormData();
    }
  }

  convertMatterIdToObject(): void {
    if (
      this.formlyModel.matterId &&
      typeof this.formlyModel.matterId === 'number'
    ) {
      const matterOptions = this.lookupsData?.matterId?.result;
      if (matterOptions) {
        const selectedMatter = matterOptions.find(
          (matter: any) => matter.id === this.formlyModel.matterId
        );
        if (selectedMatter) {
          this.formlyModel.matterId = {
            label: selectedMatter.name,
            value: selectedMatter.id,
          };
        }
      }
    }
  }

  setFormData(): void {
    if (!this.formlyModel || Object.keys(this.formlyModel).length === 0) {
      this.formlyModel = { ...this._dynamicDialogConfig.data };
    }
      // holds: this._apiService.get(API_Config.general.getAllBillingHold),

    if (
      this.formlyModel?.matterId &&
      typeof this.formlyModel.matterId === 'number'
    ) {
      this.convertMatterIdToObject();
    }
  }

  private formatDateOnly(date: any): string | null {
  if (!date) return null;

  if (typeof date === 'string') {
    return date.includes('T') ? date.split('T')[0] : date;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}


onSubmit(): void {
  this.formly.markAllAsTouched();

  if (this.formly.invalid) return;

  const formValue = this.formly.getRawValue();

const matterId =
  typeof formValue.matterId === 'object'
    ? formValue.matterId?.value
    : formValue.matterId;

const payload = {
  id: this.formlyModel?.id,
  matterId: matterId,
  law_LawerId: formValue.law_LawerId,
  mtrNo: this.formlyModel?.mtrNo,
  law_TaskCodeId: formValue.law_TaskCodeId,

  tmDateDate: this.formatDateOnly(formValue.tmDateDate),

  hours: Number(formValue.hours) || 0,
  explanationExplanation: formValue.explanationExplanation,
  notes: formValue.notes || '',
  // rate: Number(formValue.rate) || 0,
  // amount: this.isZeroAmountTask(formValue.law_TaskCodeId)
  //   ? 0
  //   : Number(formValue.amount) || 0,
  rate:
  formValue.rate != null
    ? Number(formValue.rate)
    : this.formlyModel?.rate,

amount: this.isZeroAmountTask(formValue.law_TaskCodeId)
  ? 0
  : (
      (
        formValue.rate != null
          ? Number(formValue.rate)
          : Number(this.formlyModel?.rate || 0)
      ) * (Number(formValue.hours) || 0)
    ),

  hold: this.formlyModel?.hold ?? null,
  holdId: formValue.holdId,
  holdName: this.formlyModel?.holdName ?? null,
  item: formValue.explanationExplanation || 'Timesheet Entry',
};

  this.isSubmitted = true;

  this._apiService
    .post(API_Config.timesheet.updateList, payload)
    .pipe(
      finalize(() => (this.isSubmitted = false)),
      this._unsubscribe.takeUntilDestroy()
    )
    .subscribe({
      next: (res: ApiRes) => {
        if (res.isSuccess) {
          this._toastrNotifiService.displaySuccess(
            res.message || 'تم الحفظ بنجاح ✅'
          );
          this._dynamicDialogRef.close(true);
        } else {
          this._toastrNotifiService.displayError(
            res.message || 'فشل في العملية ❌'
          );
        }
      },
      error: (err) => {
        console.error('Error while saving timesheet:', err);
        this._toastrNotifiService.displayError(
          err?.error?.message || 'حدث خطأ غير متوقع ❌'
        );
      },
    });
}
}
