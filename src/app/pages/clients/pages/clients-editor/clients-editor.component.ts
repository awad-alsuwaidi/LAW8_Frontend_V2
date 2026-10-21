import { Component, effect, inject, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { ClientsEditorAddressComponent } from './pages/clients-editor-address/clients-editor-address.component';
import { ClientsEditorContactComponent } from './pages/clients-editor-contact/clients-editor-contact.component';
import { ClientsEditorMainInfoComponent } from './pages/clients-editor-main-info/clients-editor-main-info.component';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToggleFormService } from 'src/app/@shared/modules/formly-config/services/toggle-form.service';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { ActivatedRoute, Params, Router, RouterModule } from '@angular/router';
import { FormlyFormOptions } from '@ngx-formly/core';
import { finalize } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { ApiService } from 'src/app/@core/api/api.service';
import { LanguageService, ToastrNotifiService } from 'src/app/@core/services';
import { ClientService } from '../../services/client.service';
import { DialogService } from 'primeng/dynamicdialog';
import { SharedConfirmDialogComponent } from 'src/app/@shared/components/shared-confirm-dialog/shared-confirm-dialog.component';
import { ConfirmDialogType } from 'src/app/@shared/enums/confirm-dialog-type';
import { PermissionService } from 'src/app/@core/services/permission.service';

@Component({
  selector: 'app-clients-editor',
  standalone: true,
  imports: [
    SharedButtonComponent,
    TranslateModule,
    ClientsEditorAddressComponent,
    ClientsEditorMainInfoComponent,
    ClientsEditorContactComponent,
    ReactiveFormsModule,
    FormsModule,
    FormlyConfigModule,
    RouterModule,
  ],
  templateUrl: './clients-editor.component.html',
  styleUrl: './clients-editor.component.scss',
})
export class ClientsEditorComponent implements OnInit {
  _languageService = inject(LanguageService);
  _permissionService = inject(PermissionService);
  _toggleFormService = inject(ToggleFormService);
  _router = inject(Router);
  _route = inject(ActivatedRoute);
  _unsubscribe = inject(UnsubscribeService);
  _apiService = inject(ApiService);
  _toastrNotifiService = inject(ToastrNotifiService);
  _dialogService = inject(DialogService);
  _clientService = inject(ClientService);
  isLoading!: boolean;
  formlyModel: any;
  formlyOptions: FormlyFormOptions = {};
  formly: FormGroup = new FormGroup({});
  clientIdentifier: any;
  toggleEditEffect = effect(() => {
    if (
      this._router.url.includes('view') ||
      this._router.url.includes('details')
    ) {
      this.formlyOptions.formState.readonly =
        this._toggleFormService.getToggleEdit();
    }
  });
  ngOnInit(): void {
    if (!this._router.url.includes('add')) {
      this.getParams();
    }
  }
  getParams() {
    this._route.params
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe((params: Params) => {
        this.clientIdentifier = params['id'] || 1;
        this.setFormData();
      });
  }

  setFormData() {
    this._apiService
      .get(`${API_Config.client.getById}/${this.clientIdentifier}`)
      .pipe(
        finalize(() => (this.isLoading = false)),
        this._unsubscribe.takeUntilDestroy(),
      )
      .subscribe({
        next: (res: any) => {
          const data = res?.data ?? res?.result ?? res;
          if (data) {
            this.formlyModel = {
              ...data,
              email: data.contact?.email ?? '',
              email2: data.contact?.email2 ?? '',
              phone1: data.contact?.phone1 ?? '',
              phone2: data.contact?.phone2 ?? '',
              mobile1: data.contact?.mobile1 ?? '',
              mobile2: data.contact?.mobile2 ?? '',
              addressLine1: data.address?.line1 ?? '',
              city: data.address?.city ?? '',
              state: data.address?.state ?? '',
              zipCode: data.address?.zipCode ?? '',
              countryId: data.address?.countryId ?? null,
              countryName: data.address?.countryName ?? null,
              image: data.profileImagePath ?? null,
            };
            this._clientService.client$.next(this.formlyModel);
          }
        },
      });
  }

  onSubmit() {
    if (this.formly.invalid) {
      this.formly.markAllAsTouched();
      return;
    }
    this.isLoading = true;

    const v = this.formly.value;
    const m = this.formlyModel;

    const clientCode =
      m?.clientCode ||
      v.clientCode ||
      this._clientService.getClientCode() ||
      '';
    const formData = new FormData();
    formData.append('nameEn', v.nameEn ?? m?.nameEn ?? '');
    formData.append('nameAr', v.nameAr ?? m?.nameAr ?? '');
    formData.append('clientCode', clientCode);
    formData.append('notes', v.notes ?? '');
    formData.append('isActive', String(v.isActive ?? true));

    if (v.introducingLawyer) {
      formData.append('introducingLawyer', v.introducingLawyer);
    }
    if (v.clientGroupId) {
      formData.append('clientGroupId', String(v.clientGroupId));
    }
    if (v.clientTypeId) {
      formData.append('clientTypeId', String(v.clientTypeId));
    }
    formData.append('contact.email', v.email ?? '');
    formData.append('contact.email2', v.email2 ?? '');
    formData.append(
      'contact.phone1',
      v.phone1?.nationalNumber ?? v.phone1 ?? '',
    );
    formData.append(
      'contact.phone2',
      v.phone2?.nationalNumber ?? v.phone2 ?? '',
    );
    formData.append(
      'contact.mobile1',
      v.mobile1?.nationalNumber ?? v.mobile1 ?? '',
    );
    formData.append(
      'contact.mobile2',
      v.mobile2?.nationalNumber ?? v.mobile2 ?? '',
    );

    formData.append('address.line1', v.addressLine1 ?? '');
    formData.append('address.city', v.city ?? '');
    formData.append('address.state', v.state ?? '');
    formData.append('address.zipCode', v.zipCode ?? '');
    if (v.countryId) {
      formData.append('address.countryId', String(v.countryId));
    }

    if (v.image instanceof File) {
      formData.append('image', v.image);
    } else if (v.profileImagePath) {
    }

    console.log('📤 FormData ready for submission');

    const url = this.clientIdentifier
      ? `${API_Config.client.update}/${this.clientIdentifier}`
      : API_Config.client.create;

    const request$ = this.clientIdentifier
      ? this._apiService.put(url, formData)
      : this._apiService.post(url, formData);

    request$
      .pipe(
        finalize(() => (this.isLoading = false)),
        this._unsubscribe.takeUntilDestroy(),
      )
      .subscribe({
        next: (res: any) => {
          const ok = res?.isSuccess === true || res?.success === true;
          if (ok) {
            this._toastrNotifiService.displaySuccess(res?.message || 'Success');

            this._clientService.clearClientCode();

            const clientData = res?.data ?? res?.result;

            if (!this.clientIdentifier) {
              this.onSuccess(clientData);
            } else {
              this._router.navigate(['/clients/view', this.clientIdentifier], {
                replaceUrl: true,
              });
            }
            this._clientService.updateRefreshData(true);
          } else {
            this._toastrNotifiService.displayError(res?.message || 'Failed');
          }
        },
        error: (err: any) => {
          this._toastrNotifiService.displayError(
            err?.error?.message || err?.error?.title || 'Something went wrong',
          );
        },
      });

    this._toggleFormService.updateToggleEdit(true);
  }

  onSuccess(client: any) {
    let btns = [
      {
        label: this._languageService.getTransValue('clients.close'),
        styleClass:
          'border border-grey500 text-grey500 !py-2.5 font-medium text-lg',
        command: () => {
          ref.close();
        },
      },
      {
        label: this._languageService.getTransValue('clients.addContact'),
        styleClass:
          'border border-primary text-primary !py-2.5 font-medium text-lg',
        requiredPermission: 'Add_ClientContact',
        command: () => {
          this._router.navigate([`/clients/view/${client.id}/contacts`]);
          ref.close(true);
        },
      },
      {
        label: this._languageService.getTransValue('clients.addMatter'),
        styleClass: 'bg-primary text-white !py-2.5 font-medium text-lg',
        requiredPermission: 'Add_Matter',
        command: () => {
          this._router.navigate([`/matters/add`]);
          ref.close(true);
        },
      },
    ];

    btns = btns.filter(
      (btn) =>
        !btn.requiredPermission ||
        this._permissionService.hasPermission(btn.requiredPermission),
    );

    const ref = this._dialogService.open(SharedConfirmDialogComponent, {
      data: {
        type: ConfirmDialogType.Success,
        title: this._languageService.getTransValue(
          'clients.clientSuccessfully',
        ),
        message: this._languageService.getTransValue(
          'clients.actionyoucandonext',
        ),
        btns,
      },
    });

    ref.onClose.subscribe((res) => {
      if (!res) this._router.navigate([`/clients/view/${client.id}`]);
    });
  }
}
