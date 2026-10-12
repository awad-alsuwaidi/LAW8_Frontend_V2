import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { combineLatest } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiService } from 'src/app/@core/api/api.service';
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
export class CalenderFilterComponent implements OnInit, OnChanges, OnDestroy {

  ngOnChanges(changes: SimpleChanges): void {
    console.log('changes', changes);
  }

  formly: FormGroup = new FormGroup({});
  @Input() formlyModel: any;
  formlyFields: FormlyFieldConfig[] = [];
  lookupsData: any = {};
  _languageService = inject(LanguageService);

  _apiSerivce = inject(ApiService);
  _unsubscribe = inject(UnsubscribeService);

  @Output() onFilter: EventEmitter<any> = new EventEmitter<any>();
  ngOnInit(): void {
    this.getLookupData();
  }
getLookupData() {
  combineLatest({
    activity: this._apiSerivce.get(API_Config.general.getActivityType),
    user: this._apiSerivce.get(API_Config.general.getLawyerMyPermissionCalendar),
  })
    .pipe(this._unsubscribe.takeUntilDestroy())
    .subscribe({
      next: (res) => {
        this.lookupsData = res;
        this.initForm();
      },
    });
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
            optionsArr: getOptionsArray(
              this.lookupsData.activity.result,
              'id',
              'name',
              'primitive' 
            ),
            onChange: () => this.onSubmit(),
          },
        },
        {
          key: 'user',
          type: 'multi-select',
          props: {
            placeholder: this._languageService.getTransValue('matters.allUsers'),
            optionsArr: getOptionsArray(
              this.lookupsData.user.result,
              'id',
              'name',
              'primitive' 
            ),
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
