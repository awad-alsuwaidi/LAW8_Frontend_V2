import { NgModule } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormlyModule, FORMLY_CONFIG } from '@ngx-formly/core';
import { FormlyPrimeNGModule } from '@ngx-formly/primeng';
import {
  arabicLettersValidator,
  emailValidator,
  englishLettersValidator,
  passwordValidator,
  phoneNumberValidator,
  urlValidator,
  dateRangeValidator,
} from './custom-validation';
import { formlyValidationConfig } from './validation-messages';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { FormlyInputFieldComponent } from './components/formly-input-field/formly-input-field.component';
import { registerTranslateExtension } from './translate.extension';
import { FormlyRadioButtonFieldComponent } from './components/formly-radio-button-field/formly-radio-button-field.component';
import { FormlyButtonFieldComponent } from './components/formly-button-field/formly-button-field.component';
import { SharedButtonComponent } from '../../components/shared-button/shared-button.component';
import { FormlyOtpFieldComponent } from './components/formly-otp-field/formly-otp-field.component';
import { FormlyPasswordFieldComponent } from './components/formly-password-field/formly-password-field.component';
import { PasswordModule } from 'primeng/password';
import { FormlySelectFieldComponent } from './components/formly-select-field/formly-select-field.component';
import { FormlyMultiSelectFieldComponent } from './components/formly-multi-select-field/formly-multi-select-field.component';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormlyPhoneFieldComponent } from './components/formly-phone-field/formly-phone-field.component';
import { NgxIntlTelInputModule } from '@justin-s/ngx-intl-tel-input';
import { FormlyUploadImageFieldComponent } from './components/formly-upload-image-field/formly-upload-image-field.component';
import { FormlyInputBtnFieldComponent } from './components/formly-input-btn-field/formly-input-btn-field.component';
import { FormlyDateFieldComponent } from './components/formly-date-field/formly-date-field.component';
import { CalendarModule } from 'primeng/calendar';
import { NgxDropzoneModule } from 'ngx-dropzone-compressing';
import { FormlyAttachmentFieldComponent } from './components/formly-attachment-field/formly-attachment-field.component';
import { FormlySwitchFieldComponent } from './components/formly-switch-field/formly-switch-field.component';
import { InputSwitchModule } from 'primeng/inputswitch';
import { FormlyInlineUploadFieldComponent } from './components/formly-inline-upload-field/formly-inline-upload-field.component';
import { RadioButtonModule } from 'primeng/radiobutton';
import { FormlyAttachmentListFieldComponent } from './components/formly-attachment-list-field/formly-attachment-list-field.component';
import { FormlyTextareaFieldComponent } from './components/formly-textarea-field/formly-textarea-field.component';
import { FormlyTimerFieldComponent } from './components/formly-timer-field/formly-timer-field.component';
import { RepeatTypeComponent } from './components/formly-repeat-field';
import { FormlyLinkFieldComponent } from './components/formly-link-field';
import { FormlyButtonSelectFieldComponent } from './components/formly-button-select-field/formly-button-select-field.component';
import { SelectButtonModule } from 'primeng/selectbutton';
import { InputMaskModule } from 'primeng/inputmask';
import { FormlyInputMaskComponent } from './components/formly-input-mask/formly-input-mask.component';
import { FormlyTableFieldComponent } from './components/formly-table-field/formly-table-field.component';
import { PaginatorModule } from 'primeng/paginator';
import { RepeatAllocTypeComponent } from './components/formly-repeat-alloc-field';
@NgModule({
  declarations: [
    FormlyInputFieldComponent,
    FormlyButtonFieldComponent,
    FormlyPasswordFieldComponent,
    FormlySelectFieldComponent,
    FormlyMultiSelectFieldComponent,
    FormlyPhoneFieldComponent,
    FormlyUploadImageFieldComponent,
    FormlyInputBtnFieldComponent,
    FormlyDateFieldComponent,
    FormlyAttachmentFieldComponent,
    RepeatAllocTypeComponent,
    FormlySwitchFieldComponent,
    FormlyInlineUploadFieldComponent,
    FormlyRadioButtonFieldComponent,
    FormlyAttachmentListFieldComponent,
    FormlyTextareaFieldComponent,
    FormlyTimerFieldComponent,
    RepeatTypeComponent,
    FormlyLinkFieldComponent,
    FormlyButtonSelectFieldComponent,
    FormlyInputMaskComponent,
    FormlyTableFieldComponent,
    
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormlyModule.forChild({
      validators: [
        { name: 'arabicLetters', validation: arabicLettersValidator },
        { name: 'englishLetters', validation: englishLettersValidator },
        { name: 'email', validation: emailValidator },
        { name: 'password', validation: passwordValidator },
        { name: 'url', validation: urlValidator },
        { name: 'phone', validation: phoneNumberValidator },
        { name: 'dateRange', validation: dateRangeValidator },
      ],
      types: [
        { name: 'input', component: FormlyInputFieldComponent },
        { name: 'button', component: FormlyButtonFieldComponent },
        { name: 'radio', component: FormlyRadioButtonFieldComponent },
        { name: 'otp', component: FormlyOtpFieldComponent, extends: 'input' },
        { name: 'password', component: FormlyPasswordFieldComponent, extends: 'input' },
        { name: 'select', component: FormlySelectFieldComponent },
        // { name: 'phone', component: FormlyPhoneFieldComponent, extends: 'input' },
        { name: 'multi-select', component: FormlyMultiSelectFieldComponent, extends: 'input' },
        { name: 'upload-image', component: FormlyUploadImageFieldComponent, extends: 'input' },
        { name: 'input-btn', component: FormlyInputBtnFieldComponent, extends: 'input' },
        { name: 'date', component: FormlyDateFieldComponent, extends: 'input' },
        { name: 'attachment', component: FormlyAttachmentFieldComponent, extends: 'input' },
        { name: 'attachment-list', component: FormlyAttachmentListFieldComponent, extends: 'input' },
        { name: 'switch', component: FormlySwitchFieldComponent },
        { name: 'inline-upload', component: FormlyInlineUploadFieldComponent, extends: 'input' },
        { name: 'textarea', component: FormlyTextareaFieldComponent, extends: 'input' },
        { name: 'timer', component: FormlyTimerFieldComponent, extends: 'input' },
        { name: 'link', component: FormlyLinkFieldComponent, extends: 'input' },
        { name: 'select-button', component: FormlyButtonSelectFieldComponent, extends: 'input' },
        { name: 'phone', component: FormlyInputMaskComponent, extends: 'input' },
        { name: 'repeat', component: RepeatTypeComponent },
        { name: 'repeat-alloc', component: RepeatAllocTypeComponent },
        { name: 'table', component: FormlyTableFieldComponent },
      ]
    }),
    FormlyPrimeNGModule,
    TranslateModule,
    InputTextModule,
    DropdownModule,
    SharedButtonComponent,
    FormlyOtpFieldComponent,
    TranslateModule,
    PasswordModule,
    MultiSelectModule,
    NgxIntlTelInputModule,
    CalendarModule,
    InputSwitchModule,
    NgxDropzoneModule,
    RadioButtonModule,
    NgClass,
    SelectButtonModule,
    InputMaskModule,
    PaginatorModule
  ],
  exports: [
    ReactiveFormsModule,
    FormlyModule,
    FormlyTimerFieldComponent
  ],
  providers: [
    {
      provide: FORMLY_CONFIG,
      multi: true,
      useFactory: formlyValidationConfig,
      deps: [TranslateService],
    },
    { provide: FORMLY_CONFIG, multi: true, useFactory: registerTranslateExtension, deps: [TranslateService] },

  ],
})
export class FormlyConfigModule { }
