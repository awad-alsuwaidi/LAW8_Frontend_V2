import { Component } from '@angular/core';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';

@Component({
  selector: 'formly-repeat-section',
  template: `
    <p [class]="props['class']" (click)="onClick($event)">{{formControl.value??props['value']}}</p>
  `,
})
export class FormlyLinkFieldComponent extends FieldType<FieldTypeConfig> {
  onClick(e:any){
    if(this.props["onClick"]){
      this.props['onClick'](e);
    }
  }
}
