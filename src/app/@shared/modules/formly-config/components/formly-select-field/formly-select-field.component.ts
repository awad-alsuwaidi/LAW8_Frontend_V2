import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';
import { OverlayOptions } from 'primeng/api';
import { DropdownChangeEvent } from 'primeng/dropdown';
import { finalize } from 'rxjs';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';

@Component({
  selector: 'app-formly-select-field',
  templateUrl: './formly-select-field.component.html',
  styleUrl: './formly-select-field.component.scss'
})
export class FormlySelectFieldComponent extends FieldType<FieldTypeConfig> implements OnInit {
  _unsubscribeService = inject(UnsubscribeService);
  _cdRef = inject(ChangeDetectorRef)
  isLoading: boolean = false;
  optionArr: any[] = [];
  ngOnInit(): void {
    if (this.props['endpoint']) this.getData()
  }
  change(e?: DropdownChangeEvent) {
    if (this.props['onChange']) this.props['onChange'](e, this.field)
  }

  getData() {
    this.isLoading = true;
    this.props['endpoint'].pipe(
      finalize(() => {
        this.isLoading = false;
        this._cdRef.detectChanges();
      }),
      this._unsubscribeService.takeUntilDestroy()
    ).subscribe({
      next: (res: ApiRes) => {
        if (res.isSuccess) {
          this.optionArr = res.result
        }
      }
    })

  }
}
