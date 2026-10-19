import {
  Component,
  effect,
  inject,
  input,
  InputSignal,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { SharedModule } from 'src/app/@shared/shared.module';
import { userDetailsEditorFields } from './user-info-editor-formly.config';
import { combineLatest, finalize } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { FieldTypeConfig } from '@ngx-formly/core';
import { findField } from 'src/app/@core/utilities/functions/find-field';
import { UserDetailsService } from '../services/user-details.service';
import { SharedConfirmDialogComponent } from 'src/app/@shared/components/shared-confirm-dialog/shared-confirm-dialog.component';
import { ConfirmDialogType } from 'src/app/@shared/enums/confirm-dialog-type';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { UserDetailsDto } from '../../interfaces/user-details.interface';
import { DatePipe } from '@angular/common';
import { DropdownChangeEvent } from 'primeng/dropdown';
import { SharedSkeletonGridComponent } from 'src/app/@shared/components/shared-skeleton-grid/shared-skeleton-grid.component';
import { ChangePasswordEditorComponent } from 'src/app/pages/profile/components/change-password-editor/change-password-editor.component';
import { ResetPasswordEditorComponent } from 'src/app/pages/users/user-details/components/reset-password-editor/reset-password-editor.component';

@Component({
  selector: 'app-user-info-editor',
  standalone: true,
  imports: [
    SharedButtonComponent,
    SharedModule,
    FormlyConfigModule,
    SharedSkeletonGridComponent,
  ],
  providers: [DatePipe],
  templateUrl: './user-info-editor.component.html',
  styleUrl: './user-info-editor.component.scss',
})
export class UserInfoEditorComponent
  extends FormBaseClass
  implements OnInit, OnDestroy
{
  protected _userDetailsService = inject(UserDetailsService);
  private _datePipe = inject(DatePipe);

  userIdentifier: InputSignal<string | undefined> = input<string | undefined>();
  signalEffect = effect(() => {
    if (Object.keys(this._userDetailsService.getUserData()).length > 0) {
      this.setFormData();
    }
  });
  ngOnInit(): void {
    this.getLookupsData();
  }
  override getLookupsData(): void {
    this.isLoading = true;
    combineLatest({
      industry: this._apiService.get(API_Config.general.getIndustryModel),
      rateType: this._apiService.get(API_Config.general.getRateTypeLookup),
      department: this._apiService.get(API_Config.general.getDepartmentLookup),
      users: this._apiService.get(API_Config.general.getAssignedUsersTimeSheet),
      branches: this._apiService.get(API_Config.general.getAllBranches),
      defUsrId: this._apiService.get(API_Config.general.getLawyerMyPermission, {
        UserId: this.userIdentifier(),
      }),
      // defUsrId: this._apiService.get(API_Config.general.getAssignedUsersTimeSheet),
    })
      .pipe(
        finalize(() => (this.isLoading = false)),
        this._unsubscribe.takeUntilDestroy()
      )
      .subscribe({
        next: (res: any) => {
          this.lookupsData = res;
          this.initForm();
        },
      });
    setTimeout(() => {
      this.setBranshValue();
    }, 100);
  }
  openResetPasswordEditor() {
    this._dialogService.open(ResetPasswordEditorComponent, {
      header: this._languageService.getTransValue('auth.resetPassword'),
      width: '30vw',
      data: { userId: this.userIdentifier() },
    });
  }

  initForm(): void {
    this.formlyFields = userDetailsEditorFields(this);
    this.setFormData();
  }
  setFormData() {
    const userDataFromSignal = this._userDetailsService.getUserData();
    if (Object.keys(userDataFromSignal).length > 0) {
      this.patchForm(userDataFromSignal);
    } else {
      if (!this.userIdentifier()) return;
      const params = { id: this.userIdentifier() };
      this._apiService
        .get(API_Config.users.getById, params)
        .pipe(this._unsubscribe.takeUntilDestroy())
        .subscribe({
          next: (res: ApiRes) => {
            if (res.result && res.isSuccess) {
              this.patchForm(res.result);
            }
          },
        });
    }
  }
  patchForm(data: UserDetailsDto) {
    this.formlyModel = {
      ...data,
      timeSheetDate: this._datePipe.transform(data.timeSheetDate, 'yyyy-MM-dd'),
    };
    // this.setFieldSelectedObj('indstId', 'industry')
    this.setFieldSelectedObj('titleId', 'rateType');
    // this.setFieldSelectedObj('deptId', 'department');
    // this.setFieldSelectedObj('active', 'active')
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
  toggleActiveUser(activation: boolean) {
    const title = activation ? 'Activate' : 'Deactivate';
    const message = activation
      ? 'Are you sure you want to activate this User?'
      : 'Are you sure you want to deactivate this User?';

    const ref: any = this._dialogService.open(SharedConfirmDialogComponent, {
      data: {
        type: activation ? ConfirmDialogType.Success : ConfirmDialogType.Danger,
        title,
        message,
        btns: [
          {
            label: this._languageService.getTransValue('common.cancel'),
            styleClass: 'border border-grey500 text-grey500',
            command: () => {
              this.formlyModel.active = !activation;
              this.formlyModel = { ...this.formlyModel };
              ref.close();
            },
          },
          {
            label: title,
            styleClass: activation
              ? 'bg-primary text-white'
              : 'bg-textErrorBase text-white',
            command: () => {
              const params = {
                UserId: this._userDetailsService.getUserData().id,
                IsActive: activation,
              };
              this._apiService
                .post(API_Config.users.activeUser, {}, params)
                .pipe(this._unsubscribe.takeUntilDestroy())
                .subscribe({
                  next: (res: any) => {
                    ref.close(true);
                  },
                });
            },
          },
        ],
      },
    });
  }

  toggleLockedeUser(locked: boolean) {
    const userData = this._userDetailsService.getUserData();
    // if (!userData || !userData.id) {
    //     //console.error('User ID is missing!');
    //     return;
    // }
    const userId = userData.id;
    const title = locked ? 'Locked' : 'Unlocked';
    const message = locked
      ? 'Are you sure you want to locked this User?'
      : 'Are you sure you want to Unlocked this User?';
    // const title = locked
    //   ? this._languageService.getTransValue('users.Locked')
    //   : this._languageService.getTransValue('users.unlocked');

    // const message = locked
    //   ? this._languageService.getTransValue('users.ConfirmLock')
    //   : this._languageService.getTransValue('users.ConfirmUnlock');
    const ref: any = this._dialogService.open(SharedConfirmDialogComponent, {
      data: {
        type: locked ? ConfirmDialogType.Success : ConfirmDialogType.Danger,
        title,
        message,
        btns: [
          {
            label: this._languageService.getTransValue('users.cancel'),
            styleClass: 'border border-grey500 text-grey500',
            command: () => {
              this.formlyModel.locked = !locked;
              this.formlyModel = { ...this.formlyModel };
              ref.close();
            },
          },
          {
            label: title,
            styleClass: locked
              ? 'bg-primary text-white'
              : 'bg-textErrorBase text-white',
            command: () => {
              const endpoint = `${
                API_Config.users.lockedUser
              }?UserId=${encodeURIComponent(userId)}&IsLocked=${locked}`;

              this._apiService
                .post(endpoint, null)
                .pipe(this._unsubscribe.takeUntilDestroy())
                .subscribe({
                  next: (res) => {
                    ref.close(true);
                  },
                  error: (err) => {
                    //console.error('API Error:', err);
                  },
                });
            },
          },
        ],
      },
    });
  }
  toggleDefaultRateApprove(event: DropdownChangeEvent) {
    let selectedTitleObject = this.lookupsData.rateType.result.find(
      (obj: any) => obj.id === event.value
    );
    const message = this._languageService.getTransValue(
      'messages.confirmApplyDefaultRate',
      { title: selectedTitleObject.name }
    );

    const ref: any = this._dialogService.open(SharedConfirmDialogComponent, {
      data: {
        type: ConfirmDialogType.Question,
        message,
        btns: [
          {
            label: 'No',
            styleClass: 'border border-grey500 text-grey500',
            command: () => {
              this.formlyModel.defaultRateApproved = false;
              this.formlyModel = { ...this.formlyModel };
              ref.close();
            },
          },
          {
            label: 'Yes',
            styleClass: 'bg-primary text-white',
            command: () => {
              this.formlyModel.defaultRateApproved = true;
              this.formlyModel = { ...this.formlyModel };
              ref.close();
            },
          },
        ],
      },
    });
  }
  onSubmit(): void {
    if (this.formly.invalid) {
      this.formly.markAllAsTouched();
      return;
    }
    this.isSubmitted = true;
    this.formlyModel = {
      ...this.formlyModel,
      // mobileNo: this.formlyModel?.mobileNo?.internationalNumber
      //   ? this.formlyModel?.mobileNo?.internationalNumber
      //   : this.formlyModel.mobileNo,
      goal: +this.formlyModel.goal,
      // telNo: this.formlyModel?.telNo?.internationalNumber
      //   ? this.formlyModel?.telNo?.internationalNumber
      //   : this.formlyModel.telNo,
    };
    const requestPayload = this.userIdentifier()
      ? {
          ...this.formlyModel,
          id: this.userIdentifier(),
        }
      : this.formlyModel;
    const path = this.userIdentifier()
      ? API_Config.users.update
      : API_Config.users.create;

    this._apiService
      .post(path, requestPayload)
      .pipe(
        finalize(() => (this.isSubmitted = false)),
        this._unsubscribe.takeUntilDestroy()
      )
      .subscribe({
        next: (res: ApiRes) => {
          if (res && res.isSuccess) {
            this._toastrNotifiService.displaySuccess(res?.message);
            this._router.navigate(['/users']);
          }
        },
      });
  }

  setBranshValue() {
    const selectedBranches = this.lookupsData?.branches?.result.find(
      (obj: any) => obj.id == this.formlyModel?.branchId
    );
    if (!selectedBranches) return null;
    return {
      label: selectedBranches?.name,
      value: selectedBranches?.id,
    };
  }
  ngOnDestroy(): void {
    this._userDetailsService.updateUserData({});
    this._unsubscribe.destroy();
  }
}
