import { Component, OnInit } from '@angular/core';
import { combineLatest } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { notificationFilterEditor } from './notification-filter-editor.config';
import { TranslateModule } from '@ngx-translate/core';
import { getOptionsArray } from 'src/app/@core/utilities/functions/get-options-arr';

@Component({
  selector: 'app-notification-filter-editor',
  standalone: true,
  imports: [
    FormlyConfigModule,
    SharedButtonComponent,
    TranslateModule
  ],
  templateUrl: './notification-filter-editor.component.html',
  styleUrl: './notification-filter-editor.component.scss'
})
export class NotificationFilterEditorComponent extends FormBaseClass implements OnInit {
  loading = true;
  ngOnInit(): void {
    this.getLookupsData()
  }


override getLookupsData(): void {
  this.loading = true;

  combineLatest({
    user: this._apiService.get(API_Config.general.getUsersLookup),
    modules: this._apiService.get('AppLookup/NotificationStatusSelectAll')
  }).pipe(
    this._unsubscribe.takeUntilDestroy()
  ).subscribe((res) => {
    this.lookupsData = res;
    this.lookupsData.modulesOptions = getOptionsArray(
      res.modules.result,
      'id',
      'name'
    );

    this.initForm();
    this.loading = false; 
  });
}

  initForm() {
    this.formlyFields = notificationFilterEditor(this);
    this.setForm()
  }
  setForm() {
    this.formlyModel = { ...this._dynamicDialogConfig.data?.formlyModel }
  }

  reset() {
    this.formlyModel = {}
    this.formly.reset()
  }
  onSubmit() {
    this._dynamicDialogRef.close(this.formlyModel)
  }
}
