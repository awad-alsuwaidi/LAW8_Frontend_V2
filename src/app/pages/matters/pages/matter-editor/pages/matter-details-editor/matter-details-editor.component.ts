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

type LookupItem = {
  id: number;
  name: string;
  nameEn?: string;
  nameAr?: string;
  parentId?: number | null;
  isLitigation?: boolean;
  hasApplicants?: boolean;
  hasClasses?: boolean;
  userId?: string;
  isLawyer?: boolean;
  [key: string]: any;
};

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

  lookups: {
    practiceAreas: LookupItem[];
    matterCategories: LookupItem[];
    matterTypes: LookupItem[];
    jurisdictions: LookupItem[];
    judicatures: LookupItem[];
    matterStatuses: LookupItem[];
    matterStages: LookupItem[];
    branches: LookupItem[];
    referralTypes: LookupItem[];
    users: LookupItem[];
    partyTypes: LookupItem[];
    partyDescriptions: LookupItem[];
    matterClassCategories: LookupItem[];
    taskCodeGroups: LookupItem[];
    taskCodes: LookupItem[];
  } = {
    practiceAreas: [],
    matterCategories: [],
    matterTypes: [],
    jurisdictions: [],
    judicatures: [],
    matterStatuses: [],
    matterStages: [],
    branches: [],
    referralTypes: [],
    users: [],
    partyTypes: [],
    partyDescriptions: [],
    matterClassCategories: [],
    taskCodeGroups: [],
    taskCodes: [],
  };

  override getLookupsData() {
    this.isLoading = true;

    const types = [
      'practiceAreas',
      'matterCategories',
      'matterTypes',
      'jurisdictions',
      'judicatures',
      'matterStatuses',
      'matterStages',
      'branches',
      'referralTypes',
      'users',
      'partyTypes',
      'partyDescriptions',
      'matterClassCategories',
      'taskCodeGroups',
      'taskCodes',
    ];

    combineLatest({
      lookups: this._apiService.get(API_Config.general.getLookups, { types }),
      clients: this._apiService.get(API_Config.general.getClients),
    })
      .pipe(
        finalize(() => (this.isLoading = false)),
        this._unsubscribe.takeUntilDestroy(),
      )
      .subscribe({
        next: (res: any) => {
          try {
            const data =
              res.lookups?.data ?? res.lookups?.result ?? res.lookups ?? {};
            const mapName = (list: any) => {
              if (!Array.isArray(list)) return [];
              return list.map((x: any) => ({
                ...x,
                name: x.name || x.nameEn || x.nameAr || '',
              }));
            };

            this.lookups = {
              practiceAreas: mapName(data.practiceAreas),
              matterCategories: mapName(data.matterCategories),
              matterTypes: mapName(data.matterTypes),
              jurisdictions: mapName(data.jurisdictions),
              judicatures: mapName(data.judicatures),
              matterStatuses: mapName(data.matterStatuses),
              matterStages: mapName(data.matterStages),
              branches: mapName(data.branches),
              referralTypes: mapName(data.referralTypes),
              users: mapName(data.users),
              partyTypes: mapName(data.partyTypes),
              partyDescriptions: mapName(data.partyDescriptions),
              matterClassCategories: mapName(data.matterClassCategories),
              taskCodeGroups: mapName(data.taskCodeGroups),
              taskCodes: mapName(data.taskCodes),
            };

            // ============ Clients ============
            // ⭐ extractList بتتعامل مع {data:{items:[]}} و {items:[]} و array مباشرة
            // const clientsList = this.extractList(res.clients).map((c: any) => ({
            //   ...c,
            //   name:
            //     c.nameEn ||
            //     c.nameAr ||
            //     c.name ||
            //     c.clientCode ||
            //     `Client #${c.id}`,
            // }));
            const clientsList = this.extractList(res.clients).map((c: any) => ({
              ...c,
              name: c.clientCode
                ? `${c.clientCode} - ${c.nameEn || c.nameAr || ''}`.trim()
                : c.nameEn || c.nameAr || `Client #${c.id}`,
            }));
            this.lookupsData = {
              practiceArea: { result: this.lookups.practiceAreas },
              jurisdictions: { result: this.lookups.jurisdictions },
              status: { result: this.lookups.matterStatuses },
              stages: { result: this.lookups.matterStages },
              branches: { result: this.lookups.branches },
              referralType: { result: this.lookups.referralTypes },
              lawyer: {
                result: this.lookups.users.filter((u) => u.isLawyer === true),
              },
              responableLawyer: { result: this.lookups.users },
              clients: { result: clientsList },
            };

            this.initForm();
          } catch (e) {
            console.error('[MatterDetailsEditor] lookups processing failed', e);
            this.isLoading = false;
          }
        },
        error: (err) => {
          console.error('[MatterDetailsEditor] lookups request failed', err);
          this.isLoading = false;
        },
      });
  }

  private extractList(res: any): any[] {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    const d = res.data ?? res.result ?? res;
    if (Array.isArray(d)) return d;
    if (Array.isArray(d?.items)) return d.items;
    if (Array.isArray(d?.dataList)) return d.dataList;
    return [];
  }

  refreshData = effect(() => {
    if (this._matterService.getMatter()) {
      this.formlyModel = { ...this._matterService.getMatter() };
    }
  });

  ngOnInit() {
    this.getLookupsData();
  }

  override initForm(): void {
    this.formlyFields = matterDetailsEditorFields(this);
    this.getParams();
  }

  getParams() {
    this._route.params.pipe(this._unsubscribe.takeUntilDestroy()).subscribe({
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
    const baseUrl = API_Config.matters.getById;
    const url = baseUrl.includes('{id}')
      ? baseUrl.replace('{id}', String(matterIdentifier))
      : `${baseUrl.replace(/\/+$/, '')}/${matterIdentifier}`;

    console.log('[MatterDetailsEditor] GET', url);

    this._apiService
      .get(url, { LoadFile: false })
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: any) => {
          console.log('[MatterDetailsEditor] RESPONSE =', res);

          const body = res?.data ?? res?.result ?? res;
          const r: any = Array.isArray(body?.items) ? body.items[0] : body;

          if (!r || !r.id) {
            console.warn('[MatterDetailsEditor] no matter data', res);
            return;
          }

          const mappedModel = {
            ...r,
            mtrNo: r.matterCode,
            law_BranchId: r.branchId,
            practsAreaId: r.practiceAreaId,
            law_MtrCatId: r.matterCategoryId,
            mtrTypeId: r.matterTypeId,
            law_InstructorId: r.instructorClientId,
            law_ReferralTypeId: r.referralTypeId,
            tradmarkTypeId: r.trademarkTypeId,
            law_ResponsibleLaywerId: r.responsibleLawyerId,
            law_ClientIntroducingId: r.clientIntroducingUserId,
            law_MatterIntroducingLawyerId: r.matterIntroducingLawyerUserId,
            openDate: r.openDate ? new Date(r.openDate) : null,
            closeDate: r.closeDate ? new Date(r.closeDate) : null,
            law_AssignedLaywerList: Array.isArray(r.assignedLawyerIds)
              ? r.assignedLawyerIds
              : Array.isArray(r.assignedLawyers)
                ? r.assignedLawyers.map((x: any) => x.userId ?? x.id)
                : [],
            law_OtherStaffList: Array.isArray(r.otherStaffIds)
              ? r.otherStaffIds
              : Array.isArray(r.otherStaff)
                ? r.otherStaff.map((x: any) => x.userId ?? x.id)
                : [],
          };

          setTimeout(() => {
            this.formlyModel = mappedModel;
            this._matterService.updateMatter(mappedModel);

            if (this.formlyModel.practsAreaId) {
              this.checkIsLitigation(this.formlyModel.practsAreaId);
            }
            this.getMatterCategoriesByPracticeArea(
              this.formlyModel.practsAreaId,
            );
            this.getParentMatterByClientId(this.formlyModel.clientId);
            this.getMatterTypeByMatterCategory(this.formlyModel.law_MtrCatId);
            this.getJudicatureByJurisdiction(this.formlyModel.jurisdictionId);
          }, 0);
        },
        error: (err) => {
          console.error('[MatterDetailsEditor] fetch failed', err);
        },
      });
  }

  //  هنااا هيطبق شغل ال hasclasses & hasapplicant
  /**  client-side filter بدل الـ endpoint القديم */
  // async getMatterCategoriesByPracticeArea(practiceAreaId: number): Promise<void> {
  //   if (!practiceAreaId) return;

  //   const cats = this.lookups.matterCategories.filter((c) => c.parentId === practiceAreaId);
  //   const matterCategoryField = findField(this.formlyFields, 'law_MtrCatId');
  //   if (matterCategoryField) {
  //     matterCategoryField.props['optionsArr'] = getOptionsArray(cats, 'id', 'name');
  //   }

  //   // ⭐ NEW: reset hasClasses لحد ما المستخدم يختار category
  //   this.formlyModel = {
  //     ...this.formlyModel,
  //     hasClasses: false,
  //   };
  //   this._matterService.updateMatter(this.formlyModel);
  // }

  //   /** ⭐ مفيش call — بنقرأ isLitigation/hasApplicants من practiceArea */
  //   checkIsLitigation(practsAreaId: number): void {
  //     if (!practsAreaId) return;
  //     const pa = this.lookups.practiceAreas.find((p) => p.id === practsAreaId);
  //     const isLitigation = pa?.isLitigation === true;
  //     const hasApplicants = pa?.hasApplicants === true;

  //     this.formlyModel = {
  //       ...this.formlyModel,
  //       isLitigation,
  //       hasApplicants,
  //     };

  //     this._matterService.updateMatter({
  //       ...this._matterService.getMatter(),
  //       ...this.formlyModel,
  //       isLitigation,
  //       hasApplicants,
  //     });
  //   }

  //   /** ⭐ client-side filter */
  // async getMatterTypeByMatterCategory(matterCategoryId: number) {
  //   if (!matterCategoryId) return;

  //   const cat = this.lookups.matterCategories.find((c) => c.id === matterCategoryId);
  //   const types = this.lookups.matterTypes.filter((t) => t.parentId === matterCategoryId);

  //   const matterTypeField: FieldTypeConfig = findField(
  //     this.formlyFields,
  //     'mtrTypeId',
  //   ) as FieldTypeConfig;
  //   if (matterTypeField) {
  //     matterTypeField.props['optionsArr'] = getOptionsArray(types, 'id', 'name');
  //   }

  //   // ⭐ NEW: حفظ hasClasses عشان الـ formly يقرأها
  //   this.formlyModel = {
  //     ...this.formlyModel,
  //     hasClasses: cat?.hasClasses === true,
  //   };
  //   this._matterService.updateMatter(this.formlyModel);
  // }

  // checkIsLitigation(practsAreaId: number): void {
  //   if (!practsAreaId) return;
  //   const pa = this.lookups.practiceAreas.find((p) => p.id === practsAreaId);
  //   const isLitigation = pa?.isLitigation === true;

  //   this.formlyModel = {
  //     ...this.formlyModel,
  //     isLitigation,
  //   };

  //   this._matterService.updateMatter({
  //     ...this._matterService.getMatter(),
  //     ...this.formlyModel,
  //     isLitigation,
  //   });
  // }

  // async getMatterCategoriesByPracticeArea(
  //   practiceAreaId: number,
  // ): Promise<void> {
  //   if (!practiceAreaId) return;

  //   const cats = this.lookups.matterCategories.filter(
  //     (c) => c.parentId === practiceAreaId,
  //   );
  //   const matterCategoryField = findField(this.formlyFields, 'law_MtrCatId');
  //   if (matterCategoryField) {
  //     matterCategoryField.props['optionsArr'] = getOptionsArray(
  //       cats,
  //       'id',
  //       'name',
  //     );
  //   }

  //   this._matterService.updateMatter(this.formlyModel);
  // }

  // async getMatterTypeByMatterCategory(matterCategoryId: number) {
  //   if (!matterCategoryId) return;

  //   const types = this.lookups.matterTypes.filter(
  //     (t) => t.parentId === matterCategoryId,
  //   );

  //   const matterTypeField: FieldTypeConfig = findField(
  //     this.formlyFields,
  //     'mtrTypeId',
  //   ) as FieldTypeConfig;
  //   if (matterTypeField) {
  //     matterTypeField.props['optionsArr'] = getOptionsArray(
  //       types,
  //       'id',
  //       'name',
  //     );
  //   }

  //   this._matterService.updateMatter(this.formlyModel);
  // }

  ///////////////////////////////////////////

  isTrademarkCategory(catId: number | undefined | null): boolean {
    if (!catId) return false;
    const cat = this.lookups.matterCategories.find((c) => c.id === catId);
    return cat?.hasClasses === true;
  }

  checkIsLitigation(practsAreaId: number): void {
    if (!practsAreaId) return;
    const pa = this.lookups.practiceAreas.find((p) => p.id === practsAreaId);
    const isLitigation = pa?.isLitigation === true;

    this.formlyModel = { ...this.formlyModel, isLitigation };
    this._matterService.updateMatter({
      ...this._matterService.getMatter(),
      ...this.formlyModel,
      isLitigation,
    });
  }

  async getMatterCategoriesByPracticeArea(
    practiceAreaId: number,
  ): Promise<void> {
    const matterCategoryField = findField(this.formlyFields, 'law_MtrCatId');
    const matterTypeField = findField(this.formlyFields, 'mtrTypeId');
    if (matterTypeField) {
      matterTypeField.props['optionsArr'] = [];
      matterTypeField.formControl?.reset();
    }

    if (!practiceAreaId) {
      if (matterCategoryField) matterCategoryField.props['optionsArr'] = [];
      return;
    }

    const cats = this.lookups.matterCategories.filter(
      (c) => c.parentId === practiceAreaId && !c['isCancelled'],
    );

    if (matterCategoryField) {
      matterCategoryField.props['optionsArr'] = getOptionsArray(
        cats,
        'id',
        'name',
      );
    }
  }

  async getMatterTypeByMatterCategory(matterCategoryId: number) {
    const matterTypeField = findField(
      this.formlyFields,
      'mtrTypeId',
    ) as FieldTypeConfig;

    if (!matterCategoryId) {
      if (matterTypeField) {
        matterTypeField.props['optionsArr'] = [];
        matterTypeField.formControl?.reset();
      }
      return;
    }

    const types = this.lookups.matterTypes.filter(
      (t) => t.parentId === matterCategoryId && !t['isCancelled'],
    );

    if (matterTypeField) {
      matterTypeField.props['optionsArr'] = getOptionsArray(
        types,
        'id',
        'name',
      );
    }
  }

  getJudicatureByJurisdiction(jurisdictionId: number) {
    const judicatureField = findField(
      this.formlyFields,
      'judicatureId',
    ) as FieldTypeConfig;

    if (!jurisdictionId) {
      if (judicatureField) {
        judicatureField.props['optionsArr'] = [];
        judicatureField.formControl?.reset();
      }
      return;
    }

    const juds = this.lookups.judicatures.filter(
      (j) => j.parentId === jurisdictionId && !j['isCancelled'],
    );

    if (judicatureField) {
      judicatureField.props['optionsArr'] = getOptionsArray(juds, 'id', 'name');
    }
  }

  // getJudicatureByJurisdiction(jurisdictionId: number) {
  //   if (!jurisdictionId) return;
  //   const juds = this.lookups.judicatures.filter(
  //     (j) => j.parentId === jurisdictionId,
  //   );
  //   const judicatureField: FieldTypeConfig = findField(
  //     this.formlyFields,
  //     'judicatureId',
  //   ) as FieldTypeConfig;
  //   if (judicatureField) {
  //     judicatureField.props['optionsArr'] = getOptionsArray(juds, 'id', 'name');
  //   }
  // }

  async getClientNameAndMattCodeByClient(clientId: number) {
    if (!clientId) return;
    try {
      const res: any = await firstValueFrom(
        this._apiService.get(API_Config.matters.nextCode, { clientId }),
      );
      this.formlyModel.mtrNo = res?.data ?? res?.result;
      this.formlyModel = { ...this.formlyModel };
    } catch {}
  }

  // async getParentMatterByClientId(clientId: number) {
  //   if (!clientId) return;
  //   try {
  //     const res: any = await firstValueFrom(
  //       this._apiService.get(API_Config.general.getMainMatters, {
  //         clientId,
  //         mainOnly: true,
  //       }),
  //     );

  //     // response shape: { data: { items: [...] }, success: true }
  //     const body = res?.data ?? res?.result ?? {};
  //     const list: any[] = Array.isArray(body?.items)
  //       ? body.items
  //       : Array.isArray(body)
  //         ? body
  //         : [];

  //     const parentField: FieldTypeConfig = findField(
  //       this.formlyFields,
  //       'parentMatterId',
  //     ) as FieldTypeConfig;

  //     if (parentField) {
  //       parentField.formControl.reset();
  //       parentField.props['optionsArr'] = getOptionsArray(list, 'id', 'code');
  //     }
  //   } catch {
  //   }
  // }

  async getParentMatterByClientId(clientId: number) {
    if (!clientId) return;
    try {
      const res: any = await firstValueFrom(
        this._apiService.get(API_Config.general.getMainMatters, {
          clientId,
          mainOnly: true,
        }),
      );
      const body = res?.data ?? res?.result ?? {};
      const list: any[] = Array.isArray(body?.items)
        ? body.items
        : Array.isArray(body)
          ? body
          : [];

      const options = list.map((m: any) => ({
        ...m,
        name: [m.code, m.descr].filter(Boolean).join(' | '),
      }));

      const parentField: FieldTypeConfig = findField(
        this.formlyFields,
        'parentMatterId',
      ) as FieldTypeConfig;

      if (parentField) {
        parentField.formControl.reset();
        parentField.props['optionsArr'] = getOptionsArray(
          options,
          'id',
          'name',
        );
      }
    } catch {}
  }

  async getParentMatterParties(parentMatterId: number) {
    if (!parentMatterId) return;
    try {
      const res: any = await firstValueFrom(
        this._apiService.get(API_Config.matters.getMatterParties, {
          'filters[matterId]': parentMatterId,
        }),
      );

      console.log('[getParentMatterParties] response =', res);

      const parties = this.extractList(res);

      console.log('[getParentMatterParties] parties count =', parties.length);

      if (!parties.length) {
        console.log('[getParentMatterParties] no parties — dialog skipped');
        return;
      }

      const ref: any = this._dialogService.open(SharedConfirmDialogComponent, {
        data: {
          type: ConfirmDialogType.Question,
          message: "Would you like to add parent's matter parties?",
          btns: [
            {
              label: 'No',
              styleClass: 'border border-grey500 text-grey500',
              command: () => {
                this.clearInheritedParties();
                ref.close();
              },
            },
            {
              label: 'Yes',
              styleClass: 'bg-primary text-white',
              command: () => {
                this._matterService.updateMatter({
                  ...this.formlyModel,
                  law_MatterParties: parties,
                });
                ref.close(true);
              },
            },
          ],
        },
      });
    } catch (err) {
      console.error('[getParentMatterParties] error', err);
    }
  }

  async getCLientNameAndMattCodeByClientAndParent(
    clientId: number,
    parentId: number,
  ) {
    if (!parentId) return;
    try {
      const res: any = await firstValueFrom(
        this._apiService.get(API_Config.matters.nextCode, {
          parentMatterId: parentId,
        }),
      );
      this.formly.patchValue({ mtrNo: res?.data ?? res?.result });
    } catch {}
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

  nextPage() {
    this._matterService.updateMatter(this.formlyModel);
    this._matterService.updateRefreshCurrentTab(true);

    const practsAreaId = Number(this.formlyModel?.practsAreaId);
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

  override onSubmit(): void {
    if (this.formly.invalid) {
      const text = this._languageService.getTransValue(
        'common.pleaseFillRequiredData',
      );
      this._toastrNotifiService.displayError(text);
      return;
    }

    this.isSubmitted = true;
    this.isLoading = true;

    const m: any = this.formlyModel;

    const payload: any = {
      requestTypeId: m.requestTypeId,
      parentMatterId: m.parentMatterId ?? null,
      clientId: m.clientId,
      instructorClientId: m.law_InstructorId,
      branchId: m.law_BranchId,
      practiceAreaId: m.practsAreaId,
      matterCategoryId: m.law_MtrCatId,
      matterTypeId: m.mtrTypeId,
      jurisdictionId: m.jurisdictionId,
      judicatureId: m.judicatureId,
      statusId: m.statusId,
      stageId: m.stageId,
      referralTypeId: m.law_ReferralTypeId,
      descr: m.descr,
      courtNumber: m.courtNumber,
      notes: m.notes,
      matterCode: m.mtrNo,
      matterBalance: m.matterBalance,
      trademarkTypeId: m.tradmarkTypeId,
      wordMark: m.wordMark,
      isCaseSensitive: m.isCaseSensitive,
      trademarkLogo: m.logoFileBase64,
      openDate: m.openDate,
      closeDate: m.closeDate,
      responsibleLawyerId: m.law_ResponsibleLaywerId,
      clientIntroducingUserId: m.law_ClientIntroducingId,
      matterIntroducingLawyerUserId: m.law_MatterIntroducingLawyerId,
      isActive: true,
      assignedLawyerIds: m.law_AssignedLaywerList ?? [],
      otherStaffIds: m.law_OtherStaffList ?? [],
      parties: (m.law_MatterParties ?? []).map(
        ({ id, matterId, ...rest }: any) => rest,
      ),
      applicants: (m.law_MatterApplicants ?? []).map(
        ({ id, ...rest }: any) => rest,
      ),
      classes: (m.law_MatterClass ?? []).map(({ id, ...rest }: any) => rest),
      billing: m.billing,
    };

    Object.keys(payload).forEach((k) => {
      if (payload[k] === null || payload[k] === undefined) delete payload[k];
    });

    const pathApi = this.matterIdentifier
      ? `${API_Config.matters.update}/${this.matterIdentifier}`
      : API_Config.matters.create;

    const req$ = this.matterIdentifier
      ? this._apiService.put(pathApi, payload)
      : this._apiService.post(pathApi, payload);

    req$
      .pipe(
        finalize(() => {
          this.isSubmitted = false;
          this.isLoading = false;
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
              this._router.navigate(
                this.matterIdentifier
                  ? ['/matters', this.matterIdentifier]
                  : ['/matters'],
              );
            }, 500);
          } else {
            this._toastrNotifiService.displayError(res?.message);
          }
        },
        error: (err: any) => {
          const backendMessage =
            err?.error?.message || err?.error?.title || err?.message;
          this._toastrNotifiService.displayError(
            backendMessage || 'Something went wrong. Please try again.',
          );
        },
      });
  }

  private resetFormData(): void {
    this.formlyModel = {};
    if (this.formly) this.formly.reset();
  }

  ngOnDestroy(): void {
    this._matterService.updateMatter(this.formlyModel);
  }
}
