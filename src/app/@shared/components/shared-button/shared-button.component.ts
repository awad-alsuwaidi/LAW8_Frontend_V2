import {  NgClass } from '@angular/common';
import { Component, EventEmitter, input, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-shared-button',
  standalone: true,
  imports: [
    NgClass,TranslateModule
  ],
  templateUrl: './shared-button.component.html',
  styleUrl: './shared-button.component.scss',
})
export class SharedButtonComponent {
  @Input() styleClass?: string;
  @Input() label?: string;
  @Input() disabled?: boolean;
  @Input() icon?: string;
  @Input() btnType: string = 'button';
  isLoading = input(false)
  @Input() requiredPermission?: string;
  @Output() onClick: any = new EventEmitter();
  click(e:any) {
    this.onClick.emit(e);
  }
}
