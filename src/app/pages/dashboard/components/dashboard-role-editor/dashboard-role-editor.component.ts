import { Component, EventEmitter, OnInit, Output, output } from '@angular/core';
import { SelectButtonChangeEvent } from 'primeng/selectbutton';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';

@Component({
  selector: 'app-dashboard-role-editor',
  standalone: true,
  imports: [FormlyConfigModule],
  templateUrl: './dashboard-role-editor.component.html',
  styleUrl: './dashboard-role-editor.component.scss',
})
export class DashboardRoleEditorComponent
  extends FormBaseClass
  implements OnInit
{
  role!: string;
  ngOnInit(): void {
    this.getQueryParam();
  }
  getQueryParam() {
    this._route.queryParams
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: any) => {
          this.role = res['role'];
          this.initForm();
        },
      });
  }

  initForm(): void {
    this.formlyFields = [
      {
        type: 'select-button',
        key: 'role',
        defaultValue: 'Lawyer',
        props: {
          optionArr: [],
          onChange: (e: SelectButtonChangeEvent) => {
            this._router.navigate(['/dashboard'], {
              queryParams: { role: e.value },
            });
          },
        },
      },
    ];
    this.setFormData();
  }

  setFormData() {
    this.formlyModel.role = this.role;
  }

  onSubmit(): void {}
}
