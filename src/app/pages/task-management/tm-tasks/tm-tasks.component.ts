import { Component, inject, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { TabMenuModule } from 'primeng/tabmenu';
import { LanguageService } from 'src/app/@core/services';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { SharedModule } from 'src/app/@shared/shared.module';
import { MatterTaskDto } from '../../matters/interfaces/matter-task.interface';
import { DialogService } from 'primeng/dynamicdialog';
import { TmTasksEditorComponent } from './components/tm-tasks-editor/tm-tasks-editor.component';
import { TasksRefreshService } from 'src/app/@core/services/tasks-refresh.service';

@Component({
  selector: 'app-tm-tasks',
  standalone: true,
  imports: [RouterModule, TabMenuModule, SharedModule, SharedButtonComponent],
  templateUrl: './tm-tasks.component.html',
  styleUrl: './tm-tasks.component.scss',
})
export class TmTasksComponent implements OnInit {
  _router = inject(Router);
  _route = inject(ActivatedRoute);
  _languageService = inject(LanguageService);
  _dialogService = inject(DialogService);
  refreshService = inject(TasksRefreshService);
  
  @Input() set id(value: number) {
    this.matterIdentifier = value;
  }
  matterIdentifier: any;

  items: MenuItem[] = [
    {
      label: this._languageService.getTransValue('matters.myTasks'),
      command: () => {
        this._router.navigate(['./my-tasks'], { relativeTo: this._route });
      },
    },
    {
      label: this._languageService.getTransValue('matters.assignedTasks'),
      command: () => {
        this._router.navigate(['./assignee-tasks'], {
          relativeTo: this._route,
        });
      },
    },
  ];
  // activeItem!: MenuItem;

  
  activeItem: any;

constructor(private router: Router) {}

ngOnInit() {
  this.setActiveItem();

  this.router.events.subscribe(() => {
    this.setActiveItem();
  });
}

setActiveItem() {
  const url = this.router.url;

  if (url.includes('assignee-tasks')) {
    this.activeItem = this.items[1];
  } else {
    this.activeItem = this.items[0];
  }
}

  setActiveTab() {
    this.activeItem =
      this.items.find((obj) =>
        this._router.url.includes(obj?.label?.toLocaleLowerCase() || '')
      ) || this.items[0];
  }

  openTaskEditor(rowData?: MatterTaskDto, mode?: string) {
    const ref = this._dialogService.open(TmTasksEditorComponent, {
      // header: mode ? mode === 'view' ? 'View Task' : 'Edit Task' : 'Add Task',
      header: mode
        ? mode === 'view'
          ? this._languageService.getTransValue('matters.viewTask')
          : this._languageService.getTransValue('matters.editTask')
        : this._languageService.getTransValue('matters.addTask'),

      data: { rowData, matterIdentifier: this.matterIdentifier, mode },
      width: '720px',
    });
  ref.onClose.subscribe({
  next: (res: any) => {
    if (res) {
      this.refreshService.trigger(); 
    }
  },
});
  }
}
