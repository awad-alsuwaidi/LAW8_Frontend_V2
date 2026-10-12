import { DatePipe } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { SharedModule } from 'src/app/@shared/shared.module';
import { OverlayPanel, OverlayPanelModule } from 'primeng/overlaypanel';

@Component({
  selector: 'app-users-timesheet-editor',
  standalone: true,
  imports: [FormlyConfigModule, SharedModule,SharedButtonComponent,OverlayPanelModule],
  providers: [DatePipe],
  templateUrl: './users-timesheet-editor.component.html',
  styleUrl: './users-timesheet-editor.component.scss'
})
export class UsersTimesheetEditorComponent extends FormBaseClass implements OnInit, OnDestroy {
@ViewChild('op') overlayPanel!: OverlayPanel;

  _datePipe = inject(DatePipe)
  ngOnInit(): void {
    this.initForm()
  }
  override initForm(): void {
    this.formlyFields = [
      {
        type: 'date',
        key: 'TimeSheetDate',
        props: {
          required: true,
        }
      }
    ]
  }
  override onSubmit(): void {
    if (this.formly.invalid) {
      return;
    }

    let formData = new FormData();

    const date = new Date(this.formlyModel.TimeSheetDate).toISOString();

    formData.append('TimeSheetDate', date);

    this._apiService.post(API_Config.users.editTimeSheetDate, formData)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res.isSuccess) {
            this.overlayPanel.hide()
          }
        }
      });
  }
  ngOnDestroy(): void {
    this._unsubscribe.destroy()
  }
}
