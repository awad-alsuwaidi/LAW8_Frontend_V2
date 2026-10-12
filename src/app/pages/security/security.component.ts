import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { TabMenuModule } from 'primeng/tabmenu';
import { filter } from 'rxjs';
import { LanguageService } from 'src/app/@core/services';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { PermissionService } from 'src/app/@core/services/permission.service';

interface MyMenuItem extends MenuItem {
  requiredPermission?: string;
}

@Component({
  selector: 'app-security',
  standalone: true,
  imports: [
    TabMenuModule,
    TranslateModule
  ],
  templateUrl: './security.component.html',
  styleUrl: './security.component.scss'
})
export class SecurityComponent implements OnInit, OnDestroy {

  _languageService = inject(LanguageService);
  _router = inject(Router);
  _route = inject(ActivatedRoute);
  _unsubscribe = inject(UnsubscribeService);
  _permissionService = inject(PermissionService);

  tabs: MyMenuItem[] = [
    {
      label: this._languageService.getTransValue('Users'),
      command: () => this._router.navigate(['./users'], { relativeTo: this._route }),
      requiredPermission: 'View_Security_Users'
    },
    {
      label: this._languageService.getTransValue('Groups'),
      command: () => this._router.navigate(['./groups'], { relativeTo: this._route }),
      requiredPermission: 'View_Security_Groups'
    },
    {
      label: this._languageService.getTransValue('Calendar'),
      command: () => this._router.navigate(['./calendar'], { relativeTo: this._route }),
      requiredPermission: 'View_Security_Calendar'
    },
    {
      label: this._languageService.getTransValue('Timesheet'),
      command: () => this._router.navigate(['./timesheet'], { relativeTo: this._route }),
      requiredPermission: 'View_Security_Timesheet'
    },
    {
      label: this._languageService.getTransValue('Matter'),
      command: () => this._router.navigate(['./matter'], { relativeTo: this._route }),
      requiredPermission: 'View_Security_MatterAccess'
    },
  ];

  activeItem!: MyMenuItem;

  get visibleTabs(): MyMenuItem[] {
    return this.tabs.filter(tab =>
      !tab.requiredPermission || this._permissionService.hasPermission(tab.requiredPermission)
    );
  }

  ngOnInit(): void {
    this.updateActiveTab();
  }

  updateActiveTab() {
    this.activeItem =
      this.visibleTabs.find(obj =>
        this._router.url.includes(obj?.label?.replace(' ', '-').toLowerCase() || '')
      ) || this.visibleTabs[0];

    this._router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      this._unsubscribe.takeUntilDestroy()
    ).subscribe((event: any) => {
      this.activeItem =
        this.visibleTabs.find(obj =>
          event.url.includes(obj?.label?.replace(' ', '-').toLowerCase() || '')
        ) || this.visibleTabs[0];
    });
  }

  ngOnDestroy(): void {
    this._unsubscribe.destroy();
  }
}
