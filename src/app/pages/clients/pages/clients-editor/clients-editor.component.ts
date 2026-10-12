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
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { ApiService } from 'src/app/@core/api/api.service';
import { LanguageService, ToastrNotifiService } from 'src/app/@core/services';
import { objectToFormData } from 'src/app/@core/utilities/functions/objectToFormData';
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
    .get(API_Config.client.getById, { id: this.clientIdentifier })
    .pipe(
      finalize(() => (this.isLoading = false)),
      this._unsubscribe.takeUntilDestroy()
    )
    .subscribe({
      next: (res: ApiRes) => {
        if (res.isSuccess) {
          this.formlyModel = res.result;
          this.formlyModel.image = res.result?.imagePath ?? null;
          this.formlyModel = { ...this.formlyModel };
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

  let payload = {
    ...this.formly.value,
    phone1: this.formly.value?.phone1?.nationalNumber,
    phone2: this.formly.value?.phone2?.nationalNumber,
    mobile1: this.formly.value?.mobile1?.nationalNumber
      ? this.formly.value?.mobile1?.nationalNumber
      : this.formly.value.mobile1,
    mobile2: this.formly.value?.mobile2?.nationalNumber
      ? this.formly.value?.mobile2?.nationalNumber
      : this.formly.value.mobile2,
    image: this.formly.value?.image ?? '',
  };

  const body = this.clientIdentifier
    ? { ...payload, id: this.clientIdentifier }
    : payload;
  const path = this.clientIdentifier
    ? API_Config.client.update
    : API_Config.client.create;

  const formData = objectToFormData(body);

  this._apiService
    .post(path, formData)
    .pipe(
      finalize(() => (this.isLoading = false)),
      this._unsubscribe.takeUntilDestroy()
    )
    .subscribe({
      next: (res: ApiRes) => {
        if (res.isSuccess) {
          this._toastrNotifiService.displaySuccess(res.message);
          if (!this.clientIdentifier) {
            this.onSuccess(res.result);
          } else {
            this._router.navigate(
              [`/clients/view/${this.clientIdentifier}`],
              { replaceUrl: true }
            );
          }
          this._clientService.updateRefreshData(true);
        } else {
          this._toastrNotifiService.displayError(res.message);
        }
      },
      error: (err) => {
        console.log(err);
        const msg =
          err?.error?.message ||
          err?.error?.title ||
          'Something went wrong';
        this._toastrNotifiService.displayError(msg);
      }
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
      styleClass: 'border border-primary text-primary !py-2.5 font-medium text-lg',
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
    }
  ];

  btns = btns.filter(btn => 
    !btn.requiredPermission || this._permissionService.hasPermission(btn.requiredPermission)
  );

  const ref = this._dialogService.open(SharedConfirmDialogComponent, {
    data: {
      type: ConfirmDialogType.Success,
      title: this._languageService.getTransValue('clients.clientSuccessfully'),
      message: this._languageService.getTransValue('clients.actionyoucandonext'),
      btns
    },
  });

  ref.onClose.subscribe((res) => {
    if (!res) this._router.navigate([`/clients/view/${client.id}`]);
  });
}

}
