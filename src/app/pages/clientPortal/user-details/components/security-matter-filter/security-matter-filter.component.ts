import { Component, OnInit, output } from '@angular/core';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { getOptionsArray } from 'src/app/@core/utilities/functions/get-options-arr';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';

@Component({
  selector: 'app-security-matter-filter',
  standalone: true,
  imports: [
    FormlyConfigModule
  ],
  templateUrl: './security-matter-filter.component.html',
  styleUrl: './security-matter-filter.component.scss'
})
export class SecurityMatterFilterComponent extends FormBaseClass implements OnInit {


  onFilter = output();

  ngOnInit(): void {
    this.getLookupsData()
  }

  override getLookupsData(): void {
    this._apiService
      .get(API_Config.general.getUsersLookup)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          this.lookupsData = res;
          this.initForm()
        },
      });
  }
  initForm() {
    this.formlyFields = [
      {
        type: 'select',
        key: 'userId',
        className: 'w-1/2 text-sm',
        
        props: {
          placeholder: this._languageService.getTransValue('Select User'),
          optionsArr: getOptionsArray(this.lookupsData.result, 'id', 'name'),
          onChange: (e: any) => this.onSubmit()

        }
      }
    ];
  }
  override onSubmit(): void {
    this.onFilter.emit(this.formlyModel);
  }

}



