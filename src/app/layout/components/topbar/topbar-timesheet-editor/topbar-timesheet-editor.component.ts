import { Component, Input, OnInit, inject } from '@angular/core';
import { combineLatest, finalize } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { SharedModule } from 'src/app/@shared/shared.module';
import { topbarTimesheetEditorFormlyConfig } from './topbar-timesheet-editor-formly.config';
import { SharedSkeletonGridComponent } from 'src/app/@shared/components/shared-skeleton-grid/shared-skeleton-grid.component';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { timeStringToSeconds } from 'src/app/@core/utilities/functions/time-string-to-seconds';
import { AuthService } from 'src/app/@core/services';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-topbar-timesheet-editor',
  standalone: true,
  imports: [
    FormlyConfigModule,
    SharedButtonComponent,
    SharedModule,
    SharedSkeletonGridComponent,
  ],
  templateUrl: './topbar-timesheet-editor.component.html',
  styleUrl: './topbar-timesheet-editor.component.scss',
})
export class TopbarTimesheetEditorComponent
  extends FormBaseClass
  implements OnInit
{
  _authService = inject(AuthService);
  isInhouse = environment.brand === 'inhouse';

  
  ngOnInit(): void {
    this.getLookupsData();
  }

  override getLookupsData(): void {
    this.isLoading = true;
    combineLatest({
      matters: this._apiService.get(API_Config.general.getMatterCodes),
      lawyers: this._apiService.get(
        API_Config.general.getUsersInitialSaparateForTimeShet
      ),
      tasks: this._apiService.get(API_Config.general.getTaskCode),
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

  initForm(): void {
    this.formlyFields = topbarTimesheetEditorFormlyConfig(this);
    this.setFormData();
  }

  setFormData() {
    if (this._dynamicDialogConfig?.data?.formValue) {
      this.formlyModel = { ...this._dynamicDialogConfig.data.formValue };
    }
  }

  getMatterData(matterId: number) {
    const params = {
      id: matterId,
      lawerId: this.formlyModel?.law_LawerId,
    };

    this._apiService
      .get(API_Config.timesheet.getRateFromLawyerIdAndMatterId, params)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res?.isSuccess && res.result) {
            this.formlyModel = {
              ...this.formlyModel,
              clientName: res.result.name || '',
              rate: +res.result.rate || 0,
              law_TaskCodeId: res.result.law_TaskCodeId || '',
            };
            this.setAmountValue();
          }
        },
      });
  }
// استقبال البيانات من DynamicDialog
  override _dynamicDialogConfig = inject(DynamicDialogConfig);
  override _dynamicDialogRef = inject(DynamicDialogRef);

  get isEdit(): boolean {
    return !!this._dynamicDialogConfig.data?.isEdit;
  }


  setAmountValue() {
  const hours = +this.formlyModel.hours || 0;
  const rate = +this.formlyModel.rate || 0;
  const taskCodeId = +this.formlyModel.law_TaskCodeId;

  const amount =
    taskCodeId === 2 || taskCodeId === 3
      ? 0
      : hours * rate;

  this.formlyModel = {
    ...this.formlyModel,
    amount: amount.toFixed(2),
  };
}
  filterOptions: any = { orderByDirection: 'ASC' };

onSubmit(): void {
  this.isSubmitted = true;

  const tsTimmer = timeStringToSeconds(this.formlyModel.tsTimmer || '00:00:00');

  const payload = [
    {
      ...this.formlyModel,
      tsTimmer: tsTimmer,
      hours: +this.formlyModel.hours,
      amount: +this.formlyModel.amount,
    },
  ];

  this._apiService
    .post(API_Config.timesheet.createe, payload)
    .pipe(
      finalize(() => (this.isSubmitted = false)),
      this._unsubscribe.takeUntilDestroy()
    )
    .subscribe({
      next: (res: ApiRes) => {
        if (res.isSuccess) {
          this._toastrNotifiService.displaySuccess(res.message);
          this._apiService
            .get(API_Config.timesheet.getDraftTimeSheet, this.filterOptions)
            .pipe(this._unsubscribe.takeUntilDestroy())
            .subscribe({
              next: (draftRes: ApiRes) => {
                if (draftRes?.isSuccess && draftRes.result) {
                  console.log('🆕 Updated Timesheet Data:', draftRes.result);

                }
              },
            });

          this._dynamicDialogRef.close(true);
        }
      },
    });
}

}
