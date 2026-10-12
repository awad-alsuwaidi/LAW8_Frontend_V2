import { FieldType, FieldTypeConfig } from '@ngx-formly/core';
import { Component } from '@angular/core';

@Component({
  selector: 'app-formly-button-field',
  templateUrl: './formly-button-field.component.html',
  styleUrls: ['./formly-button-field.component.scss'],
})
export class FormlyButtonFieldComponent extends FieldType<FieldTypeConfig> {
  onClick(e:any){
    if(this.props["onClick"]){
      this.props['onClick'](e)
    }
  }
}
