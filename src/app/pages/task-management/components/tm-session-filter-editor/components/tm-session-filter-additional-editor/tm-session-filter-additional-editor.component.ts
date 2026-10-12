import { Component, OnInit } from '@angular/core';
import { combineLatest } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { tmSessionAdditionalFilterFields } from './tm-session-filter-additional-editor.config';

@Component({
  selector: 'app-tm-session-filter-additional-editor',
  standalone: true,
  imports: [FormlyConfigModule, SharedButtonComponent, TranslateModule],
  templateUrl: './tm-session-filter-additional-editor.component.html',
  styleUrls: ['./tm-session-filter-additional-editor.component.scss'],
})
export class TmSessionFilterAdditionalEditorComponent
  extends FormBaseClass
  implements OnInit
{
 override isLoading = true; // ✅ يبدأ على لودينج

  ngOnInit(): void {
    this.getLookupsData();
  }

  override getLookupsData(): void {
    combineLatest({
      status: this._apiService.get(API_Config.general.getActivityStatus),
      user: this._apiService.get(API_Config.general.getUsersLookup),
      activityType: this._apiService.get(API_Config.general.getActivityType),
      taskPriority: this._apiService.get(API_Config.general.getTaskPriority),
    })
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe((res) => {
        this.lookupsData = res;

        if (this._router.url.includes('activity')) {
          this.lookupsData.activityType.result =
            this.lookupsData.activityType.result.filter(
              (obj: any) => obj.id !== 1 && obj.id !== 2
            );
        }

        this.initForm();
        this.isLoading = false; // ✅ يخفي السبنر ويظهر الفورم
      });
  }

  override initForm(): void {
    this.formlyFields = tmSessionAdditionalFilterFields(this);
    this.setForm();
  }

  private setForm(): void {
    this.formlyModel = { ...this._dynamicDialogConfig.data.formlyModel };
  }

  reset(): void {
    this.formlyModel = {};
    this.formly.reset();
    this.initForm();
  }

  onSubmit(): void {
    this._dynamicDialogRef.close(this.formly.value);
  }


  // ✅ لو حابب تبعت Payload مبسط بدل الـ objects
  // onSubmit(): void {
  //   const formValue = this.formly.value;
  //   const simplifiedPayload = {
  //     status: formValue.StatusId?.value,
  //     availability: formValue.AvailabilityId?.value,
  //     fromDate: formValue.FromDate,
  //     toDate: formValue.ToDate,
  //     type: formValue.TypeId?.value,
  //     userId: formValue.UserId?.value,
  //   };
  //   this._dynamicDialogRef.close(simplifiedPayload);
  // }
}
