import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { SharedModule } from 'src/app/@shared/shared.module';
import { SharedSkeletonGridComponent } from 'src/app/@shared/components/shared-skeleton-grid/shared-skeleton-grid.component';
import { reportMatterFilterEditorConfig } from './report-client-filter-editor.config';
import { findField } from 'src/app/@core/utilities/functions/find-field';
import { getOptionsArray } from 'src/app/@core/utilities/functions/get-options-arr';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-report-client-filter-editor',
  standalone: true,
  imports: [
    FormlyConfigModule,
    SharedButtonComponent,
    SharedModule,
    SharedSkeletonGridComponent,
  ],
  templateUrl: './report-client-filter-editor.component.html',
  styleUrl: './report-client-filter-editor.component.scss',
})
export class ReportClientFilterEditorComponent
  extends FormBaseClass
  implements OnInit, OnDestroy
{
  public urlSafe: SafeResourceUrl | null = null;
  private _sanitizer = inject(DomSanitizer);
  isInhouse = environment.brand === 'inhouse';

  ngOnInit(): void {
    this.initForm();
    this.getLookupsData();
  }

  override getLookupsData(): void {
    this.loadLawyers();
    this.loadClients();
    this.loadCountries();
  }
private loadCountries() {
  this._apiService
    .get(API_Config.general.getCountryLookup)
    .pipe(this._unsubscribe.takeUntilDestroy())
    .subscribe((res: any) => {
      this.updateFieldOptions('countryIds', res.result);
    });
}

  private loadJurisdictions() {
    this._apiService
      .get(API_Config.general.getJurisdictionLookup)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe((res: any) => {
        this.updateFieldOptions('juriductionsIds', res.result);
      });
  }

  private loadLawyers() {
    this._apiService
      .get(API_Config.general.getLawyerShort)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe((res: any) => {
        this.updateFieldOptions('lawyerIds', res.result);
      });
  }

  private loadClients() {
    this._apiService
      .get(API_Config.general.getClientGroups)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe((res: any) => {
        this.updateFieldOptions('clientGroupIds', res.result);
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
    this.formlyFields = reportMatterFilterEditorConfig(this);
  }

  reset() {
    this.formly.reset();
    this.formlyModel = {};
  }

  getJudicatureByJurisdiction(jurisdictionId: number) {
    const param = { Law_JurisdictionId: jurisdictionId };
    this._apiService
      .get(API_Config.general.getJudicatureByJurisdictionId, param)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe((res: ApiRes) => {
        this.updateFieldOptions('juriductureIds', res.result);
      });
  }

  // onSubmit(): void {
  //   this.isLoading = true;
  //   this._apiService
  //     .post(API_Config.matterReport.create, this.formlyModel)
  //     .pipe(finalize(() => (this.isLoading = false)))
  //     .subscribe({
  //       next: (res: any) => {
  //         window.open(res.result, '_blank');
  //       },
  //     });
  // }
onSubmit(): void {
  this.isLoading = true;

  const payload = {
      ...this.formlyModel,
      clientGroupIds: (this.formlyModel.clientGroupIds || []).map(String),
      countryIds: (this.formlyModel.countryIds || []).map(String),
      lawyerIds: this.formlyModel.lawyerIds || []
  };

  this._apiService
    .post(API_Config.clientsReport.create, payload)
    .pipe(finalize(() => (this.isLoading = false)))
    .subscribe({
      next: (res: any) => {
        if (res?.isSuccess && res?.result) {
          window.open(res.result, '_blank');
        } else {
          this._toastrNotifiService.displayError('فشل إنشاء التقرير');
        }
      },
      error: (err: any) => {
        this._toastrNotifiService.displayError(err?.error?.message);
      },
    });
}



  ngOnDestroy(): void {
    this._unsubscribe.destroy();
  }
}
