import { Component, EventEmitter, inject, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { LanguageService } from 'src/app/@core/services';
import { getOptionsArray } from 'src/app/@core/utilities/functions/get-options-arr';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';

@Component({
  selector: 'app-calender-filter',
  standalone: true,
  imports: [FormlyConfigModule],
  templateUrl: './calender-filter.component.html',
  styleUrl: './calender-filter.component.scss',
})
export class CalenderFilterComponent implements OnChanges, OnDestroy {
  formly: FormGroup = new FormGroup({});
  @Input() formlyModel: any;
  @Input() usersLookup: any[] = []; // ⭐ جاية من الـ Parent
  @Input() activityLookup: any[] = []; // ⭐ جاية من الـ Parent
  
  formlyFields: FormlyFieldConfig[] = [];
  _languageService = inject(LanguageService);
  _unsubscribe = inject(UnsubscribeService);

  @Output() onFilter: EventEmitter<any> = new EventEmitter<any>();

  ngOnChanges(changes: SimpleChanges): void {
    // ⭐ بنبني الفورم أول ما الداتا توصل من الـ Parent
    if (changes['usersLookup'] || changes['activityLookup']) {
      if (this.usersLookup?.length || this.activityLookup?.length) {
        this.initForm();
      }
    }
  }

  initForm() {
    this.formlyFields = [
      {
        fieldGroupClassName: 'flex gap-4',
        fieldGroup: [
          {
            key: 'activity',
            type: 'multi-select',
            props: {
              placeholder: this._languageService.getTransValue('matters.allActivity'),
              optionsArr: getOptionsArray(this.activityLookup || [], 'id', 'name'),
              onChange: () => this.onSubmit(),
            },
          },
          {
            key: 'user',
            type: 'multi-select',
            props: {
              placeholder: this._languageService.getTransValue('matters.allUsers'),
              optionsArr: getOptionsArray(this.usersLookup || [], 'id', 'name'),
              onChange: () => this.onSubmit(),
            },
          },
        ],
      },
    ];
  }

  onSubmit() {
    this.onFilter.emit(this.formly.value);
  }

  ngOnDestroy(): void {
    this._unsubscribe.destroy();
  }
}