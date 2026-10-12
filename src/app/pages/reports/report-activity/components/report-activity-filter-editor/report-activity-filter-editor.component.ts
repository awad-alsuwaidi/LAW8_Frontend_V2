import { Component, OnDestroy, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { reportActivityFilterConfig } from './report-activity-filter-editor.config';
import { SharedModule } from 'src/app/@shared/shared.module';
import { SharedSkeletonGridComponent } from 'src/app/@shared/components/shared-skeleton-grid/shared-skeleton-grid.component';
import { findField } from 'src/app/@core/utilities/functions/find-field';
import { getOptionsArray } from 'src/app/@core/utilities/functions/get-options-arr';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-report-activity-filter-editor',
  standalone: true,
  imports: [
    FormlyConfigModule,
    SharedButtonComponent,
    SharedModule,
    SharedSkeletonGridComponent,
  ],
  templateUrl: './report-activity-filter-editor.component.html',
  styleUrl: './report-activity-filter-editor.component.scss',
})
export class ReportActivityFilterEditorComponent
  extends FormBaseClass
  implements OnInit, OnDestroy
{
  isInhouse = environment.brand === 'inhouse';

  ngOnInit(): void {
    this.initForm();
    this.getLookupsData();
  }

  override getLookupsData(): void {
    this.loadActivityTypes();
    this.loadJurisdictions();
    this.loadStatuses();
    this.loadStages();
    this.loadMatterTypes();
    this.loadLawyers();
    this.loadClients();
    this.loadMatterCodes();
    this.loadBranches();
    this.loadMatters();
  }
  private loadStatuses() {
    this._apiService
      .get(API_Config.general.getMatterStatus)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe((res: any) => {
        this.updateFieldOptions('matterStatusIds', res.result); // ✅
      });
  }

  private loadStages() {
    this._apiService
      .get(API_Config.general.getStages)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe((res: any) => {
        this.updateFieldOptions('stagesIds', res.result); // ✅
      });
  }

  private loadClients() {
    this._apiService
      .get(API_Config.matterClientSecurity.get)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe((res: any) => {
        this.updateFieldOptions('clientIds', res.result); // ✅
      });
  }

  private loadBranches() {
    this._apiService
      .get(API_Config.general.getAllBranches)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe((res: any) => {
        this.updateFieldOptions('law_BranchId', res.result); // ✅
      });
  }

  private loadActivityTypes() {
    this._apiService
      .get(API_Config.general.getActivityType)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe((res: any) => {
        this.updateFieldOptions('activityTypeIds', res.result);
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

  private loadMatterTypes() {
    this._apiService
      .get(API_Config.general.getAllMatterTypes)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe((res: any) => {
        this.updateFieldOptions('matterTypeIds', res.result);
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

  private loadMatterCodes() {
    this._apiService
      .get(API_Config.general.getMatterCodes)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe((res: any) => {
        this.updateFieldOptions('matterCodeIds', res.result);
      });
  }
  private loadMatters() {
    this._apiService
      .get(API_Config.general.getMatterCodes)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe((res: any) => {
        this.updateFieldOptions('matterIds', res.result);
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
    this.formlyFields = reportActivityFilterConfig(this);
  }

  reset() {
    this.formly.reset();
    this.formlyModel = {};
  }

  onSubmit(): void {
    this.isLoading = true;
    const payload = {
      ...this.formlyModel,
      detailsUrl: window.location.origin,
    };
    this._apiService
      .post(API_Config.report.create, payload)
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
