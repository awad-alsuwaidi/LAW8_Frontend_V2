import { Component, effect, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { TabMenuModule } from 'primeng/tabmenu';
import { MatterService } from '../../services/matter.service';
import { filter } from 'rxjs';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { PracticeArea } from '../../enums/matter-practicearea';
import { PermissionService } from 'src/app/@core/services/permission.service';
import { SharedModule } from 'src/app/@shared/shared.module';
import { LanguageService } from 'src/app/@core/services';

@Component({
  selector: 'app-matter-editor',
  standalone: true,
  imports: [TabMenuModule, SharedModule],
  templateUrl: './matter-editor.component.html',
  styleUrl: './matter-editor.component.scss',
})
export class MatterEditorComponent implements OnInit, OnDestroy {
  _router = inject(Router);
  _route = inject(ActivatedRoute);
  _matterService = inject(MatterService);
  _unsubscribe = inject(UnsubscribeService);
  _permissionService = inject(PermissionService);
  _languageService = inject(LanguageService);

  practiceArea = PracticeArea;
  tabs: MenuItem[] = [];
  activeItem!: MenuItem;

  refreshCurrentTab = effect(() => {
    if (this._matterService.getRefreshCurrentTab()) {
      this.updateActiveTab();
    }
    if (this._matterService.getMatter()) {
      this.setTabs();
    }
  });

  ngOnInit() {
    console.log('Matter:', this._matterService.getMatter());
    this._router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        this._unsubscribe.takeUntilDestroy(),
      )
      .subscribe(() => {
        this.updateActiveTab();
      });
  }

  private get effectivePracticeAreaId(): number | undefined {
    const matter = this._matterService.getMatter();
    if (!matter) return undefined;

    const practsAreaId = matter.practsAreaId;

    if (practsAreaId === this.practiceArea.IntelecturualProperty) {
      return this.practiceArea.IntelecturualProperty;
    }
    if (matter.isLitigation) {
      return this.practiceArea.Litigation;
    }
    return this.practiceArea.Corporate;
  }

  setTabs() {
    const matter = this._matterService.getMatter();
    const practsAreaId = this.effectivePracticeAreaId;

    if (practsAreaId == null) {
      return;
    }

    this.tabs = [
      {
        label: this._languageService.getTransValue('matters.details'),
        route: '',
        command: () => {
          this._router.navigate(['./'], { relativeTo: this._route });
        },
      },
      {
        label: this._languageService.getTransValue('matters.parties'),
        route: 'parties',

        visible:
          ![
            this.practiceArea.Corporate,
            this.practiceArea.IntelecturualProperty,
          ].includes(practsAreaId || 0) &&
          this._permissionService.hasPermission('View_Matter_Parties'),
        command: () => {
          this._router.navigate(['./parties'], { relativeTo: this._route });
        },
      },
      {
        label: this._languageService.getTransValue('matters.attachments'),
        route: 'attachments',

        visible: false,
        command: () => {
          this._router.navigate(['./attachments'], {
            relativeTo: this._route,
          });
        },
      },
      {
        label: this._languageService.getTransValue('matters.relatedmatters'),
        route: 'relatedmatters',

        visible: false,
        command: () => {
          this._router.navigate(['./related-matters'], {
            relativeTo: this._route,
          });
        },
      },
      {
        label: this._languageService.getTransValue('matters.activities'),
        route: 'activities',

        visible: false,
        command: () => {
          this._router.navigate(['./activities'], {
            relativeTo: this._route,
          });
        },
      },
      {
        label: this._languageService.getTransValue('matters.applicant'),
        route: 'applicant',

        visible:
          practsAreaId === this.practiceArea.IntelecturualProperty &&
          this._permissionService.hasPermission('View_Matter_Applicants'),
        command: () => {
          this._router.navigate(['./applicant'], { relativeTo: this._route });
        },
      },
      {
        label: this._languageService.getTransValue('matters.class'),
        route: 'class',

        visible:
          ![this.practiceArea.Litigation, this.practiceArea.Corporate].includes(
            practsAreaId || 0,
          ) &&
          matter.law_MtrCatId == 8 &&
          this._permissionService.hasPermission('View_Matter_Classes'),
        command: () => {
          this._router.navigate(['./class'], { relativeTo: this._route });
        },
      },
      {
        label: this._languageService.getTransValue('matters.billing'),
        route: 'billing',

        visible: true,
        command: () => {
          this._router.navigate(['./billing'], { relativeTo: this._route });
        },
      },
    ];

    this.updateActiveTab();
  }

  // setTabs() {
  //   if (this._matterService.getMatter().practsAreaId) {
  //     this.tabs = [
  //       {
  //         label: this._languageService.getTransValue('matters.details'),
  //         command: () => {
  //           this._router.navigate(['./'], { relativeTo: this._route });
  //         },
  //       },
  //       {
  //         label: this._languageService.getTransValue('matters.parties'),
  //         visible:
  //           ![
  //             this.practiceArea.Corporate,
  //             this.practiceArea.IntelecturualProperty,
  //           ].includes(this._matterService.getMatter().practsAreaId || 0) &&
  //           this._permissionService.hasPermission('View_Matter_Parties'),
  //         command: () => {
  //           this._router.navigate(['./parties'], { relativeTo: this._route });
  //         },
  //       },

  //       {
  //         label: this._languageService.getTransValue('matters.attachments'),
  //         visible: false,
  //         command: () => {
  //           this._router.navigate(['./attachments'], {
  //             relativeTo: this._route,
  //           });
  //         },
  //       },
  //       // {
  //       //   label: this._languageService.getTransValue('matters.contacts'),
  //       //   visible:
  //       //     //   اخر تعديلات
  //       //    ( this._matterService.getMatter().practsAreaId ==
  //       //     this.practiceArea.Litigation ||
  //       //     this._matterService.getMatter().practsAreaId ==
  //       //       this.practiceArea.Corporate) &&
  //       //     this._permissionService.hasPermission('View_Matter_Contacts'),
  //       //   command: () => {
  //       //     this._router.navigate(['./contacts'], { relativeTo: this._route });
  //       //   },
  //       // },
  //       {
  //         label: this._languageService.getTransValue('matters.relatedmatters'),
  //         visible: false,
  //         command: () => {
  //           this._router.navigate(['./related-matters'], {
  //             relativeTo: this._route,
  //           });
  //         },
  //       },
  //       // {
  //       //   label: this._languageService.getTransValue('matters.billing'),
  //       //   visible: false,
  //       //   command: () => {
  //       //     this._router.navigate(['./billing'], { relativeTo: this._route })
  //       //   }
  //       // },
  //       {
  //         label: this._languageService.getTransValue('matters.activities'),
  //         visible: false,
  //         command: () => {
  //           this._router.navigate(['./activities'], {
  //             relativeTo: this._route,
  //           });
  //         },
  //       },

  //       {
  //         label: this._languageService.getTransValue('matters.applicant'),
  //         visible:
  //           this._matterService.getMatter().practsAreaId ==
  //             this.practiceArea.IntelecturualProperty &&
  //           this._permissionService.hasPermission('View_Matter_Applicants'),
  //         command: () => {
  //           this._router.navigate(['./applicant'], { relativeTo: this._route });
  //         },
  //       },

  //       {
  //         label: this._languageService.getTransValue('matters.class'),
  //         visible:
  //           ![
  //             this.practiceArea.Litigation,
  //             this.practiceArea.Corporate,
  //           ].includes(this._matterService.getMatter().practsAreaId || 0) &&
  //           this._matterService.getMatter().law_MtrCatId == 8 &&
  //           this._permissionService.hasPermission('View_Matter_Classes'),
  //         command: () => {
  //           this._router.navigate(['./class'], { relativeTo: this._route });
  //         },
  //       },
  //       {
  //         label: this._languageService.getTransValue('matters.billing'),
  //         visible: true,
  //         //  ( ![this.practiceArea.Litigation, this.practiceArea.Corporate].includes(this._matterService.getMatter().practsAreaId || 0) &&
  //         //   this._matterService.getMatter().law_MtrCatId == 8) &&
  //         //   this._permissionService.hasPermission('View_Matter_Classes'),
  //         command: () => {
  //           this._router.navigate(['./billing'], { relativeTo: this._route });
  //         },
  //       },
  //     ];
  //     this.updateActiveTab();
  //   }
  // }

  updateActiveTab() {
    const childPath = this._route.firstChild?.snapshot.url[0]?.path || '';
    this.activeItem =
      this.tabs.find((tab) => tab['route'] === childPath) || this.tabs[0];
  }

  ngOnDestroy(): void {
    this._unsubscribe.destroy();
    this._matterService.updateMatter({});
  }
}
