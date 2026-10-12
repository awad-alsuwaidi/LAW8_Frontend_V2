import { Component } from '@angular/core';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';

@Component({
  selector: 'app-formly-switch-field',
  templateUrl: './formly-switch-field.component.html',
  styleUrl: './formly-switch-field.component.scss'
})
export class FormlySwitchFieldComponent extends FieldType <FieldTypeConfig>{

}
