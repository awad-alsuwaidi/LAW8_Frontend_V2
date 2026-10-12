import { Component, OnDestroy, OnInit } from '@angular/core';
import { FieldArrayType } from '@ngx-formly/core';
import { Subscription } from 'rxjs';
import { PAGESIZE, PAGE_SIZE_OPTION } from 'src/app/@core/utilities/defines';

@Component({
  selector: 'app-formly-table-field',
  templateUrl: './formly-table-field.component.html',
  styleUrl: './formly-table-field.component.scss'
})
export class FormlyTableFieldComponent
  extends FieldArrayType
  implements OnInit, OnDestroy {
  addSub?: Subscription;
  removeSub?: Subscription;



  pageSize = PAGESIZE;
  first = 0;
  PAGE_SIZE_OPTION = PAGE_SIZE_OPTION;

  ngOnInit(): void {

  }




  get pagedFieldGroup() {
    if (this.props['withClientPaginator']) {
      return this.field.fieldGroup ? this.field.fieldGroup.slice(this.first, this.first + this.pageSize) : [];
    }
    return this.field.fieldGroup
  }


  paginate(event: any) {
    this.first = event.first;
    this.pageSize = event.rows;
  }

  ngOnDestroy(): void {
    if (this.addSub) this.addSub.unsubscribe();
    if (this.removeSub) this.removeSub.unsubscribe();
  }
}


