import { Component, OnDestroy, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { SharedModule } from 'src/app/@shared/shared.module';
import { SharedSkeletonGridComponent } from 'src/app/@shared/components/shared-skeleton-grid/shared-skeleton-grid.component';
import { reportTimesheetFilterEditorConfig } from './report-timesheet-filter-editor.config';
import { findField } from 'src/app/@core/utilities/functions/find-field';
import { getOptionsArray } from 'src/app/@core/utilities/functions/get-options-arr';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-report-timesheet-filter-editor',
  standalone: true,
  imports: [
    FormlyConfigModule,
    SharedButtonComponent,
    SharedModule,
    SharedSkeletonGridComponent,
  ],
  templateUrl: './report-timesheet-filter-editor.component.html',
  styleUrl: './report-timesheet-filter-editor.component.scss',
})
export class ReportTimesheetFilterEditorComponent
  extends FormBaseClass
  implements OnInit, OnDestroy
{
   isInhouse = environment.brand === 'inhouse';

   
  ngOnInit(): void {
    this.initForm();
    this.getLookupsData();
  }

  override getLookupsData(): void {
    this.loadMatterCodes();
    this.loadLawyers();
    this.loadClients();
  }

  private loadMatterCodes() {
    this._apiService
      .get(API_Config.general.getMatterCodes)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe((res: ApiRes) => {
        this.updateFieldOptions('mtrNo', res.result);
      });
  }

  private loadLawyers() {
    this._apiService
      .get(API_Config.general.getLawyerMyPermission)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe((res: ApiRes) => {
        this.updateFieldOptions('laywersIds', res.result);
      });
  }

  private loadClients() {
    this._apiService
      .get(API_Config.matterClientSecurity.get)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe((res: ApiRes) => {
        this.updateFieldOptions('clientIds', res.result);
      });
  }

  private updateFieldOptions(fieldKey: string, result: any[]) {
    const field = findField(this.formlyFields, fieldKey);
    if (field && field.props) {
      field.props = {
        ...field.props,
        optionsArr: getOptionsArray(result, 'id', 'name'),
        loading: false,
      };
    }
  }

  initForm(): void {
    this.formlyFields = reportTimesheetFilterEditorConfig(this);
  }

  reset() {
    this.formly.reset();
    this.formlyModel = {};
  }

  onSubmit(): void {
    this.isLoading = true;
    this._apiService
      .post(API_Config.timesheetReport.create, this.formlyModel)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (res: any) => {
          window.open(res.result, '_blank');
        },
      });
  }

  ngOnDestroy(): void {
    this._unsubscribe.destroy();
  }
}
