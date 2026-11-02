import {
  Component,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { SharedModule } from 'src/app/@shared/shared.module';
import { TabMenuModule } from 'primeng/tabmenu';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/@core/api/api.service';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { MenuModule } from 'primeng/menu';
import { PracticeArea } from '../../enums/matter-practicearea';
import { DialogService } from 'primeng/dynamicdialog';
import { SharedConfirmDialogComponent } from 'src/app/@shared/components/shared-confirm-dialog/shared-confirm-dialog.component';
import { ConfirmDialogType } from 'src/app/@shared/enums/confirm-dialog-type';
import { LanguageService, ToastrNotifiService } from 'src/app/@core/services';
import { PermissionService } from 'src/app/@core/services/permission.service';
import { SharedBreadcrumbComponent } from 'src/app/@shared/components/shared-breadcrumb/shared-breadcrumb.component';
import { MatterService } from '../../services/matter.service';

@Component({
  selector: 'app-matter-details',
  standalone: true,
  imports: [
    BreadcrumbModule,
    SharedButtonComponent,
    SharedModule,
    TabMenuModule,
    MenuModule,
    SharedBreadcrumbComponent,
  ],
  templateUrl: './matter-details.component.html',
  styleUrl: './matter-details.component.scss',
})
export class MatterDetailsComponent implements OnInit, OnDestroy, OnChanges {
  _languageService = inject(LanguageService);
  isLoading: boolean = true;
  _router = inject(Router);
  _route = inject(ActivatedRoute);
  _apiService = inject(ApiService);
  _unsubscribe = inject(UnsubscribeService);
  _dialogService = inject(DialogService);
  _toastrNotifiService = inject(ToastrNotifiService);
  _permissionService = inject(PermissionService);
  _matterService = inject(MatterService);
  isImportant = false;
  items: MenuItem[] | undefined;
  data: any;
  tabs: MenuItem[] = [];
  activeItem?: MenuItem;
  @Input() set id(value: number) {
    this.matterIdentifier = value;
  }
  menuItems: MenuItem[] = [];
  matterIdentifier: any;
  practiceArea = PracticeArea;
  ngOnInit() {
    this.items = [
      {
        label: this._languageService.getTransValue('matters.matters'),
        routerLink: '/matters',
      },
      {
        label: this._languageService.getTransValue('matters.view'),
      },
    ];
    document.body.classList.add('page-matter');

    this._route.params
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe((params) => {
        const idFromRoute = params['id'];
        console.log(
          '[MatterDetails] route params =',
          params,
          '| id =',
          idFromRoute,
        );
        if (idFromRoute) {
          this.matterIdentifier = idFromRoute;
          this.getMatterById();
        }
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes['id'] &&
      changes['id'].currentValue &&
      !this._route.snapshot.params['id']
    ) {
      console.log('[MatterDetails] input id =', changes['id'].currentValue);
      this.matterIdentifier = changes['id'].currentValue;
      this.getMatterById();
    }
  }

  setTabsBasedOnPracticeArea() {
    this.tabs = [
      {
        label: this._languageService.getTransValue('matters.details'),
        routerLink: 'details',
      },
      {
        label: this._languageService.getTransValue('matters.parties'),
        routerLink: 'parties',
        visible:
          this.data.practsAreaId == this.practiceArea.Litigation &&
          this._permissionService.hasPermission('View_Matter_Parties'),
      },
      {
        label: this._languageService.getTransValue('matters.applicant'),
        routerLink: 'applicant',
        visible:
          ![this.practiceArea.Litigation, this.practiceArea.Corporate].includes(
            this.data.practsAreaId || 0,
          ) && this._permissionService.hasPermission('View_Matter_Applicants'),
      },
      {
        label: this._languageService.getTransValue('matters.class'),
        routerLink: 'class',
        visible:
          ![this.practiceArea.Litigation, this.practiceArea.Corporate].includes(
            this.data.practsAreaId || 0,
          ) &&
          this.data.law_MtrCatId == 8 &&
          this._permissionService.hasPermission('View_Matter_Classes'),
      },
      {
        label: this._languageService.getTransValue('matters.activities'),
        routerLink: 'activities',
        visible: this._permissionService.hasPermission('View_TaskManagement'),
      },
      {
        label: this._languageService.getTransValue('matters.tasks'),
        routerLink: 'tasks',
        visible: this._permissionService.hasPermission('View_TaskManagement'),
      },
      {
        label: this._languageService.getTransValue('matters.attachments'),
        routerLink: 'attachments',
        visible: this._permissionService.hasPermission('Add_Matter_Documents'),
      },
      {
        label: this._languageService.getTransValue('matters.contacts'),
        routerLink: 'contacts',
        visible:
          (this.data.practsAreaId == this.practiceArea.Litigation ||
            this.data.practsAreaId == this.practiceArea.Corporate) &&
          this._permissionService.hasPermission('View_Matter_Contacts'),
      },
      {
        label: this._languageService.getTransValue('matters.relatedmatters'),
        routerLink: 'related-matters',
        visible: this._permissionService.hasPermission('View_Matter'),
      },
      {
        label: this._languageService.getTransValue('matters.timesheet'),
        routerLink: 'timesheet',
        visible: this._permissionService.hasPermission('View_Matter_Timesheet'),
      },
      // {
      //   label: this._languageService.getTransValue('matters.invoice'),
      //   routerLink: 'invoice',
      //   visible: this._permissionService.hasPermission('View_Matter_Invoices'),
      // },
      // {
      //   label: this._languageService.getTransValue('matters.billing'),
      //   routerLink: 'billing',
      //   visible: this._permissionService.hasPermission('View_Billing_Settings'),
      // },
    ];
  }

  getMatterById() {
    this.isLoading = true;

    const baseUrl = API_Config.matters.getById;
    const url = baseUrl.includes('{id}')
      ? baseUrl.replace('{id}', String(this.matterIdentifier))
      : `${baseUrl.replace(/\/+$/, '')}/${this.matterIdentifier}`;

    console.log('FINAL URL =', url);

    this._apiService
      .get(url, { LoadFile: false })
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: any) => {
          console.log('🟢 RAW RESPONSE =', res);
          this.isLoading = false;
          const body = res?.data ?? res?.result ?? res;
          const success = res?.success !== false && res?.isSuccess !== false;

          if (!success) {
            console.warn(' success flag is false', res);
            return;
          }

          const rawData = Array.isArray(body?.items)
            ? body.items[0]
            : Array.isArray(body?.dataList)
              ? body.dataList[0]
              : body;

          if (!rawData || typeof rawData !== 'object' || !rawData.id) {
            console.warn('rawData is not a matter object', rawData);
            return;
          }
          this.data = {
            ...rawData,
            mtrNo: rawData.matterCode,
            client: rawData.clientName,
            law_Branch: rawData.branchName,
            practsArea: rawData.practiceAreaName,
            practsAreaId: rawData.practiceAreaId,
            law_MtrCat: rawData.matterCategoryName,
            law_MtrCatId: rawData.matterCategoryId,
            mtrType: rawData.matterTypeName,
            jurisdiction: rawData.jurisdictionName,
            judicature: rawData.judicatureName,
            stage: rawData.stageName,
            status: rawData.statusName,
            law_ResponsibleLaywer: rawData.responsibleLawyerName,
            law_AssignedLaywerList: rawData.assignedLawyers || [],
            law_OtherStaffList: rawData.otherStaff || [],
            law_ClientIntroducing: rawData.clientIntroducingUserName,
            law_MatterIntroducingLawyer: rawData.matterIntroducingLawyerName,
            law_ReferralType: rawData.referralTypeName,
            logoFilePath: rawData.trademarkLogoUrl,
            tradmarkTypeId: rawData.trademarkTypeId,
            isImportent: rawData.isImportantForMe,
          };

          console.log('✅ FINAL DATA =', this.data);

          this.isImportant = this.data.isImportent;
          this._matterService.updateMatterDetails(this.data);
          this.setTabsBasedOnPracticeArea();
          if (this.tabs && this.tabs.length > 0 && this.tabs[0]?.label) {
            const currentTabLabel =
              this._router.url.split('/').pop()?.replace('-', ' ') || '';

            const matchedTab = this.tabs.find(
              (tab) => tab.label?.toLowerCase() === currentTabLabel,
            );
            if (matchedTab) {
              this.activeItem = matchedTab;
            } else {
              this.activeItem = this.tabs[0];
              if (this.tabs[0].label) {
                this._router.navigate(
                  [
                    './' +
                      this.tabs[0].label.toLowerCase().replace(/\s+/g, '-'),
                  ],
                  { relativeTo: this._route },
                );
              }
            }
          }
          const isActive = this.data.isActive;
          this.menuItems = [
            {
              label: isActive
                ? this._languageService.getTransValue('matters.deactivate')
                : this._languageService.getTransValue('matters.activate'),
              permission: 'Deactivate_Matter',
              command: () => {
                const confirmRef = this._dialogService.open(
                  SharedConfirmDialogComponent,
                  {
                    data: {
                      type: ConfirmDialogType.Question,
                      title: this._languageService.getTransValue(
                        isActive
                          ? 'matters.confirmDeactivationTitle'
                          : 'matters.confirmActivationTitle',
                      ),
                      message: this._languageService.getTransValue(
                        isActive
                          ? 'matters.confirmDeactivationMessage'
                          : 'matters.confirmActivationMessage',
                      ),
                      btns: [
                        {
                          label:
                            this._languageService.getTransValue('matters.no'),
                          styleClass: 'border border-grey500 text-grey500',
                          command: () => {
                            confirmRef.close();
                          },
                        },
                        {
                          label:
                            this._languageService.getTransValue('matters.yes'),
                          styleClass: 'bg-textErrorBase text-white',
                          command: () => {
                            confirmRef.close(true);
                          },
                        },
                      ],
                    },
                  },
                );

                confirmRef.onClose
                  .pipe(this._unsubscribe.takeUntilDestroy())
                  .subscribe({
                    next: (res: boolean) => {
                      if (res) {
                        this.toggleMatter({
                          matterId: +this.matterIdentifier,
                          isActive: !isActive,
                        });
                      }
                    },
                  });
              },
            },
          ];
        },
        error: (err) => {
          this.isLoading = false;
        },
      });
  }

  hasPermission(permission?: string): boolean {
    if (!permission) return true;
    return this._permissionService.hasPermission(permission);
  }

  toggleMatter(payload: { matterId: number; isActive: boolean }) {
    let path = API_Config.matters.deactiveMatter;
    if (path.includes('{id}')) {
      path = path.replace('{id}', String(payload.matterId));
    }

    this._apiService
      .patch(path, { isActive: payload.isActive })
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          const ok =
            (res as any)?.success === true || (res as any)?.isSuccess === true;
          if (ok) {
            this._toastrNotifiService.displaySuccess(res.message);
            this._router.navigate(['/matters']);
          } else {
            this._toastrNotifiService.displayError(
              res?.message || 'Failed to toggle status',
            );
          }
        },
        error: (err: any) => {
          this._toastrNotifiService.displayError(
            err?.error?.message || 'Something went wrong',
          );
        },
      });
  }

  toggleImportant() {
    const oldValue = this.isImportant;
    this.isImportant = !this.isImportant;

    this._apiService
      .post(API_Config.matters.importentMatter, null, {
        matterId: this.matterIdentifier,
      })
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res?.isSuccess) {
            this.data.isImportent = this.isImportant;

            this._toastrNotifiService.displaySuccess(
              this.isImportant
                ? 'Added to favorites'
                : 'Removed from favorites',
            );
          } else {
            this.isImportant = oldValue;
          }
        },
        error: () => {
          this.isImportant = oldValue;
        },
      });
  }

  ngOnDestroy(): void {
    this._unsubscribe.destroy();
    document.body.classList.remove('page-matter');
  }
}
