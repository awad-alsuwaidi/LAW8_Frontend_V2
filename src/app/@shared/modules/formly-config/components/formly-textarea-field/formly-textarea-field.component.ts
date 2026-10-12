import { Component } from '@angular/core';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';

@Component({
  selector: 'app-formly-textarea-field',
  templateUrl: './formly-textarea-field.component.html',
  styleUrl: './formly-textarea-field.component.scss'
})
export class FormlyTextareaFieldComponent extends FieldType<FieldTypeConfig> {

}
