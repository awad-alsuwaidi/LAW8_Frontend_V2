import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { SharedModule } from 'src/app/@shared/shared.module';

@Component({
  selector: 'app-user-rate-table-editor',
  standalone: true,
  imports: [SharedButtonComponent, SharedModule, FormlyConfigModule],
  templateUrl: './user-rate-table-editor.component.html',
  styleUrl: './user-rate-table-editor.component.scss',
})
export class UserRateTableEditorComponent
  extends FormBaseClass
  implements OnInit
{
  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.formlyFields = [
      {
        key: 'rate',
        type: 'input',
        props: {
          label: this._languageService.getTransValue('lookups.rate'),
          disabled: true,
        },
        validators: {
          validation: ['englishLetters'],
        },
      },
      {
        key: 'name',
        type: 'input',
        props: {
          label: this._languageService.getTransValue('lookups.rateName'),
        },
      },
      {
        key: 'amount',
        type: 'input',
        props: {
          label: this._languageService.getTransValue('lookups.amount'),
          required: true,
        },
      },
    ];
    this.setFormData();
  }
  setFormData() {
    this.formlyModel = this._dynamicDialogConfig.data.rowData;
  }

  override onSubmit(): void {
    if (this.formly.invalid) {
      this.formly.markAllAsTouched();
      return;
    }

    const rowData = this._dynamicDialogConfig?.data?.rowData;
    const userId = rowData?.userId ?? this._dynamicDialogConfig?.data?.userId;
    const rateId = rowData?.id;

    if (!userId || !rateId) {
      this._toastrNotifiService.displayError('Missing userId or rateId');
      return;
    }

    const payload = {
      name: this.formlyModel.name,
      amount: +this.formlyModel.amount,
    };
    const url = `${API_Config.usersRate.update}/${userId}/rates/${rateId}`;

    this.isLoading = true;

    this._apiService
      .put(url, payload)
      .pipe(
        finalize(() => (this.isLoading = false)),
        this._unsubscribe.takeUntilDestroy(),
      )
      .subscribe({
        next: (res: any) => {
          if (res?.isSuccess || res?.success) {
            this._toastrNotifiService.displaySuccess(res?.message || 'Updated');
            this._dynamicDialogRef.close(true);
          } else {
            this._toastrNotifiService.displayError(res?.message || 'Failed');
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
