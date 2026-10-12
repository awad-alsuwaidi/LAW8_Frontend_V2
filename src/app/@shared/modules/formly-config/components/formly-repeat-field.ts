import { Component } from '@angular/core';
import { FieldArrayType } from '@ngx-formly/core';

@Component({
  selector: 'formly-repeat-section',
  template: `
  {{field.fieldGroup|json}}
    <div class="mb-6">
      <ng-container *ngFor="let f of field.fieldGroup; let i = index">
        <div [ngClass]="props['layoutClass']">
          <ng-container *ngFor="let f2 of f.fieldGroup; let i = index">
            <formly-field [field]="f2"></formly-field>
          </ng-container>
        </div>
      </ng-container>
    </div>
  `,
})
export class RepeatTypeComponent extends FieldArrayType {}
