import { Component } from '@angular/core';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';

@Component({
  selector: 'app-formly-date-field',
  templateUrl: './formly-date-field.component.html',
  styleUrl: './formly-date-field.component.scss'
})
export class FormlyDateFieldComponent extends FieldType<FieldTypeConfig> {
  onSelect(e: Date) {
    if(this.props['onSelect']) this.props['onSelect'](e)
  }
}
