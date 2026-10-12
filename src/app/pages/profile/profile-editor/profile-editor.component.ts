import { Component, inject, OnInit } from '@angular/core';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import {
  profileBaseEditorFormlyConfig,
  profilePersonalEditorFormlyConfig,
} from './profile-editor-formly.config';
import { FieldTypeConfig, FormlyFieldConfig } from '@ngx-formly/core';
import { SharedModule } from 'src/app/@shared/shared.module';
import { combineLatest, finalize } from 'rxjs';
import { findField } from 'src/app/@core/utilities/functions/find-field';
import { ProfileService } from '../services/profile.service';
import { FormsModule } from '@angular/forms';
import { AuthService } from 'src/app/@core/services';
import { DashboardModeService } from '../../dashboard/Service/dashboard-mode.service';

@Component({
  selector: 'app-profile-editor',
  standalone: true,
  imports: [
    FormlyConfigModule,
    SharedButtonComponent,
    SharedModule,
    FormsModule,
  ],
  templateUrl: './profile-editor.component.html',
  styleUrl: './profile-editor.component.scss',
})
export class ProfileEditorComponent extends FormBaseClass implements OnInit {
  private _profileService = inject(ProfileService);
  private _authService = inject(AuthService);
  formlyBaseFields: FormlyFieldConfig[] = [];
  formlyPersonalFields: FormlyFieldConfig[] = [];
  percentage: number = 0;
  radius: number = 22; 
  strokeWidth: number = 5; 
  strokeDashArray: number = 2 * Math.PI * this.radius; 
  strokeDashOffset: number = this.strokeDashArray * (1 - this.percentage / 100);
  private _dashboardModeService = inject(DashboardModeService);
  private userPlaceholderKeys = [
    'FileName',
    'userName',
    'email',
    'mobileNo',
    'mobile2',
    'role',
    'team',
    'defUsrId',
    'address1',
    'zipCode',
    'country',
    'city',
    'state',
    'dashBoardTempletId',
  ];

  ngOnInit(): void {
    this.getLookupsData();
  }
  override getLookupsData() {
    combineLatest({
      country: this._apiService.get(API_Config.general.getCountryLookup),
      defUsr: this._apiService.get(API_Config.general.getLawyerMyPermission),
      // defUsr: this._apiService.get(API_Config.general.getAssignedUsersTimeSheet),
      department: this._apiService.get(API_Config.general.getDepartmentLookup),
    })
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe((res) => {
        this.lookupsData = res;
        this.initForm();
      });
  }
  initForm(): void {
    this.formlyBaseFields = profileBaseEditorFormlyConfig(this);
    this.formlyPersonalFields = profilePersonalEditorFormlyConfig(this);
    setTimeout(() => {
      this.setFormData();
    }, 0);
  }
  // setFormData() {
  //   this._apiService.get(API_Config.profile.get).pipe(
  //     this._unsubscribe.takeUntilDestroy()
  //   ).subscribe({
  //     next: (res: ApiRes) => {
  //       if (res && res.isSuccess) {
  //         this.formlyModel = { ...res?.result, FileName: res?.result?.filePath };
  //         this.setFieldSelectedObj('defUsrId', 'defUsr')
  //         this.setFieldSelectedObj('country', 'country');
  //         this.setFieldSelectedObj('department', 'department');
  //         console.log('this.formlyModel', this.formlyModel);
  //         this.percentage = this.calculateProfileCompletionPercentage(this.formlyModel, this.userPlaceholderKeys);
  //         this.updateProgress()

  //       }
  //     }
  //   })

  // }


private hasDashBoardAdmin(): boolean {
  try {
    const token = this._authService.getToken();
    if (!token) return false;

    const payload = JSON.parse(atob(token.split('.')[1]));
    const roles: string[] = payload?.role ?? [];

    return roles.includes('DashBoardAdmin');
  } catch {
    return false;
  }
}


get dashboardTemplateOptions() {
  const options = [
    { label: 'Litigation', value: 1 },
    { label: 'Corporate', value: 2 },
  ];

  if (this.hasDashBoardAdmin()) {
    options.push({ label: 'Manager', value: 3 });
  }

  return options;
}



  setFormData() {
    this._apiService
      .get(API_Config.profile.get)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res && res.isSuccess) {
            const cleanedData = {
              ...res?.result,
              FileName: res?.result?.filePath ?? null,
              DeptId: res?.result?.DeptId || res?.result?.deptId || null,
              Law_CountryId:
                res?.result?.Law_CountryId ||
                res?.result?.law_CountryId ||
                null,
  //  dashBoardTempletId:
  // res?.result?.dashBoardTempletId ??
  // res?.result?.dashboardTempletId ??
  // 1,
dashBoardTempletId: Number(
  res?.result?.dashBoardTempletId ??
  res?.result?.dashboardTempletId ??
  1
),

            };

            this.formlyModel = cleanedData;
            this.setFieldSelectedObj('defUsrId', 'defUsr');
            this.setFieldSelectedObj('Law_CountryId', 'country');
            this.setFieldSelectedObj('DeptId', 'department');

            this.percentage = this.calculateProfileCompletionPercentage(
              this.formlyModel,
              this.userPlaceholderKeys
            );
            this.updateProgress();
          }
        },
      });
  }
  setFieldSelectedObj(
    key: string,
    lookupPath: string,
    idProp: string = 'id',
    labelProp: string = 'name'
  ): void {
    const field: FieldTypeConfig = findField(this.formlyFields, key);
    const modelValue = this.formlyModel?.[key];

    if (field && modelValue) {
      const lookupData = this.lookupsData?.[lookupPath]?.result;
      const selected = lookupData?.find(
        (obj: any) => obj[idProp] == modelValue
      );
      if (selected) {
        field.props['selectedObj'] = {
          label: selected[labelProp],
          value: selected[idProp],
        };
      }
    }
  }
  // onSubmit(): void {
  //   if (this.formly.invalid) {
  //     this.formly.markAllAsTouched();
  //     return;
  //   }
  //   this.isLoading = true;
  //   let body = {

  //     ...this.formlyModel,
  //     mobileNo: this.formlyModel?.mobileNo?.internationalNumber
  //       ? this.formlyModel?.mobileNo?.internationalNumber
  //       : this.formlyModel.mobileNo,
  //   };
  //   console.log('body', this.formlyModel);
  //   let formData = new FormData();
  //   for (const [key, value] of Object.entries(body)) {
  //     if (key != 'FileName') {
  //       formData.append(key, `${value}`);
  //     }
  //   }

  //   formData.append('FileName', body.FileName);
  //   //

  //   this._apiService
  //     .post(API_Config.profile.update, formData)
  //     .pipe(
  //       finalize(() => (this.isLoading = false)),
  //       this._unsubscribe.takeUntilDestroy()
  //     )
  //     .subscribe({
  //       next: (res: ApiRes) => {
  //         if (res && res.isSuccess) {
  //           this._authService.updateUserProfile(res.result)
  //           this._toastrNotifiService.displaySuccess(res.message);
  //           this.onCancel()
  //         }
  //       },
  //     });
  // }


  onSubmit(): void {
  if (this.formly.invalid) {
    this.formly.markAllAsTouched();
    return;
  }
  this.isLoading = true;


  let cleanModel = {
    ...this.formlyModel,
    DeptId: this.formlyModel.DeptId ? Number(this.formlyModel.DeptId) : null,
  Law_CountryId: this.formlyModel.Law_CountryId ? Number(this.formlyModel.Law_CountryId) : null,
  dashBoardTempletId: this.formlyModel.dashBoardTempletId
    ? Number(this.formlyModel.dashBoardTempletId)
    : 1,
};

if (!cleanModel.FileName) {
  cleanModel.fileName = '';
  cleanModel.filePath = '';
}
let formData = new FormData();
for (const [key, value] of Object.entries(cleanModel)) {
  if (key !== 'FileName' && value !== null && value !== undefined) {
    formData.append(key, value.toString());
  }
}
if (cleanModel.FileName instanceof File) {
  formData.append('FileName', cleanModel.FileName);
} else {
  formData.append('FileName', cleanModel.FileName ?? '');
}
  this._apiService
    .post(API_Config.profile.update, formData)
    .pipe(
      finalize(() => (this.isLoading = false)),
      this._unsubscribe.takeUntilDestroy()
    )
    .subscribe({
      next: (res: ApiRes) => {
        if (res && res.isSuccess) {
          this._authService.updateUserProfile(res.result);
          this._dashboardModeService.setMode(
            Number(res.result?.dashBoardTempletId ?? 1) as 1 | 2 | 3
          );
          this._toastrNotifiService.displaySuccess(res.message);
          this.onCancel();
        }
      },
    });
}
  calculateProfileCompletionPercentage(
    user: Record<string, any>,
    keys: string[]
  ): number {
    const totalKeys = keys.length;
    let filledKeys = 0;

    keys.forEach((key) => {
      const value = user[key];
      if (value !== undefined && value !== null && value !== '') {
        filledKeys++;
      }
    });
    console.log('totalKeys', totalKeys);
    console.log('filledKeys', filledKeys);

    return Math.round((filledKeys / totalKeys) * 100);
  }
  // Update the strokeDashOffset based on the percentage
  updateProgress(): void {
    this.strokeDashOffset = this.strokeDashArray * (1 - this.percentage / 100);
  }
  onCancel() {
    this._router.navigate(['../'], { relativeTo: this._route });
  }
}
