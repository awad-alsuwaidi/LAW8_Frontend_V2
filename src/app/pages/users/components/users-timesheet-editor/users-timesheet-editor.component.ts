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
  imports: [
    FormlyConfigModule,
    SharedModule,
    SharedButtonComponent,
    OverlayPanelModule,
  ],
  providers: [DatePipe],
  templateUrl: './users-timesheet-editor.component.html',
  styleUrl: './users-timesheet-editor.component.scss',
})
export class UsersTimesheetEditorComponent
  extends FormBaseClass
  implements OnInit, OnDestroy
{
  @ViewChild('op') overlayPanel!: OverlayPanel;

  _datePipe = inject(DatePipe);
  ngOnInit(): void {
    this.initForm();
  }
  override initForm(): void {
    this.formlyFields = [
      {
        type: 'date',
        key: 'TimeSheetDate',
        props: {
          required: true,
        },
      },
    ];
  }
  override onSubmit(): void {
    if (this.formly.invalid) {
      return;
    }
    const date = new Date(this.formlyModel.TimeSheetDate)
      .toISOString()
      .split('T')[0];

    const payload = { timesheetDate: date };

    const url = `${API_Config.users.editTimeSheetDate}`;

    this._apiService
      .put(url, payload)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: any) => {
          if (res?.isSuccess || res?.success) {
            this._toastrNotifiService.displaySuccess(
              res?.message || 'Timesheet date updated successfully',
            );
            this.overlayPanel.hide();
          } else {
            this._toastrNotifiService.displayError(
              res?.message || 'Failed to update timesheet date',
            );
          }
        },
        error: (err) => {
          this._toastrNotifiService.displayError(
            err?.error?.message || err?.message || 'Something went wrong',
          );
        },
      });
  }
  ngOnDestroy(): void {
    this._unsubscribe.destroy();
  }
}
