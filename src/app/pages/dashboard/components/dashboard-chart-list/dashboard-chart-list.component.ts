import {
  Component,
  HostListener,
  inject,
  input,
  OnDestroy,
  OnInit,
  output,
} from '@angular/core';
import { PaginatorModule } from 'primeng/paginator';
import { SidebarModule } from 'primeng/sidebar';
import { TooltipModule } from 'primeng/tooltip';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { SharedSearchComponent } from 'src/app/@shared/components/shared-search/shared-search.component';
import { SharedStatusComponent } from 'src/app/@shared/components/shared-status/shared-status.component';
import { SharedTableComponent } from 'src/app/@shared/components/shared-table/shared-table.component';
import { Matter_Columns } from './matters-columns.config';
import { matter_statusConfig } from './matter-status.config';
import { PAGESIZE } from 'src/app/@core/utilities/defines';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LanguageService } from 'src/app/@core/services';
import { ApiService } from 'src/app/@core/api/api.service';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { hearingSession_statusConfig } from './hearing-session-status.config';
import { DatePipe } from '@angular/common';
import { DialogService } from 'primeng/dynamicdialog';
import { MatterDto } from 'src/app/pages/matters/interfaces/matter.interface';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { TaskManagementActivityEditorComponent } from 'src/app/pages/task-management/components/task-management-activity-editor/task-management-activity-editor.component';
import { finalize } from 'rxjs';
import { SharedEmptySectionComponent } from 'src/app/@shared/components/shared-empty-section/shared-empty-section.component';
import { EmptyConfig } from 'src/app/@shared/components/shared-empty-section/interface/empty-config.interface';
import { SharedSkeletonComponent } from 'src/app/@shared/components/shared-skeleton/shared-skeleton.component';
import { TranslateService } from '@ngx-translate/core';
import { SharedModule } from 'src/app/@shared/shared.module';

@Component({
  selector: 'app-dashboard-chart-list',
  standalone: true,
  imports: [
    SidebarModule,
    SharedButtonComponent,
    PaginatorModule,
    SharedSearchComponent,
    SharedTableComponent,
    SharedStatusComponent,
    TooltipModule,
    RouterModule,
    DatePipe,
    SharedEmptySectionComponent,
    SharedSkeletonComponent,
    SharedModule,
  ],
  templateUrl: './dashboard-chart-list.component.html',
  styleUrl: './dashboard-chart-list.component.scss',
})
export class DashboardChartListComponent implements OnInit, OnDestroy {
  _route = inject(ActivatedRoute);
  _languageService = inject(LanguageService);
  _unsubscribe = inject(UnsubscribeService);
  _apiSerivce = inject(ApiService);
  _dialogService = inject(DialogService);
  _apiService = inject(ApiService);
  _router = inject(Router);

  readonly visible = input<boolean>(false);

  readonly config = input.required<any>();
  onHideSidebar = output();

  first: number = 0;
  totalCount: number = 0;
  data: any[] = [];
  columns: any[] = Matter_Columns;
  statusConfig = matter_statusConfig;
  hearingSessionConfig = hearingSession_statusConfig;
  pagination: any = { pagSize: PAGESIZE, pageNum: 1, orderByDirection: 'ASC' };
  isManager!: boolean;
  isLoading!: boolean;
  emptyConfig: EmptyConfig = {
    messageTitle: this._languageService.getTransValue('No Data Found'),
    addPermission: '',
  };

  ngOnInit(): void {
    console.log('config', this.config());
    this.getQueryParam();
  }
  getViewAllLink(): any[] {
    const type = this.config()?.type;

    switch (type) {
      case 'Client':
        return ['/clients'];

      case 'PastSession':
      case 'UpcomingSession':
        return ['/task-management/hearing-session'];

      case 'Matter':
        return ['/matters'];

      default:
        return ['/'];
    }
  }
  getQueryParam() {
    this._route.queryParams
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: any) => {
          this.isManager = res['role'] == 'Manager';
          this.getData();
        },
      });
  }
  openClient(item: any) {
    this.close();

    const basePath = item.isActive ? '/clients' : '/clients/inactive';

    this._router.navigate([basePath], {
      queryParams: {
        search: item.clntNo,
      },
    });
  }

  onHide() {
    this.onHideSidebar.emit();
  }

  close() {
    this.onHideSidebar.emit();
  }

  searchValueChange(value: string): void {
    this.pagination.search = value;
    this.pagination = { ...this.pagination };
    this.getData();
  }

  onPageChange(event: any): void {
    this.first = event.first;
    this.pagination.pagSize = Number(event.rows);
    this.pagination.pageNum = event.first / event.rows + 1;
    this.pagination = { ...this.pagination };
    console.log('this.filterOptions', this.pagination);
    this.getData();
  }

  getData() {
    this.pagination = {
      ...this.pagination,
      isManagerDashboard: this.isManager,
    };
    this.isLoading = true;
    this._apiSerivce
      .get(this.config()?.endpoint, this.pagination)
      .pipe(
        finalize(() => (this.isLoading = false)),
        this._unsubscribe.takeUntilDestroy(),
      )
      .subscribe({
        next: (res: ApiRes) => {
          if (res && res.isSuccess) {
            this.data = res['result'].dataList;
            this.pagination.totalElements = res['result'].totalCount;
            this.pagination = { ...this.pagination };
          }
        },
      });
  }

  toggleFavourite(rowData: MatterDto) {
    let payload = {
      matterId: rowData.id,
    };

    this._apiService
      .post(API_Config.matters.importentMatter, null, payload)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res && res.isSuccess) {
            rowData.isImportent = !rowData.isImportent;
          }
        },
      });
  }
  openInNewTab(id: number | string) {
    const url = this._router.serializeUrl(
      this._router.createUrlTree(['/matters', id], { relativeTo: this._route }),
    );
    window.open('#' + url, '_blank');
  }
  openHearingSessionEditor(rowData: any) {
    const ref = this._dialogService.open(
      TaskManagementActivityEditorComponent,
      {
        header: 'Update Hearing Session',
        data: { rowData },
        width: '720px',
      },
    );
    ref.onClose.subscribe({
      next: (res: any) => {
        if (res) {
          this.getData();
        }
      },
    });
  }
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const sidebar = document.querySelector('.p-sidebar');
    if (this.visible() && sidebar && !sidebar.contains(event.target as Node)) {
      this.close();
    }
  }
  ngOnDestroy(): void {
    this._unsubscribe.destroy();
  }
}
