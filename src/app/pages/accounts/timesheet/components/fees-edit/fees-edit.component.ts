import { Component, inject, OnInit } from '@angular/core';
import { combineLatest, finalize } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { AuthService } from 'src/app/@core/services';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { SharedModule } from 'src/app/@shared/shared.module';
import { feesEditorFormlyConfig } from './fees-edit-formly.config';
import { GLOBAL_DATE_TIME_Without_Seconds2_FORMATE } from 'src/app/@core/utilities/defines/date-time';
import { DatePipe } from '@angular/common';
export enum TaskEnum {
  Billable = 1,
  NonBillable = 2,
  Internal = 3,
}

@Component({
  selector: 'app-fees-edit',
  standalone: true,
  imports: [FormlyConfigModule, SharedButtonComponent, SharedModule],
  templateUrl: './fees-edit.component.html',
  styleUrl: './fees-edit.component.scss',
  providers: [DatePipe],
})
export class FeesEditComponent extends FormBaseClass implements OnInit {
  private readonly _datePipe = inject(DatePipe);
  _authService = inject(AuthService);

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
              this.formlyModel = {
                ...res.result,
              };
              this.convertMatterIdToObject();
              this.setFormData();
            }
          },
        });
    }
  }

  initForm(): void {
    this.formlyFields = feesEditorFormlyConfig(this);
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

  onSubmit(): void {
    this.formly.markAllAsTouched();

    if (this.formly.valid) {
      const payload = { ...this.formlyModel };

      if (
        payload.matterId &&
        typeof payload.matterId === 'object' &&
        payload.matterId.value
      ) {
        payload.matterId = payload.matterId.value;
      }

      if (!payload.item || payload.item.trim() === '') {
        payload.item = payload.explanationExplanation || 'Timesheet Entry';
      }
      payload.typeId = 2;
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
}
