import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { SharedModule } from 'src/app/@shared/shared.module';
import { SharedSkeletonGridComponent } from 'src/app/@shared/components/shared-skeleton-grid/shared-skeleton-grid.component';
import { reportMatterFilterEditorConfig } from './report-matter-filter-editor.config';
import { findField } from 'src/app/@core/utilities/functions/find-field';
import { getOptionsArray } from 'src/app/@core/utilities/functions/get-options-arr';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-report-matter-filter-editor',
  standalone: true,
  imports: [
    FormlyConfigModule,
    SharedButtonComponent,
    SharedModule,
    SharedSkeletonGridComponent,
  ],
  templateUrl: './report-matter-filter-editor.component.html',
  styleUrl: './report-matter-filter-editor.component.scss',
})
export class ReportMatterFilterEditorComponent
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
    this.loadJurisdictions();
    this.loadStatuses();
    this.loadStages();
    this.loadMatterTypes();
    this.loadLawyers();
    this.loadClients();
    this.loadCategories();
    this.loadReferralTypes();
    this.loadBranches();
  }

  private loadJurisdictions() {
    this._apiService
      .get(API_Config.general.getJurisdictionLookup)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe((res: any) => {
        this.updateFieldOptions('juriductionsIds', res.result);
      });
  }

  private loadStatuses() {
    this._apiService
      .get(API_Config.general.getMatterStatus)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe((res: any) => {
        this.updateFieldOptions('matterStatusIds', res.result);
      });
  }

  private loadStages() {
    this._apiService
      .get(API_Config.general.getStages)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe((res: any) => {
        this.updateFieldOptions('stagesIds', res.result);
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

  private loadClients() {
    this._apiService
      .get(API_Config.matterClientSecurity.get)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe((res: any) => {
        this.updateFieldOptions('clientIds', res.result);
      });
  }

  private loadCategories() {
    this._apiService
      .get(API_Config.general.getMatterCategoriesLookup)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe((res: any) => {
        this.updateFieldOptions('matterCategoryIds', res.result);
      });
  }

  private loadReferralTypes() {
    this._apiService
      .get(API_Config.general.getReferralType)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe((res: any) => {
        this.updateFieldOptions('referralTypeIds', res.result);
      });
  }

  private loadBranches() {
    this._apiService
      .get(API_Config.general.getAllBranches)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe((res: any) => {
        this.updateFieldOptions('branchId', res.result);
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
private cleanPayload(payload: any): any {
  return Object.fromEntries(
    Object.entries(payload).filter(([_, value]) => {
      if (value === null || value === undefined) return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    })
  );
}

onSubmit(): void {
  this.isLoading = true;

  const payload = this.cleanPayload({
    dateType: this.formlyModel.typeId,
    dateFrom: this.formlyModel.dateFrom,
    dateTo: this.formlyModel.dateTo,
    clientIds: this.formlyModel.clientIds?.map(String),
    lawyerIds: this.formlyModel.lawyerIds?.map(String),
    mtrCatIds: this.formlyModel.matterCategoryIds?.map(String),
    mtrTypIds: this.formlyModel.matterTypeIds?.map(String),
    judicatureIds: this.formlyModel.juriductureIds?.map(String),
    statusIds: this.formlyModel.matterStatusIds?.map(String),
    stageIds: this.formlyModel.stagesIds?.map(String),
    referralTypIds: this.formlyModel.referralTypeIds?.map(String),
    jurisdictionId: this.formlyModel.juriductionsIds,
    branchId: this.formlyModel.branchId,
  });

  this._apiService
    .post(API_Config.matterReport.create, payload)
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
