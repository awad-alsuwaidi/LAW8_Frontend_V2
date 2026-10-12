import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { TabMenuModule } from 'primeng/tabmenu';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiService } from 'src/app/@core/api/api.service';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { SharedModule } from 'src/app/@shared/shared.module';
import { UserDetailsDto } from '../interfaces/user-details.interface';
import { LanguageService } from 'src/app/@core/services';
import { UserDetailsService } from './services/user-details.service';
import { UsersToggleViewComponent } from '../../users/components/users-toggle-view/users-toggle-view.component';
import { PermissionService } from 'src/app/@core/services/permission.service';

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [SharedModule, TabMenuModule, UsersToggleViewComponent],
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.scss',
})
export class UserDetailsComponent implements OnInit, OnDestroy {
  protected _router = inject(Router);
  private _route = inject(ActivatedRoute);
  protected _languageService = inject(LanguageService);
  private _apiService = inject(ApiService);
  private _unsubscribe = inject(UnsubscribeService);
  private _userDetailsService = inject(UserDetailsService);
  protected items: MenuItem[] = [];
  protected activeItem?: MenuItem;
  @Input() set userIdentifier(value: string) {
    this.getUser(value);
  }
  user?: UserDetailsDto;
  ngOnInit(): void {
    this.getTabs();
    this.listenToRouteChanges();
    this.setActiveTab(this._router.url);
  }
  getTabs(): void {
    this.items = [
      {
        label: this._languageService.getTransValue('users.details'),
        command: () => {
          this._router.navigate(['./'], { relativeTo: this._route });
        },
      },
      {
        label: this._languageService.getTransValue('common.clients'),
        visible: this._permissionService.hasPermission('Tab_Clint_Portal'),
        command: () => {
          this._router.navigate(['./clients'], { relativeTo: this._route });
        },
      },
      {
        label: this._languageService.getTransValue('common.matters'),
        visible: this._permissionService.hasPermission('Tap_matter_Portal'),
        command: () => {
          this._router.navigate(['./matters'], { relativeTo: this._route });
        },
      },
    ];
  }
  _permissionService = inject(PermissionService);

  listenToRouteChanges(): void {
    this._router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.setActiveTab(event.url);
      }
    });
  }

  setActiveTab(currentUrl: string): void {
    const normalizedUrl = currentUrl.toLocaleLowerCase();
    this.activeItem =
      this.items.find((tab) =>
        normalizedUrl.includes(
          (tab.label ?? '').replace(' ', '-').toLocaleLowerCase()
        )
      ) || this.items[0];
  }
  getUser(userIdentifier: string) {
    if (!userIdentifier) return;
    const params = { id: userIdentifier };
    this._apiService
      .get(API_Config.users.getById, params)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res.result && res.isSuccess) {
            this.user = { ...res.result };
            this._userDetailsService.updateUserData(this.user);
          }
        },
      });
  }

  ngOnDestroy(): void {
    this._unsubscribe.destroy();
  }
}
