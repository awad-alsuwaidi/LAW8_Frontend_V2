import { Component, OnDestroy, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { SharedModule } from 'src/app/@shared/shared.module';
import { SharedSkeletonGridComponent } from 'src/app/@shared/components/shared-skeleton-grid/shared-skeleton-grid.component';
import { reportActivityFilterConfig } from './report-utilization-filter-editor.config';
import { getOptionsArray } from 'src/app/@core/utilities/functions/get-options-arr';
import { findField } from 'src/app/@core/utilities/functions/find-field';
import { ApiRes } from 'src/app/@core/models/apiRes-model';

@Component({
  selector: 'app-report-utilization-editor',
  standalone: true,
  imports: [
    FormlyConfigModule,
    SharedButtonComponent,
    SharedModule,
    SharedSkeletonGridComponent,
  ],
  templateUrl: './report-utilization-editor.component.html',
  styleUrl: './report-utilization-editor.component.scss',
})
export class ReportUtilizationEditorComponent
  extends FormBaseClass
  implements OnInit, OnDestroy
{
  ngOnInit(): void {
    this.initForm();
    this.getLookupsData();
    this.formlyModelChanges();
  }

  initForm(): void {
    this.formlyFields = reportActivityFilterConfig(this);
  }
  private formlyModelChanges() {
    this.formly.valueChanges
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe((model) => {
        const { branchId, departmentId } = model;
        this.loadLawyers(branchId, departmentId);
      });
  }
private loadLawyers(
  branchIds?: number[] | number,
  departmentIds?: number[] | number
) {
  const endpoint = API_Config.general.GetLawyersByDeptAndBranch;

  // تأكد إن القيم Arrays
  const branches = Array.isArray(branchIds)
    ? branchIds
    : branchIds
    ? [branchIds]
    : [];
  const departments = Array.isArray(departmentIds)
    ? departmentIds
    : departmentIds
    ? [departmentIds]
    : [];

  // نحول الأرقام إلى نصوص (Strings)
  const body = {
    branches: branches.map((b) => String(b)),
    departments: departments.map((d) => String(d)),
  };

  this._apiService
    .post(endpoint, body)
    .pipe(this._unsubscribe.takeUntilDestroy())
    .subscribe((res: ApiRes) => {
      this.updateFieldOptions('lawyerIds', res.result);
    });
}


  override getLookupsData(): void {
    this.loadLawyers();
    this.loadClients();
    this.loadMatters();
    this.loadBranches();
    this.loadDepartments();
  }
  private loadDepartments() {
    this._apiService
      .get(API_Config.general.getDepartmentLookup)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe((res: ApiRes) => {
        this.updateFieldOptions('departmentId', res.result);
      });
  }
  private loadBranches() {
    this._apiService
      .get(API_Config.general.getAllBranches)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe((res: ApiRes) => {
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

  // private loadLawyers() {
  //   this._apiService
  //     .get(API_Config.general.getLawyerShort)
  //     .pipe(this._unsubscribe.takeUntilDestroy())
  //     .subscribe((res: ApiRes) => {
  //       this.updateFieldOptions('lawyerIds', res.result);
  //     });
  // }

  private loadClients() {
    this._apiService
      .get(API_Config.matterClientSecurity.get)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe((res: ApiRes) => {
        this.updateFieldOptions('clientIds', res.result);
      });
  }

  private loadMatters() {
    this._apiService
      .get(API_Config.general.getAllMatter)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe((res: ApiRes) => {
        this.updateFieldOptions('matterIds', res.result);
      });
  }

  reset() {
    this.formly.reset();
    this.formlyModel = {};
  }

  onSubmit(): void {
    this.isLoading = true;
    this._apiService
      .post(API_Config.utilizationReport.create, this.formlyModel)
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
