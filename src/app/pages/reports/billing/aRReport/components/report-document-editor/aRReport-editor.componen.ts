import { Component, OnDestroy, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { findField } from 'src/app/@core/utilities/functions/find-field';
import { getOptionsArray } from 'src/app/@core/utilities/functions/get-options-arr';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { SharedModule } from 'src/app/@shared/shared.module';
import { reportMatterFilterEditorConfig } from './aRReport-editor.config';
import { SharedSkeletonGridComponent } from 'src/app/@shared/components/shared-skeleton-grid/shared-skeleton-grid.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-aRReport-editor',
  standalone: true,
  imports: [
    FormlyConfigModule,
    SharedButtonComponent,
    SharedModule,
    SharedSkeletonGridComponent,
  ],
  templateUrl: './aRReport-editor.component.html',
  styleUrl: './aRReport-editor.component.scss',
})
export class ARReportEditorComponent
  extends FormBaseClass
  implements OnInit, OnDestroy
{
    isInhouse = environment.brand === 'inhouse';
  
  ngOnInit(): void {
    this.initForm();
    this.getLookupsData();
  }

  override getLookupsData(): void {
    this.loadJurisdictions();
    this.loadMatterTypes();
    this.loadLawyers();
    this.loadClients();
    this.loadCategories();
    this.loadBranches();
    this.loadPracticeAreas();
    this.loadclientGroupIds();
    this.loadMatters();
  }

  private loadJurisdictions() {
    this._apiService
      .get(API_Config.general.getJurisdictionLookup)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe((res: any) => {
        this.updateFieldOptions('juriductionsIds', res.result);
      });
  }
 private loadclientGroupIds() {
    this._apiService
      .get(API_Config.general.getClientGroups)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe((res: any) => {
        this.updateFieldOptions('clientGroupIds', res.result);
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

  private loadBranches() {
    this._apiService
      .get(API_Config.general.getAllBranches)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe((res: any) => {
        this.updateFieldOptions('branchId', res.result);
      });
  }

  private loadPracticeAreas() {
    this._apiService
      .get(API_Config.general.getPractsAreaLookup)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe((res: any) => {
        this.updateFieldOptions('practiceArea', res.result);
      });
  }

  private updateFieldOptions(key: string, result: any[]): void {
    const field = findField(this.formlyFields, key);
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
private loadMatters() {
  this._apiService.get(API_Config.general.getMatterCodes) 
    .pipe(this._unsubscribe.takeUntilDestroy())
    .subscribe((res: any) => {
      this.updateFieldOptions('matterIds', res.result); 
    });
}
  reset() {
    this.formly.reset();
    this.formlyModel = {};
  }

onSubmit(): void {
  this.isLoading = true;

  const payload = {
    objectCreatiria: {
      ...this.formlyModel,
    }
  };

  this._apiService
    .post(API_Config.arReport.create, payload)
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
