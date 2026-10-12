import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiService } from 'src/app/@core/api/api.service';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { LanguageService, ToastrNotifiService } from 'src/app/@core/services';
import { SharedStatusComponent } from 'src/app/@shared/components/shared-status/shared-status.component';
import { SharedTableComponent } from 'src/app/@shared/components/shared-table/shared-table.component';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { SharedModule } from 'src/app/@shared/shared.module';
import { MatterTaskDto } from 'src/app/pages/matters/interfaces/matter-task.interface';
import { matterTask_priorityConfig } from '../../matter-task-priority.config';
import { matterTask_statusConfig } from '../../matter-task-status.config';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { combineLatest, finalize } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { Matter_Task_Group_Columns } from './matter-task-group-columns.config';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { ActivatedRoute, Router } from '@angular/router';
import { MatterTaskEditorComponent } from '../../components/matter-task-editor/matter-task-editor.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-matter-task-group',
  standalone: true,
  imports: [
    SharedTableComponent,
    SharedModule,
    SharedStatusComponent,
    FormlyConfigModule,
    SharedButtonComponent,
    TranslateModule
  ],
  templateUrl: './matter-task-group.component.html',
  styleUrl: './matter-task-group.component.scss'
})
export class MatterTaskGroupComponent implements OnInit, OnDestroy {
  lookupsData: any;
  formlyFields: any[] = [];
  formly: FormGroup = new FormGroup({})
  formlyModel: any;
  isLoading!: boolean;
  _apiService = inject(ApiService)
  _unsubscribe = inject(UnsubscribeService);
  _dialogService = inject(DialogService);
  _languageService = inject(LanguageService);
  _toastrNotifiService = inject(ToastrNotifiService);
  _router = inject(Router);
  _route = inject(ActivatedRoute);
  data: MatterTaskDto[] = [];
  selectedTasks: MatterTaskDto[] = [];
  columns: any[] = Matter_Task_Group_Columns;
  statusConfig = matterTask_statusConfig;
  priorityConfig = matterTask_priorityConfig;
  @Input() set id(value: number) {
    this.matterIdentifier = value
  }
  matterIdentifier!: number;
  taskGroupIdentifier!: number;
  ngOnInit(): void {
    this.getLookupsData()
  }
  getLookupsData(): void {
    combineLatest({
      taskTemplate: this._apiService.get(API_Config.general.getTaskTemplatesLookup),
    }).pipe(
      this._unsubscribe.takeUntilDestroy()
    ).subscribe({
      next: (res: any) => {
        this.lookupsData = res;
        this.initForm()
      }
    })
  }
  initForm(): void {
    this.formlyFields = [
      {
        fieldGroupClassName: 'grid gap-4 md:grid-cols-3',
        fieldGroup: [
          {
            key: 'taskGroup',
            type: 'select',
            props: {
              label: this._languageService.getTransValue('matters.taskGroupitle'),
              optionsArr: this.lookupsData.taskTemplate.result.map((obj: any) => ({ label: obj.name, value: obj.id })),
              required: true,
              onChange: (e: any) => {
                this.getTasksByGroup(e.value)
              }
            },
          }
        ]
      }
    ]
  }
  getTasksByGroup(id: number) {
    this.taskGroupIdentifier = id
    const params = {
      id: id
    }
    this._apiService.get(API_Config.general.getTaskByGroupId, params).pipe(
      this._unsubscribe.takeUntilDestroy()
    ).subscribe({
      next: (res: ApiRes) => {
        if (res && res.isSuccess) {
          this.data = [...res.result];
          this.selectedTasks = []
        }
      }
    })
  }
  onRowSelectChange(e: MatterTaskDto[]) {
    this.selectedTasks = e
  }
  openTaskDetails(rowData: MatterTaskDto) {
    this._dialogService.open(MatterTaskEditorComponent, {
      header: 'View Task',
      data: { rowData, matterIdentifier: this.matterIdentifier, mode:'view' },
      width: '720px'
    })
  }
  onSubmit(): void {
    if (this.selectedTasks.length == 0) return
    this.isLoading = true;
    const payload = {
      "matterId": this.matterIdentifier,
      "groupId": this.taskGroupIdentifier,
      "tasksIds": this.selectedTasks.map(obj => obj.id)
    }
    this._apiService.post(API_Config.matterTaskGroup.create, payload).pipe(
      finalize(() => this.isLoading = false),
      this._unsubscribe.takeUntilDestroy()
    ).subscribe({
      next: (res: ApiRes) => {
        if (res && res.isSuccess) {
          this._toastrNotifiService.displaySuccess(res.message);
          this.back()
        } else {
          this._toastrNotifiService.displayError(res?.message);
        }
      },
      error: (err: any) => {
        this._toastrNotifiService.displayError(err?.error?.message);
      },
    })
  }

  back() {
    this._router.navigate(['../'], { relativeTo: this._route })
  }
  ngOnDestroy(): void {
    this._unsubscribe.destroy()
  }
}

