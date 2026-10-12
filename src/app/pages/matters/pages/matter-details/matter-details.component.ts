import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
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
export class MatterDetailsComponent implements OnInit, OnDestroy {
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
    this.getMatterById();
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
    this.activeItem =
      this.tabs.find((obj) =>
        this._router.url.includes(
          obj?.label?.replace(' ', '-').toLocaleLowerCase() || '',
        ),
      ) || this.tabs[0];
    this.getMatterById();
    console.log('current route', this._router.url);
    document.body.classList.add('page-matter');
  }

  // setTabsBasedOnPracticeArea() {
  //   this.tabs = [
  //     {
  //       label: this._languageService.getTransValue('matters.details'),
  //       //label: 'Details',
  //       command: () => {
  //         this._router.navigate(['./'], { relativeTo: this._route });
  //       },
  //     },
  //     {
  //       label: this._languageService.getTransValue('matters.parties'),
  //       //label: 'Parties',
  //       visible:
  //         this.data.practsAreaId == this.practiceArea.Litigation &&
  //         this._permissionService.hasPermission('View_Matter_Parties'),
  //       command: () => {
  //         this._router.navigate(['./parties'], { relativeTo: this._route });
  //       },
  //     },
  //     {
  //       label: this._languageService.getTransValue('matters.applicant'),
  //       //label: 'Applicant',
  //       visible:
  //         ![this.practiceArea.Litigation, this.practiceArea.Corporate].includes(
  //           this.data.practsAreaId || 0
  //         ) && this._permissionService.hasPermission('View_Matter_Applicants'),
  //       command: () => {
  //         this._router.navigate(['./applicant'], { relativeTo: this._route });
  //       },
  //     },
  //      {
  //       label: this._languageService.getTransValue('matters.class'),
  //       //label: 'Class',
  //       visible:
  //         ![this.practiceArea.Litigation, this.practiceArea.Corporate].includes(
  //           this.data.practsAreaId || 0
  //         ) &&
  //         this.data.law_MtrCatId == 8 &&
  //         this._permissionService.hasPermission('View_Matter_Classes'),
  //       command: () => {
  //         this._router.navigate(['./class'], { relativeTo: this._route });
  //       },
  //     },
  //     {
  //       label: this._languageService.getTransValue('matters.activities'),
  //       //label: 'Activities',
  //       visible: this._permissionService.hasPermission('View_TaskManagement'),
  //       command: () => {
  //         this._router.navigate(['./activities'], { relativeTo: this._route });
  //       },
  //     },
  //     {
  //       label: this._languageService.getTransValue('matters.tasks'),
  //       //label: 'Tasks',
  //       visible: this._permissionService.hasPermission('View_TaskManagement'),
  //       command: () => {
  //         this._router.navigate(['./tasks'], { relativeTo: this._route });
  //       },
  //     },
  //     {
  //       label: this._languageService.getTransValue('matters.attachments'),
  //       //label: 'Attachments',
  //       visible: this._permissionService.hasPermission('Add_Matter_Documents'),
  //       command: () => {
  //         this._router.navigate(['./attachments'], { relativeTo: this._route });
  //       },
  //     },
  //     {
  //       label: this._languageService.getTransValue('matters.contacts'),
  //       //label: 'Contacts',
  //       visible:
  //         (this.data.practsAreaId == this.practiceArea.Litigation ||
  //           this.data.practsAreaId == this.practiceArea.Corporate) &&
  //         this._permissionService.hasPermission('View_Matter_Contacts'),
  //       command: () => {
  //         this._router.navigate(['./contacts'], { relativeTo: this._route });
  //       },
  //     },
  //     {
  //       label: this._languageService.getTransValue('matters.relatedmatters'),
  //       //label: 'Related matters',
  //       visible: this._permissionService.hasPermission('View_Matter'),
  //       command: () => {
  //         this._router.navigate(['./related-matters'], {
  //           relativeTo: this._route,
  //         });
  //       },
  //     },
  //     {
  //       label: this._languageService.getTransValue('matters.billing'),
  //       //label: 'Billing',
  //       visible:
  //         false &&
  //         this._permissionService.hasPermission('View_Billing_Settings'),
  //       command: () => {
  //         this._router.navigate(['./billing'], { relativeTo: this._route });
  //       },
  //     },

  //     // {
  //     //   label: this._languageService.getTransValue('matters.activities'),
  //     //   //label: 'Activities',
  //     //   visible: this._permissionService.hasPermission('View_TaskManagement'),
  //     //   command: () => {
  //     //     this._router.navigate(['./activities'], { relativeTo: this._route })
  //     //   }
  //     // },
  //     // {
  //     //   label: this._languageService.getTransValue('matters.tasks'),
  //     //   //label: 'Tasks',
  //     //   visible: this._permissionService.hasPermission('View_Law_Matter_Tasks'),
  //     //   command: () => {
  //     //     this._router.navigate(['./tasks'], { relativeTo: this._route })
  //     //   }
  //     // },
  //     {
  //       label: this._languageService.getTransValue('matters.timesheet'),
  //       //label: 'Timesheet',
  //       visible: this._permissionService.hasPermission('View_Matter_Timesheet'),
  //       command: () => {
  //         this._router.navigate(['./timesheet'], { relativeTo: this._route });
  //       },
  //     },
  //     {
  //       label: this._languageService.getTransValue('matters.invoice'),
  //       //label: 'Invoice',
  //       visible: this._permissionService.hasPermission('View_Matter_Invoices'),
  //       command: () => {
  //         this._router.navigate(['./invoice'], { relativeTo: this._route });
  //       },
  //     },

  //     // {
  //     //   label: this._languageService.getTransValue('matters.applicant'),
  //     //   //label: 'Applicant',
  //     //   visible:
  //     //     (![this.practiceArea.Litigation, this.practiceArea.Corporate].includes(this.data.practsAreaId || 0)) &&
  //     //     this._permissionService.hasPermission('View_Matter_Applicants')
  //     //   ,
  //     //   command: () => {
  //     //     this._router.navigate(['./applicant'], { relativeTo: this._route })
  //     //   }
  //     // },
  //     {
  //       label: this._languageService.getTransValue('matters.billing'),
  //       visible: this._permissionService.hasPermission('View_Billing_Settings'),
  //       command: () => {
  //         this._router.navigate(['./billing'], { relativeTo: this._route });
  //       },
  //     },
  //   ];
  // }

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
      {
        label: this._languageService.getTransValue('matters.invoice'),
        routerLink: 'invoice',
        visible: this._permissionService.hasPermission('View_Matter_Invoices'),
      },
      {
        label: this._languageService.getTransValue('matters.billing'),
        routerLink: 'billing',
        visible: this._permissionService.hasPermission('View_Billing_Settings'),
      },
    ];
  }

  getMatterById() {
    this.isLoading = true;
    const params = {
      id: this.matterIdentifier,
      LoadFile: false,
    };

    this._apiService
      .get(API_Config.matters.getById, params)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          this.isLoading = false;
          if (res && res.isSuccess) {
            this.data = res.result;
            this.isImportant = this.data.isImportent;
            this._matterService.updateMatterDetails(this.data);
            this.setTabsBasedOnPracticeArea();

            if (this.tabs && this.tabs.length > 0 && this.tabs[0]?.label) {
              const currentTabLabel =
                this._router.url.split('/').pop()?.replace('-', ' ') || '';

              const matchedTab = this.tabs.find(
                (tab) => tab.label?.toLowerCase() === currentTabLabel,
              );
              console.log('matchedTab', matchedTab);
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
                              this._languageService.getTransValue(
                                'matters.yes',
                              ),
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
          }
        },
      });
  }

  hasPermission(permission?: string): boolean {
    if (!permission) return true;
    return this._permissionService.hasPermission(permission);
  }

  toggleMatter(payload: { matterId: number; isActive: boolean }) {
    this._apiService
      .post(API_Config.matters.deactiveMatter, payload)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res && res.isSuccess) {
            this._toastrNotifiService.displaySuccess(res.message);
            this._router.navigate(['/matters']);
          }
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
