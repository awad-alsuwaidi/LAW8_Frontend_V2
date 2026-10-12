import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Params, Router } from '@angular/router';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { TabMenuModule } from 'primeng/tabmenu';
import { MenuItem } from 'primeng/api';
import { ToggleFormService } from 'src/app/@shared/modules/formly-config/services/toggle-form.service';
import { SharedConfirmDialogComponent } from 'src/app/@shared/components/shared-confirm-dialog/shared-confirm-dialog.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ApiService } from 'src/app/@core/api/api.service';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { LanguageService, ToastrNotifiService } from 'src/app/@core/services';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { ClientService } from '../../services/client.service';
import { ConfirmDialogType } from 'src/app/@shared/enums/confirm-dialog-type';
import { SharedModule } from 'src/app/@shared/shared.module';
import { PermissionService } from 'src/app/@core/services/permission.service';
import { MenuModule } from 'primeng/menu';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-clients-details',
  standalone: true,
  imports: [
    SharedButtonComponent,
    TabMenuModule,
    SharedModule,
    MenuModule,
    BreadcrumbModule,
  ],
  templateUrl: './clients-details.component.html',
  styleUrl: './clients-details.component.scss',
})
export class ClientsDetailsComponent implements OnInit, OnDestroy {
  _toggleFormService = inject(ToggleFormService);
  _router = inject(Router);
  _route = inject(ActivatedRoute);
  _dialogService = inject(DialogService);
  _apiService = inject(ApiService);
  _unsubscribeService = inject(UnsubscribeService);
  _toastrNotifiService = inject(ToastrNotifiService);
  _clientService = inject(ClientService);
  _languageService = inject(LanguageService);
  _permissionService = inject(PermissionService);

  toggleEdit = true;
  clientIdentifier: string | null = null;
  client: any;

  confirmationRef?: DynamicDialogRef;
  items: MenuItem[] = [];
  activeItem?: MenuItem;
  menuItems: MenuItem[] = [];
    isInhouse = environment.brand === 'inhouse';
  breadcrumbItems: MenuItem[] = [
    {
  label: this._languageService.getTransValue(
    this.isInhouse ? 'clients.entities' : 'clients.clients'
  ),      routerLink: '/clients',
    },
    {
      label: this._languageService.getTransValue('matters.view'),
    },
  ];
  ngOnInit(): void {
    this.getClientTabs();
    this.listenToRouteChanges();
    this.getParams();
    this._clientService.updateRefreshData(false);
  }

  getClientTabs(): void {
    this.items = [
      {
        label: this._languageService.getTransValue('clients.details'),
        command: () => {
          this._router.navigate(['./'], { relativeTo: this._route });
        },
      },
      {
        label: this._languageService.getTransValue('clients.contacts'),
        visible: this._permissionService.hasPermission('View_ClientContact'),
        command: () => {
          this._router.navigate(['./contacts'], { relativeTo: this._route });
          
        },
      },
      {
        label: this._languageService.getTransValue('clients.relatedMatters'),
        command: () => {
          this._router.navigate(['./related-matters'], {
            relativeTo: this._route,
          });
        },
      },
    ];
    this.setActiveTab(this._router.url);
  }

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

  getParams(): void {
    this._route.params.subscribe((params: Params) => {
      if (params['id']) {
        this.clientIdentifier = params['id'];
        this.getData();
      }
    });
  }

  getData(): void {
    this._clientService.client$
      .pipe(this._unsubscribeService.takeUntilDestroy())
      .subscribe({
        next: (res: any) => {
          this.client = res;
          this.setMenuItems();
        },
      });
  }
  setMenuItems() {
    this.menuItems = [
      {
        label: this._languageService.getTransValue(
          this._router.url.includes('inactive')
            ? 'matters.activate'
            : 'matters.deactivate'
        ),
        icon: 'icon-show',
        command: () => {
          this.toggleStatus();
        },
      },
      { separator: true },
      {
        label: 'Edit',
        icon: 'icon-edit',
        visible: !this._router.url.includes('inactive'),
        command: () => {
          this._router.navigate(['/clients/update', this.client.id]);
        },
      },
    ];
  }
  onEdit(): void {
    this.toggleEdit = !this.toggleEdit;
    this._toggleFormService.updateToggleEdit(this.toggleEdit);
  }

  toggleStatus(): void {
    const isInactive = this._router.url.includes('inactive');

    const title = isInactive
      ? this._languageService.getTransValue('clients.activate')
      : this._languageService.getTransValue('clients.deactivate');

    const message = isInactive
      ? this._languageService.getTransValue('clients.activateConfirmation')
      : this._languageService.getTransValue('clients.deactivateConfirmation');

    this.confirmationRef = this._dialogService.open(
      SharedConfirmDialogComponent,
      {
        data: {
          type: isInactive
            ? ConfirmDialogType.Success
            : ConfirmDialogType.Danger,
          title,
          message,
          btns: [
            {
              label: this._languageService.getTransValue('common.cancel'),
              styleClass: 'border border-grey500 text-grey500',
              command: () => this.confirmationRef?.close(),
            },
            {
              label: title,
              styleClass: isInactive
                ? 'bg-primary text-white'
                : 'bg-textErrorBase text-white',
              command: () => this.toggleActivation(),
            },
          ],
        },
      }
    );

    this.confirmationRef.onClose.subscribe({
      next: (res) => {
        if (res) {
          this._clientService.updateRefreshData(true);

          this._router.navigate(['../../'], { relativeTo: this._route });
        }
      },
    });
  }

  toggleActivation(): void {
    const isInactive = this._router.url.includes('inactive');
    const params = {
      clientId: this.clientIdentifier,
      Status: isInactive,
    };

    this._apiService
      .post(API_Config.client.activationClient, {}, params)
      .pipe(this._unsubscribeService.takeUntilDestroy())
      .subscribe((res: ApiRes) => {
        if (res.isSuccess) {
          this.confirmationRef?.close(true);
          this._toastrNotifiService.displaySuccess(res.message);
        }
      });
  }
  ngOnDestroy(): void {
    this._unsubscribeService.destroy();
  }
}
