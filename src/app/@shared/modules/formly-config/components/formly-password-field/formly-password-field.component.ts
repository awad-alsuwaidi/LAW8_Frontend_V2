import { Component } from '@angular/core';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';

@Component({
  selector: 'app-formly-password-field',
  templateUrl: './formly-password-field.component.html',
  styleUrl: './formly-password-field.component.scss'
})
export class FormlyPasswordFieldComponent  extends FieldType<FieldTypeConfig>{

}
