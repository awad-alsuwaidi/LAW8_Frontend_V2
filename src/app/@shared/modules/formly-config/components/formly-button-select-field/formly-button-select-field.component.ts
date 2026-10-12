import { Component } from '@angular/core';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';

@Component({
  selector: 'app-formly-button-select-field',
  templateUrl: './formly-button-select-field.component.html',
  styleUrl: './formly-button-select-field.component.scss'
})
export class FormlyButtonSelectFieldComponent extends FieldType<FieldTypeConfig> {
  optionArr: any[] = [];
  change(e: any) {
    if (this.props['onChange']) this.props['onChange'](e, this.field)
  }
}
