import { Component, inject, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { clientsEditorContactFormlyFieldsConfig } from './client-editor-contact-formly-fields.config';
import { LanguageService } from 'src/app/@core/services';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-clients-editor-contact',
  standalone: true,
  imports: [
    FormlyConfigModule,
    TranslateModule
  ],
  templateUrl: './clients-editor-contact.component.html',
  styleUrl: './clients-editor-contact.component.scss'
})
export class ClientsEditorContactComponent {
  _languageService = inject(LanguageService);
  _router = inject(Router);

  @Input() formly:FormGroup=new FormGroup({}) ;
  @Input() formlyModel:any;
  @Input() options:any;
  formlyFields:any=clientsEditorContactFormlyFieldsConfig(this) ;  
}
