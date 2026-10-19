import {
  Component,
  DestroyRef,
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
import { UserDetailsService } from '../user-details/services/user-details.service';
import { SharedConfirmDialogComponent } from 'src/app/@shared/components/shared-confirm-dialog/shared-confirm-dialog.component';
import { ConfirmDialogType } from 'src/app/@shared/enums/confirm-dialog-type';
import { DatePipe } from '@angular/common';
import { UserRateTableComponent } from '../user-details/user-rate-table/user-rate-table.component';
import { ResetPasswordEditorComponent } from '../user-details/components/reset-password-editor/reset-password-editor.component';
import { DropdownChangeEvent } from 'primeng/dropdown';
import { SharedSkeletonGridComponent } from 'src/app/@shared/components/shared-skeleton-grid/shared-skeleton-grid.component';
import { PermissionService } from 'src/app/@core/services/permission.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-user-info-editor',
  standalone: true,
  imports: [
    SharedButtonComponent,
    SharedModule,
    FormlyConfigModule,
    UserRateTableComponent,
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
  _permissionService = inject(PermissionService);

  userIdentifier: InputSignal<string | undefined> = input<string | undefined>();
  private lookupsLoaded = false;
  override _route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    const isViewMode =
      this._router.url.includes('view') || this._router.url.includes('details');

    if (isViewMode) {
      this.initForm();
      this._route.paramMap
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((params) => {
          const userId = params.get('id') || this.userIdentifier();
          if (userId) {
            this.loadUserData(userId);
          }
        });
    } else {
      this.getLookupsData();
    }
  }

  signalEffect = effect(() => {
    const userId = this.userIdentifier();
    if (!userId) return;
    const isViewMode =
      this._router.url.includes('view') || this._router.url.includes('details');
    if (isViewMode || this.lookupsLoaded) {
      this.loadUserData(userId);
    }
  });

  override getLookupsData(): void {
    if (this.lookupsLoaded) return;

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
    })
      .pipe(
        finalize(() => (this.isLoading = false)),
        this._unsubscribe.takeUntilDestroy(),
      )
      .subscribe({
        next: (res: any) => {
          const unwrap = (r: any) => {
            const body = r?.data ?? r?.result ?? r;
            const items =
              body?.items ??
              body?.dataList ??
              (Array.isArray(body) ? body : []);
            return { result: items };
          };

          this.lookupsData = {
            industry: unwrap(res.industry),
            rateType: unwrap(res.rateType),
            department: unwrap(res.department),
            users: unwrap(res.users),
            branches: unwrap(res.branches),
            defUsrId: unwrap(res.defUsrId),
          };

          this.lookupsLoaded = true;
          this.initForm();

          const userId = this.userIdentifier();
          if (userId) this.loadUserData(userId);
        },
      });
  }

  initForm(): void {
    this.formlyFields = userDetailsEditorFields(this);
  }

  loadUserData(userId: string) {
    this.isLoading = true;
    this._userDetailsService.getUserById(userId).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        const userData = res?.data ?? res?.result ?? res;
        if (userData) {
          this._userDetailsService.updateUserData(userData);
          this.patchForm(userData);
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error(' loadUserData:', err);
      },
    });
  }

  patchForm(data: any) {
    const isView = !['add', 'update'].some((word) =>
      this._router.url.includes(word),
    );

    this.formlyModel = {
      ...data,
      industryId: data.industryId ?? data.indstId ?? null,
      titleId: data.titleId ?? null,
      departmentId: data.departmentId ?? data.deptId ?? null,
      branchId: data.branchId ?? null,
      defaultUserId: data.defaultUserId ?? data.defUsrId ?? null,
      phone: data.phone ?? data.telNo ?? '',
      phoneNumber: data.phoneNumber ?? data.mobileNo ?? '',
      mobile2: data.mobile2 ?? '',
      extension: data.extension ?? '',
      timesheetDate: data.timesheetDate
        ? this._datePipe.transform(data.timesheetDate, 'yyyy-MM-dd')
        : null,
      userName: data.userName ?? data.username ?? '',
      nameEn: data.nameEn ?? '',
      nameAr: data.nameAr ?? '',
      active: isView ? (data.active ? 'Active' : 'Inactive') : data.active,
      locked: isView ? (data.locked ? 'Locked' : 'UnLocked') : data.locked,
    };
    if (this.formly) {
      this.formly.patchValue(this.formlyModel);
    }

    if (!this.lookupsLoaded) {
      this.setSelectedFromData(data);
    } else {
      this.setFieldSelectedObj('industryId', 'industry');
      this.setFieldSelectedObj('titleId', 'rateType');
      this.setFieldSelectedObj('departmentId', 'department');
      this.setFieldSelectedObj('branchId', 'branches');
      this.setFieldSelectedObj('defaultUserId', 'defUsrId');
    }
  }

  private setSelectedFromData(data: any) {
    const nameKey =
      this._languageService.getSelectedLanguage() === 'en'
        ? 'nameEn'
        : 'nameAr';

    // Industry
    if (data.industryId) {
      const field = findField(this.formlyFields, 'industryId');
      if (field)
        field.props['selectedObj'] = {
          label: data.industryName ?? '',
          value: data.industryId,
        };
    }

    // Title
    if (data.titleId) {
      const field = findField(this.formlyFields, 'titleId');
      if (field)
        field.props['selectedObj'] = {
          label: data.titleName ?? '',
          value: data.titleId,
        };
    }

    // Department
    if (data.departmentId) {
      const field = findField(this.formlyFields, 'departmentId');
      if (field)
        field.props['selectedObj'] = {
          label: data.departmentName ?? '',
          value: data.departmentId,
        };
    }

    // Branch
    if (data.branchId) {
      const field = findField(this.formlyFields, 'branchId');
      if (field)
        field.props['selectedObj'] = {
          label: data.branchName ?? '',
          value: data.branchId,
        };
    }

    // Default User
    if (data.defaultUserId) {
      const field = findField(this.formlyFields, 'defaultUserId');
      if (field)
        field.props['selectedObj'] = {
          label: data.defaultUserName ?? '',
          value: data.defaultUserId,
        };
    }
    this.formlyFields = [...this.formlyFields];
  }

  setFieldSelectedObj(
    key: string,
    lookupPath: string,
    idProp: string = 'id',
    labelProp: string = 'name',
  ): void {
    const field: FieldTypeConfig = findField(this.formlyFields, key);
    const modelValue = this.formlyModel?.[key];

    if (field && modelValue != null) {
      const lookupData = this.lookupsData?.[lookupPath]?.result;
      const selected = lookupData?.find(
        (obj: any) => obj[idProp] == modelValue,
      );
      if (selected) {
        field.props['selectedObj'] = {
          label:
            selected[labelProp] ?? selected.nameEn ?? selected.nameAr ?? '',
          value: selected[idProp],
        };
      }
    }
  }

  onSubmit(): void {
    if (this.formly.invalid) {
      this.formly.markAllAsTouched();
      return;
    }

    this.isSubmitted = true;
    const isUpdate = !!this.userIdentifier();
    const fullPayload = {
      nameEn: this.formlyModel.nameEn,
      nameAr: this.formlyModel.nameAr ?? null,
      userName: this.formlyModel.userName,
      initial: this.formlyModel.initial,
      email: this.formlyModel.email,
      industryId: this.formlyModel.industryId
        ? +this.formlyModel.industryId
        : null,
      titleId: this.formlyModel.titleId ? +this.formlyModel.titleId : null,
      departmentId: this.formlyModel.departmentId
        ? +this.formlyModel.departmentId
        : null,
      branchId: this.formlyModel.branchId ? +this.formlyModel.branchId : null,
      defaultUserId: this.formlyModel.defaultUserId ?? null,
      phone: this.formlyModel.phone ?? null,
      phoneNumber: this.formlyModel.phoneNumber ?? null,
      mobile2: this.formlyModel.mobile2 ?? null,
      extension: this.formlyModel.extension ?? null,
      timesheetDate: this.formlyModel.timesheetDate ?? null,
      goal: this.formlyModel.goal ? +this.formlyModel.goal : null,
      active: this.formlyModel.active ?? false,
      locked: this.formlyModel.locked ?? false,
    };

    const createPayload = {
      ...fullPayload,
      username: this.formlyModel.userName,
      password: this.formlyModel.password,
    };
    delete (createPayload as any).userName;
    delete (createPayload as any).active;
    delete (createPayload as any).locked;
    const updatePayload = { ...fullPayload };

    const url = isUpdate
      ? `${API_Config.users.update}/${this.userIdentifier()}`
      : API_Config.users.create;

    const request$ = isUpdate
      ? this._apiService.put(url, updatePayload)
      : this._apiService.post(url, createPayload);

    console.log(
      `📤 ${isUpdate ? 'PUT' : 'POST'} ${url}`,
      isUpdate ? updatePayload : createPayload,
    );

    request$
      .pipe(
        finalize(() => (this.isSubmitted = false)),
        this._unsubscribe.takeUntilDestroy(),
      )
      .subscribe({
        next: (res: any) => {
          if (res?.isSuccess || res?.success) {
            this._toastrNotifiService.displaySuccess(res?.message || 'Success');
            this._router.navigate(['/users']);
          } else {
            this._toastrNotifiService.displayError(
              res?.message || 'Something went wrong',
            );
          }
        },
        error: (err: any) => {
          this._toastrNotifiService.displayError(
            err?.error?.message || err?.message || 'Something went wrong',
          );
        },
      });
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
              const userId =
                this._userDetailsService.getUserData()?.id ??
                this.userIdentifier();
              this._apiService
                .put(
                  `${API_Config.users.toggleActive}/${userId}/toggle-active`,
                  {},
                )
                .pipe(this._unsubscribe.takeUntilDestroy())
                .subscribe({
                  next: () => ref.close(true),
                  error: (err: any) => {
                    this._toastrNotifiService.displayError(
                      err?.error?.message || 'Failed',
                    );
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
    const userId = userData?.id ?? this.userIdentifier();

    const title = locked ? 'Locked' : 'Unlocked';
    const message = locked
      ? 'Are you sure you want to locked this User?'
      : 'Are you sure you want to Unlocked this User?';

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
              this._apiService
                .put(`${API_Config.users.toggleLock}/${userId}/toggle-lock`, {})
                .pipe(this._unsubscribe.takeUntilDestroy())
                .subscribe({
                  next: () => ref.close(true),
                  error: (err: any) => {
                    this._toastrNotifiService.displayError(
                      err?.error?.message || 'Failed',
                    );
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
      (obj: any) => obj.id === event.value,
    );
    const message = this._languageService.getTransValue(
      'messages.confirmApplyDefaultRate',
      { title: selectedTitleObject?.name },
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

  openResetPasswordEditor() {
    this._dialogService.open(ResetPasswordEditorComponent, {
      header: this._languageService.getTransValue('auth.resetPassword'),
      width: '30vw',
      data: { userId: this.userIdentifier() },
    });
  }

  ngOnDestroy(): void {
    this._userDetailsService.updateUserData({});
    this._unsubscribe.destroy();
  }
}
