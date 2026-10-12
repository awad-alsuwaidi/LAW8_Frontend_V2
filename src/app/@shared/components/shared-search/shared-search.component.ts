import { Component, EventEmitter, input, InputSignal, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyConfigModule } from '../../modules/formly-config/formly-config.module';
import { sharedSearchFormlyConfig } from './shared-search-formly.config';
import { sharedSearchWithBtnFormlyConfig } from './shared-search-withBtn-formly.config';

@Component({
  selector: 'app-shared-search',
  standalone: true, 
  imports: [
    FormlyConfigModule  
  ],
  templateUrl: './shared-search.component.html',
  styleUrl: './shared-search.component.scss'
})
export class SharedSearchComponent implements OnInit {
  formlyModel: any;
  formlyFields: any[] = [];
  formly: FormGroup=new FormGroup({});
  searchValue: string = '';
  withBtn:InputSignal<boolean>=input(false)
  @Output() searchValueChange: EventEmitter<string> = new EventEmitter<string>();
  ngOnInit(): void {
     this.initForm();
      this.formly.get('search')?.valueChanges.subscribe((value: string) => {
      if (value === '') {
        this.searchValueChange.emit('');
      }
    });
  }

initForm(): void {
  this.formlyFields = this.withBtn()
    ? sharedSearchWithBtnFormlyConfig(this)
    : sharedSearchFormlyConfig(this);
  setTimeout(() => {
    const control = this.formly.get('search');
    if (control) {
      control.valueChanges.subscribe((value: string) => {
        if (!value) {
          this.searchValueChange.emit('');
        }
      });
    }
  });
}

}
