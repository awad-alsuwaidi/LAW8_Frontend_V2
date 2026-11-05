import { Component, inject, OnInit } from '@angular/core';
import { combineLatest, finalize, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
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
import { TaskEnum } from '../../enums/task.enum';

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
          GLOBAL_DATE_TIME_Without_Seconds2_FORMATE,
        )
      : null;
  }

  override getLookupsData(): void {
    this.isLoading = true;

    const lookupTypes = ['taskCodes', 'billingHolds'];

    const lookupsQuery = lookupTypes
      .map((t, i) => `types[${i}]=${t}`)
      .join('&');

    const lookupsUrl = `${API_Config.timesheet.lookups}?${lookupsQuery}`;
    const mattersUrl = `${API_Config.general.getMainMatters}?pageNumber=1&pageSize=100`;
    const usersUrl = `${API_Config.timesheet.users}?mode=add`;

    const timesheetId = this._dynamicDialogConfig.data?.id;

    const timesheetReq$ = timesheetId
      ? this._apiService
          .get(`${API_Config.timesheet.list}/${timesheetId}`)
          .pipe(catchError(() => of(null)))
      : of(null);

    combineLatest({
      matters: this._apiService.get(mattersUrl).pipe(
        catchError((err) => {
          console.error('MATTERS API ERROR:', err);
          return of(null);
        }),
      ),

      users: this._apiService.get(usersUrl).pipe(
        catchError((err) => {
          console.error('USERS API ERROR:', err);
          return of(null);
        }),
      ),

      lookups: this._apiService.get(lookupsUrl).pipe(
        catchError((err) => {
          console.error('LOOKUPS API ERROR:', err);
          return of(null);
        }),
      ),

      timesheet: timesheetReq$,
    })
      .pipe(
        finalize(() => (this.isLoading = false)),
        this._unsubscribe.takeUntilDestroy(),
      )
      .subscribe({
        next: (res: any) => {
          const matters = res.matters?.result?.items ?? [];
          const lawyers = res.users?.result ?? [];
          const tasks = res.lookups?.result?.taskCodes ?? [];
          const holds = res.lookups?.result?.billingHolds ?? [];

          this.lookupsData = {
            matterId: { result: matters },
            lawyers: { result: lawyers },
            tasks: { result: tasks },
            holds: { result: holds },
          };
          const apiData = res.timesheet?.result;
          this.initForm(apiData);
        },

        error: (err) => {
          console.error('Error loading timesheet data:', err);
          this.isLoading = false;
        },
      });
  }

  initForm(apiData?: any): void {
    this.formlyFields = timesheetEditorFormlyConfig(this);
    const rowData = apiData || this._dynamicDialogConfig.data;

    if (rowData && Object.keys(rowData).length > 0) {
      const dateValue = rowData.date;

      this.formlyModel = {
        ...rowData,
        tmDateDate: dateValue ? new Date(dateValue) : new Date(),
        law_TaskCodeId: rowData.taskCodeId,
        law_LawerId: rowData.userId,
        explanationExplanation: rowData.description,
        holdId: rowData.hold,
        rate: rowData.rateAmount ?? rowData.rate,
        amount: rowData.amount,
        matterId: rowData.matterId,
      };

      this.setFormData();

      setTimeout(() => {
        this.calculateAmount();
      }, 100);
    } else {
      this.formlyModel = {};
      this.setFormData();
    }
  }

  setFormData(): void {
    if (!this.formlyModel || Object.keys(this.formlyModel).length === 0) {
      this.formlyModel = { ...this._dynamicDialogConfig.data };
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

  isZeroAmountTask(taskId: any): boolean {
    const id = typeof taskId === 'object' ? taskId?.value : taskId;
    return this.zeroAmountTaskIds.includes(Number(id));
  }

  calculateAmount(): void {
    const taskId = this.formly.get('law_TaskCodeId')?.value;
    const amountControl = this.formly.get('amount');

    if (this.isZeroAmountTask(taskId)) {
      amountControl?.setValue(0, { emitEvent: false });
      this.formlyModel = { ...this.formlyModel, amount: 0 };
      return;
    }
    const rate = Number(this.formly.get('rate')?.value) || 0;
    const hours = Number(this.formly.get('hours')?.value) || 0;
    const amount = +(rate * hours).toFixed(2);
    amountControl?.setValue(amount, { emitEvent: false });
    this.formlyModel = { ...this.formlyModel, amount };
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
      matterId: matterId,
      date: this.formatDateOnly(formValue.tmDateDate),
      taskCodeId: formValue.law_TaskCodeId,
      userId: formValue.law_LawerId,
      hours: Number(formValue.hours) || 0,
      rateId: this.formlyModel?.rateId || null,
      description: formValue.explanationExplanation,
      notes: formValue.notes || '',
      hold: formValue.holdId || 1,
    };

    this.isSubmitted = true;

    this._apiService
      .put(`${API_Config.timesheet.list}/${this.formlyModel.id}`, payload)
      .pipe(
        finalize(() => (this.isSubmitted = false)),
        this._unsubscribe.takeUntilDestroy(),
      )
      .subscribe({
        next: (res: ApiRes) => {
          if (res.isSuccess) {
            this._toastrNotifiService.displaySuccess(
              res.message || 'تم الحفظ بنجاح ',
            );
            this._dynamicDialogRef.close({
              success: true,
              id: this.formlyModel.id,
            });
          } else {
            this._toastrNotifiService.displayError(
              res.message || 'فشل في العملية ',
            );
          }
        },
        error: (err: any) => {
          this._toastrNotifiService.displayError(
            err?.error?.message || 'حدث خطأ غير متوقع ',
          );
        },
      });
  }
}
