import { Component, effect, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { matterDetailsEditorFields } from './matter-details-editor-formly.config';
import { SharedModule } from 'src/app/@shared/shared.module';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { combineLatest, finalize, firstValueFrom } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { findField } from 'src/app/@core/utilities/functions/find-field';
import { FieldTypeConfig } from '@ngx-formly/core';
import { getOptionsArray } from 'src/app/@core/utilities/functions/get-options-arr';
import { PracticeArea } from 'src/app/pages/matters/enums/matter-practicearea';
import { ConfirmDialogType } from 'src/app/@shared/enums/confirm-dialog-type';
import { SharedConfirmDialogComponent } from 'src/app/@shared/components/shared-confirm-dialog/shared-confirm-dialog.component';
import { MatterService } from 'src/app/pages/matters/services/matter.service';
import { Params } from '@angular/router';
import { SharedSkeletonGridComponent } from 'src/app/@shared/components/shared-skeleton-grid/shared-skeleton-grid.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-matter-details-editor',
  standalone: true,
  imports: [
    FormlyConfigModule,
    SharedButtonComponent,
    SharedModule,
    SharedSkeletonGridComponent,
  ],
  templateUrl: './matter-details-editor.component.html',
  styleUrl: './matter-details-editor.component.scss',
})
export class MatterDetailsEditorComponent
  extends FormBaseClass
  implements OnInit, OnDestroy
{
  practiceArea = PracticeArea;
  matterIdentifier!: number;
  _matterService = inject(MatterService);
  isInhouse = environment.brand === 'inhouse';

  refreshData = effect(() => {
    if (this._matterService.getMatter()) {
      this.formlyModel = { ...this._matterService.getMatter() };
      console.log('this.formlyModel', this.formlyModel);
    }
  });

  ngOnInit() {
    this.getLookupsData();
  }

  override getLookupsData() {
    this.isLoading = true;
    combineLatest({
      jurisdictions: this._apiService.get(
        API_Config.general.getJurisdictionLookup,
      ),
      status: this._apiService.get(API_Config.general.getMatterStatus),
      stages: this._apiService.get(API_Config.general.getStages),
      practiceArea: this._apiService.get(
        API_Config.general.getPractsAreaLookup,
      ),
      clients: this._apiService.get(API_Config.general.getClients),
      branches: this._apiService.get(API_Config.general.getAllBranches),
      responableLawyer: this._apiService.get(
        API_Config.responsibleLawyerSecurity.get,
      ),

      lawyer: this._apiService.get(API_Config.responsibleLawyerSecurity.getAll),
      referralType: this._apiService.get(API_Config.general.getReferralType),
    })
      .pipe(
        finalize(() => (this.isLoading = false)),
        this._unsubscribe.takeUntilDestroy(),
      )
      .subscribe({
        next: (res) => {
          this.lookupsData = res;
          this.initForm();
        },
      });
  }
  override initForm(): void {
    this.formlyFields = matterDetailsEditorFields(this);
    this.getParams();
  }

  getParams() {
  this._route.params
    .pipe(this._unsubscribe.takeUntilDestroy())
    .subscribe({
      next: (param: Params) => {
        if (param['id']) {
          this.matterIdentifier = param['id'];
          this.getMatterById(param['id']);
        } else {
          if (!this._matterService.getMatter()?.openDate) {
            this._matterService.updateMatter({});
          }

          this.setFormData();
        }
      },
    });
}
  // setFormData() {
  //   // Set Default value By (setTimeOut & hook init) to detect the default value
  //   setTimeout(() => {
  //     this.formlyModel = {
  //       practsAreaId: 1,
  //       requestTypeId: 1,
  //       ...this._matterService.getMatter()
  //     }
  //     this.formlyModel = { ...this.formlyModel }
  //     this.getMatterCategoriesByPracticeArea(this.formlyModel.practsAreaId)

  //   }, 500)

  // }
  // setFormData() {
  //   setTimeout(() => {
  //     this.formlyModel = {
  //       practsAreaId: 1,
  //       requestTypeId: 1,
  //       ...this._matterService.getMatter(),
  //     };

  //   }, 500);
  //   this.getMatterCategoriesByPracticeArea(this.formlyModel.practsAreaId);
  //   this.getParentMatterByClientId(this.formlyModel.clientId);
  //   this.getMatterTypeByMatterCategory(this.formlyModel.law_MtrCatId);
  //   this.getJudicatureByJurisdiction(this.formlyModel.jurisdictionId);
  // }

  setFormData() {
    setTimeout(() => {
      this.formlyModel = {
        practsAreaId: 1,
        requestTypeId: 1,
        ...this._matterService.getMatter(),
      };
      if (this.formlyModel.practsAreaId) {
        this.checkIsLitigation(this.formlyModel.practsAreaId);
      }

      this.getMatterCategoriesByPracticeArea(this.formlyModel.practsAreaId);
      this.getParentMatterByClientId(this.formlyModel.clientId);
      this.getMatterTypeByMatterCategory(this.formlyModel.law_MtrCatId);
      this.getJudicatureByJurisdiction(this.formlyModel.jurisdictionId);
    }, 0);
  }

  getMatterById(matterIdentifier: number) {
    const param = {
      id: matterIdentifier,
    };
    this._apiService
      .get(API_Config.matters.getById, param)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          setTimeout(() => {
            this.formlyModel = {
              ...res['result'],
              openDate: res['result']?.openDate
                ? new Date(res['result']?.openDate)
                : null,
              closeDate: res['result']?.closeDate
                ? new Date(res['result']?.closeDate)
                : null,
              law_AssignedLaywerList:
                Array.isArray(res['result']?.law_AssignedLaywerList) &&
                res['result']?.law_AssignedLaywerList.length > 0
                  ? res['result']?.law_AssignedLaywerList?.map(
                      (obj: any) => obj.id,
                    )
                  : [],
              law_OtherStaffList:
                Array.isArray(res['result']?.law_OtherStaffList) &&
                res['result']?.law_OtherStaffList.length > 0
                  ? res['result']?.law_OtherStaffList?.map((obj: any) => obj.id)
                  : [],
            };
            if (this.formlyModel.practsAreaId) {
              this.checkIsLitigation(this.formlyModel.practsAreaId);
            }
            this.getMatterCategoriesByPracticeArea(
              this.formlyModel.practsAreaId,
            );

            this.getParentMatterByClientId(this.formlyModel.clientId);
            this.getMatterTypeByMatterCategory(this.formlyModel.law_MtrCatId);
            this.getJudicatureByJurisdiction(this.formlyModel.jurisdictionId);
          });
        },
      });
  }

  // getMatterCategoriesByPracticeArea(practiceAreaId: number) {
  //   const param = {
  //     PractsAreaId: practiceAreaId
  //   }
  //   this._apiService
  //     .get(API_Config.general.getMatterCategoriesLookup, param)
  //     .pipe(this._unsubscribe.takeUntilDestroy())
  //     .subscribe({
  //       next: (res: ApiRes) => {
  //         const matterCategoryField: FieldTypeConfig = findField(this.formlyFields, 'law_MtrCatId')
  //         // const matterTypeField: FieldTypeConfig = findField(this.formlyFields, 'mtrTypeId')
  //         if (matterCategoryField) {
  //           matterCategoryField.props['optionsArr'] = []
  //           // matterTypeField.props['optionsArr'] = []

  //           matterCategoryField.props['optionsArr'] = getOptionsArray(res.result, 'id', 'name');

  //           this.formlyModel = { ...this.formlyModel }
  //         }
  //       },
  //     });
  // }
  async getMatterCategoriesByPracticeArea(
    practiceAreaId: number,
  ): Promise<void> {
    const param = { PractsAreaId: practiceAreaId };
    const res = await firstValueFrom(
      this._apiService.get(API_Config.general.getMatterCategoriesLookup, param),
    );

    const matterCategoryField = findField(this.formlyFields, 'law_MtrCatId');
    if (matterCategoryField) {
      matterCategoryField.props['optionsArr'] = getOptionsArray(
        res.result,
        'id',
        'name',
      );
      this.formlyModel = { ...this.formlyModel };
    }
  }

  checkIsLitigation(practsAreaId: number): void {
    if (!practsAreaId) return;
    const param = { Id: practsAreaId };
    this._apiService
      .get(API_Config.general.checkIsLitigation, param)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res?.isSuccess) {
            const isLitigation =
              typeof res.result === 'boolean'
                ? res.result
                : String(res.result).toLowerCase() === 'true';
            this.formlyModel = {
              ...this.formlyModel,
              isLitigation,
            };

            this._matterService.updateMatter({
              ...this._matterService.getMatter(),
              ...this.formlyModel,
              isLitigation,
            });
          }
        },
      });
  }

  getMatterTypeByMatterCategory(matterCategoryId: number) {
    const param = {
      matClntId: matterCategoryId,
    };
    this._apiService
      .get(API_Config.general.getMatterTypesByCategoryId, param)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          const matterTypeField: FieldTypeConfig = findField(
            this.formlyFields,
            'mtrTypeId',
          );
          if (matterTypeField) {
            matterTypeField.props['optionsArr'] = getOptionsArray(
              res.result,
              'id',
              'name',
            );
            console.log(matterTypeField);
            this.formlyModel = { ...this.formlyModel };
          }
        },
      });
  }

  getJudicatureByJurisdiction(jurisdictionId: number) {
    const param = {
      Law_JurisdictionId: jurisdictionId,
    };
    this._apiService
      .get(API_Config.general.getJudicatureByJurisdictionId, param)
      .subscribe({
        next: (res: ApiRes) => {
          const judicatureField: FieldTypeConfig = findField(
            this.formlyFields,
            'judicatureId',
          );
          if (judicatureField) {
            judicatureField.props['optionsArr'] = getOptionsArray(
              res.result,
              'id',
              'name',
            );
          }
        },
      });
  }

  getClientNameAndMattCodeByClient(clientId: number) {
    const param = { clientId };
    this._apiService
      .get(API_Config.matters.getClientNameAndMatterCodeByClientId, param)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res && res.isSuccess) {
            // this.formlyModel.clientName=res.result['name']
            this.formlyModel.mtrNo = res.result['mattCode'];
            this.formlyModel = { ...this.formlyModel };
          }
        },
      });
  }
  getParentMatterByClientId(clientId: number) {
    const param = { clientId };
    this._apiService
      .get(API_Config.general.getLawMattertCodeByClient, param)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res?.isSuccess) {
            const matterCategoryField: FieldTypeConfig = findField(
              this.formlyFields,
              'parentMatterId',
            );
            if (matterCategoryField) {
              matterCategoryField.formControl.reset();
              matterCategoryField.props['optionsArr'] = getOptionsArray(
                res.result,
                'id',
                'name',
              );
            }
          }
        },
      });
  }
  getCLientNameAndMattCodeByClientAndParent(
    clientId: number,
    parentId: number,
  ) {
    const param = { clientId, parentId };
    this._apiService
      .get(API_Config.matters.getCLientNameAndMattCodeByClientAndParent, param)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res.isSuccess) {
            console.log('getCLientNameAndMattCodeByClientAndParent', res);
            this.formly.patchValue({
              clientName: res.result['name'],
              mtrNo: res.result['mattCode'],
            });
          }
        },
      });
  }

  clearInheritedParties(): void {
    this.formlyModel = {
      ...this.formlyModel,
      law_MatterParties: [],
    };

    this._matterService.updateMatter({
      ...this._matterService.getMatter(),
      ...this.formlyModel,
      law_MatterParties: [],
    });
  }

  getParentMatterParties(parentMatterId: number) {
    const payload = {
      matterId: parentMatterId,
    };
    this._apiService
      .get(API_Config.matters.getPartiesByMatterId, payload)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res.isSuccess && res['result'].dataList.length > 0) {
            const confirmDeleteRef = this._dialogService.open(
              SharedConfirmDialogComponent,
              {
                data: {
                  type: ConfirmDialogType.Question,
                  message: "Would you like to add parent's matter parties?",
                  btns: [
                    {
                      label: 'No',
                      styleClass: 'border border-grey500 text-grey500',
                      command: () => {
                        this.clearInheritedParties();
                        confirmDeleteRef.close();
                      },
                    },
                    {
                      label: 'Yes',
                      styleClass: 'bg-primary text-white',
                      command: () => {
                        this._matterService.updateMatter({
                          ...this.formlyModel,
                          law_MatterParties: res['result'].dataList,
                        });
                        confirmDeleteRef.close(true);
                      },
                    },
                  ],
                },
              },
            );
          }
        },
      });
  }
  // nextPage() {
  //   this._matterService.updateMatter(this.formlyModel);
  //   this._matterService.updateRefreshCurrentTab(true);
  //   switch (this.formlyModel?.practsAreaId) {
  //     case this.practiceArea.Litigation:
  //       this._router.navigate(['parties'], { relativeTo: this._route });
  //       break;
  //     case this.practiceArea.Corporate:
  //       this._router.navigate(['billing'], { relativeTo: this._route });
  //       break;

  //             case this.practiceArea.IntelecturualProperty:
  //       this._router.navigate(['applicant'], { relativeTo: this._route });
  //       break;

  //     // default:
  //     //   this._router.navigate(['applicant'], { relativeTo: this._route });
  //     //   break;

  //   }
  // }
  nextPage() {
    this._matterService.updateMatter(this.formlyModel);
    this._matterService.updateRefreshCurrentTab(true);
    const practsAreaId = this.formlyModel?.practsAreaId;
    if (practsAreaId === this.practiceArea.IntelecturualProperty) {
      this._router.navigate(['applicant'], { relativeTo: this._route });
      return;
    }
    if (this.formlyModel?.isLitigation) {
      this._router.navigate(['parties'], { relativeTo: this._route });
    } else {
      this._router.navigate(['billing'], { relativeTo: this._route });
    }
  }

  cancel() {
    this._router.navigate(['/matters']);
  }

  //
  // override onSubmit(): void {
  //   console.log('onSubmit');

  //   if (this.formly.invalid) {
  //     const text = this._languageService.getTransValue('messages.pleaseFillRequiredData');
  //     this._toastrNotifiService.displayError(text);
  //     return;
  //   }
  //   this.isLoading = true;
  //   const requestPayload = this.removeNullOrUndefinedValues({
  //     ...this.formlyModel,
  //     law_MatterApplicants: this.formlyModel?.law_MatterApplicants?.length > 0 ? this.formlyModel?.law_MatterApplicants?.map((obj: any) => {
  //       const { id, ...rest } = obj
  //       return rest
  //     }) : [],
  //   });

  //   const pathApi = this.matterIdentifier ? API_Config.matters.update : API_Config.matters.create;

  //   this._apiService
  //     .post(pathApi, requestPayload)
  //     .pipe(
  //       finalize(() => (this.isLoading = false)),
  //       this._unsubscribe.takeUntilDestroy()
  //     )
  //     .subscribe({
  //       next: (res: ApiRes) => {
  //         if (res?.isSuccess) {
  //           this._toastrNotifiService.displaySuccess(res?.message);
  //           this._matterService.updateMatter({});
  //           setTimeout(() => {
  //             this._router.navigate(['/matters', this.matterIdentifier]);
  //           }, 500)
  //         } else {
  //           this._toastrNotifiService.displayError(res?.message);
  //         }
  //       },
  //       error: (err: any) => {
  //         this._toastrNotifiService.displayError(err?.error?.message);
  //       },
  //     });
  // }

  override onSubmit(): void {
    console.log('onSubmit');

    if (this.formly.invalid) {
      const text = this._languageService.getTransValue(
        'common.pleaseFillRequiredData',
      );
      this._toastrNotifiService.displayError(text);
      return;
    }

    this.isSubmitted = true;
    this.isLoading = true;
    const requestPayload = this.removeNullOrUndefinedValues({
      law_AssignedLaywerList: [],
      law_OtherStaffList: null,
      law_MatterParties: [],
      law_MatterContactss: [],
      billingTemplatId: null,
      emailTemplatId: null,
      defaultTaskTypeId: 1,
      billingTypeId: 1,
      defaultRateId: 1,
      defaultRate: 'A',

      billingClaimAmount: null,
      law_MatterClass: null,
      ...this.formlyModel,
      law_MatterApplicants:
        this.formlyModel?.law_MatterApplicants?.length > 0
          ? this.formlyModel?.law_MatterApplicants?.map((obj: any) => {
              const { id, ...rest } = obj;
              return rest;
            })
          : [],
    });

    const pathApi = this.matterIdentifier
      ? API_Config.matters.update
      : API_Config.matters.create;

    this._apiService
      .post(pathApi, requestPayload)
      .pipe(
        finalize(() => {
          ((this.isSubmitted = false), (this.isLoading = false));
        }),
        this._unsubscribe.takeUntilDestroy(),
      )
      .subscribe({
        next: (res: ApiRes) => {
          if (res?.isSuccess) {
            this._toastrNotifiService.displaySuccess(res?.message);
            this._matterService.updateMatter({});
            this.resetFormData();
            setTimeout(() => {
              if (this.matterIdentifier) {
                this._router.navigate(['/matters', this.matterIdentifier]);
              } else {
                this._router.navigate(['/matters']);
              }
            }, 500);
          } else {
            this._toastrNotifiService.displayError(res?.message);
          }
        },
        error: (err: any) => {
          const backendMessage =
            err?.error?.message || err?.error?.title || err?.message;

          if (
            backendMessage?.includes('entity changes') ||
            backendMessage?.includes('FOREIGN KEY') ||
            backendMessage?.includes('constraint')
          ) {
            this._toastrNotifiService.displayError(
              backendMessage ||
                'Please make sure all required fields are filled correctly.',
            );
          } else {
            this._toastrNotifiService.displayError(
              backendMessage || 'Something went wrong. Please try again.',
            );
          }
        },
      });
  }

  private resetFormData(): void {
    this.formlyModel = {};

    if (this.formly) {
      this.formly.reset();
    }
  }

  private removeNullOrUndefinedValues(obj: { [key: string]: any }): {
    [key: string]: any;
  } {
    const cleanedObj: { [key: string]: any } = {};
    Object.keys(obj).forEach((key) => {
      if (obj[key] !== null && obj[key] !== undefined) {
        cleanedObj[key] = obj[key];
      }
    });
    return cleanedObj;
  }

  ngOnDestroy(): void {
    this._matterService.updateMatter(this.formlyModel);
  }
}
