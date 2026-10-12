import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  inject,
  NgZone,
  HostListener,
} from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { DashboardChartComponent } from './components/dashboard-chart/dashboard-chart.component';
import { SharedStatusComponent } from 'src/app/@shared/components/shared-status/shared-status.component';
import { activity_priorityConfig } from './activity-priority.config';
import { hearingSession_statusConfig } from './hearing-session-status.config';
import { DashboardChartListComponent } from './components/dashboard-chart-list/dashboard-chart-list.component';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { ApiService } from 'src/app/@core/api/api.service';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { finalize, forkJoin } from 'rxjs';
import { DashboardRoleEditorComponent } from './components/dashboard-role-editor/dashboard-role-editor.component';
import { DashboardTaskFilterEditorComponent } from './components/dashboard-task-filter-editor/dashboard-task-filter-editor.component';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DashboardDurationFilterEditorComponent } from './components/dashboard-duration-filter-editor/dashboard-duration-filter-editor.component';
import { MatterActivityDto } from '../matters/interfaces/matter-activity.interface';
import { DatePipe } from '@angular/common';
import { TaskManagementActivityEditorComponent } from '../task-management/components/task-management-activity-editor/task-management-activity-editor.component';
import { DialogService } from 'primeng/dynamicdialog';
import { SharedModule } from 'src/app/@shared/shared.module';
import { MatterTaskDto } from '../matters/interfaces/matter-task.interface';
import { AuthService, LanguageService } from 'src/app/@core/services';
import { DashboardDurationtimesheetFilterEditorComponent } from './components/dashboard-timesheet/components/dashboard-durationtimesheet-filter-editor/dashboard-durationtimesheet-filter-editor.component';
import { EmptyConfig } from 'src/app/@shared/components/shared-empty-section/interface/empty-config.interface';
import { SharedEmptySectionComponent } from '../../@shared/components/shared-empty-section/shared-empty-section.component';
import { TmTaskTabEditorComponent } from '../task-management/tm-tasks/tm-tasks-tab/components/tm-task-tab-editor/tm-task-tab-editor.component';
import { SharedSkeletonGridComponent } from 'src/app/@shared/components/shared-skeleton-grid/shared-skeleton-grid.component';
import { DashboardChartSkeletonComponent } from './components/dashboard-chart-skeleton/dashboard-chart-skeleton.component';
import { DashboardTimesheetComponent } from './components/dashboard-timesheet/dashboard-timesheet.component';
import { GridStack, GridStackOptions, GridStackWidget } from 'gridstack';
import { FileService } from 'src/app/@shared/services/file/file.service';
import { IMAGE_EXTENSIONS } from 'src/app/@core/utilities/defines';
import { FileIconDirective } from 'src/app/@shared/directives/file-icon.directive';
import { AppUserComponent } from 'src/app/layout/components/topbar/app-user/app-user.component';
import { DashboardModeService } from './Service/dashboard-mode.service';
import { environment } from 'src/environments/environment';

type DashboardWidgetId =
  | 'clients'
  | 'matters'
  | 'invoices'
  | 'billingByMonth'
  | 'billingByPracticeArea'
  | 'ar'
  | 'productivity'
  | 'hearingSessions'
  | 'activities'
  | 'sessions'
  | 'timesheet'
  | 'tasks'
  | 'documentExpired';

interface DashboardWidgetLayout {
  id: DashboardWidgetId;
  x: number;
  y: number;
  w: number;
  h: number;
}
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    ChartModule,
    DashboardChartComponent,
    SharedStatusComponent,
    DashboardChartListComponent,
    DashboardRoleEditorComponent,
    DashboardTaskFilterEditorComponent,
    DashboardDurationFilterEditorComponent,
    DatePipe,
    RouterLink,
    SharedModule,
    DashboardDurationtimesheetFilterEditorComponent,
    SharedEmptySectionComponent,
    DashboardChartSkeletonComponent,
    SharedSkeletonGridComponent,
    DashboardTimesheetComponent,
    FileIconDirective,
    AppUserComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  private _unsubscribe = inject(UnsubscribeService);
  private _apiService = inject(ApiService);
  private _route = inject(ActivatedRoute);
  private _dialogService = inject(DialogService);
  private _languageService = inject(LanguageService);
  private zone = inject(NgZone);
  _fileService = inject(FileService);
  isInhouse = environment.brand === 'inhouse';

  private grid?: GridStack;
  private viewReady = false;
  private layoutLoaded = false;
  gridInitialized = false;
  private ignoreGridChange = false;
  extensions = IMAGE_EXTENSIONS;
  tooltipKeys = ['newClients', 'newMatter', 'closedMatter'];

  emptyConfig: EmptyConfig = {
    messageTitle: this._languageService.getTransValue('common.nodataavailable'),
    addPermission: '',
  };

  clients: any = [
    {
      // label: this._languageService.getTransValue('dashboard.newClients'),
      label: this._languageService.getTransValue(
        this.isInhouse ? 'clients.newEntities' : 'dashboard.newClients',
      ),
      key: 'newClients',
      value: '',
      bgColor: '--blue-700',
      type: 'Client',
      endpoint: API_Config.newClientDashboard.get,
      showLast30Days: true,
    },
    {
      // label: this._languageService.getTransValue('dashboard.clients'),
      label: this._languageService.getTransValue(
        this.isInhouse ? 'clients.entities' : 'dashboard.clients',
      ),
      key: 'clients',
      value: '',
      bgColor: '--primary',
      type: 'Client',
      endpoint: API_Config.clientDashboard.get,
      showLast30Days: false,
    },
  ];

  matters: any = [
    {
      label: this._languageService.getTransValue('dashboard.totalMatters'),
      value: '',
      bgColor: '--success-800',
      // key: 'closedMatter',
      key: 'newMatter',
      type: 'Matter',
      endpoint: 'DashboardV2/GetNewMatterList',
      showLast30Days: true,
    },
    {
      label: this._languageService.getTransValue('dashboard.favourites'),
      value: '',
      bgColor: '--success-700',
      key: 'importantMatter',
      type: 'Matter',
      endpoint: 'DashboardV2/GetImportentMatterList',
      showLast30Days: false,
    },
    {
      label: this._languageService.getTransValue('dashboard.active'),
      value: '',
      bgColor: '--success-base-500',
      key: 'activeMatter',
      type: 'Matter',
      endpoint: 'DashboardV2/GetActiveMatterList',
      showLast30Days: false,
    },
    {
      label: this._languageService.getTransValue('dashboard.closed'),
      value: '',
      bgColor: '--success-200',
      key: 'closedMatter',
      type: 'Matter',
      endpoint: 'DashboardV2/GetClosedMatterList',
      showLast30Days: true,
    },
  ];

  hearingSessions: any = [
    {
      label: this._languageService.getTransValue('dashboard.pastSessions'),
      value: '',
      key: 'pastHearingSessions',
      bgColor: '--alert-500',
      type: 'PastSession',
      endpoint: 'DashboardV2/GetPastHiringSessionList',
      showLast30Days: false,
    },
    {
      label: this._languageService.getTransValue('dashboard.upcomingSessions'),
      value: '',
      key: 'upcomingHearingSessions',
      bgColor: '--alert-300',
      type: 'UpcomingSession',
      endpoint: 'DashboardV2/GetUpcomingHearingSessionsList',
      showLast30Days: false,
    },
  ];

  timesheet: any = [];
  _modeService = inject(DashboardModeService);

  isLoading = false;
  isTimesheetLoading = false;
  priorityConfig = activity_priorityConfig;
  hearingSessionConfig = hearingSession_statusConfig;
  sidebarVisible = false;
  isManager = false;
  sidebarConfig: any;

  filterOptions: any = {
    pageNum: 1,
    orderByDirection: 'ASC',
  };

  timesheetCounts: any = {
    billableCount: 0,
    nonBillableCount: 0,
    noChargeCount: 0,
    totalTakenCount: 0,
    remainingCount: 0,
    plannedThisMonthCount: 0,
  };

  tasks: MatterTaskDto[] = [];
  activities: MatterActivityDto[] = [];
  sessions: MatterActivityDto[] = [];
  currentDashboardMode!: 1 | 2 | 3;

  mode1Layout: DashboardWidgetLayout[] = [
    { id: 'clients', x: 0, y: 0, w: 2, h: 1 },
    { id: 'matters', x: 2, y: 0, w: 2, h: 1 },
    { id: 'hearingSessions', x: 4, y: 0, w: 2, h: 1 },
    { id: 'activities', x: 0, y: 1, w: 3, h: 2 },
    { id: 'sessions', x: 3, y: 1, w: 3, h: 2 },
    { id: 'tasks', x: 2, y: 3, w: 4, h: 2 },
    { id: 'timesheet', x: 0, y: 3, w: 2, h: 2.2 },
  ];
  mode2Layout: DashboardWidgetLayout[] = [
    { id: 'clients', x: 0, y: 0, w: 2, h: 1 },
    { id: 'matters', x: 2, y: 0, w: 2, h: 1 },
    { id: 'timesheet', x: 4, y: 0, w: 2, h: 2.2 },
    { id: 'documentExpired', x: 0, y: 1, w: 4, h: 1.2 },
    { id: 'activities', x: 0.00000001, y: 2, w: 3, h: 2 },
    // { id: 'sessions',        x: 3, y: 1, w: 3, h: 2 },
    // { id: 'hearingSessions', x: 0, y: 3, w: 2, h: 1 },
    { id: 'tasks', x: 4, y: 2, w: 2.99999999, h: 2 },
  ];

  mode3Layout: DashboardWidgetLayout[] = [
    { id: 'clients', x: 0, y: 0, w: 2, h: 1 },
    { id: 'matters', x: 2, y: 0, w: 2, h: 1 },
    { id: 'invoices', x: 4, y: 0, w: 2, h: 1 },
    { id: 'billingByMonth', x: 0, y: 1, w: 3, h: 1 },
    { id: 'billingByPracticeArea', x: 3, y: 1, w: 3, h: 1 },
    { id: 'ar', x: 0, y: 3, w: 2, h: 1.2 },
    { id: 'productivity', x: 2, y: 3, w: 4, h: 1.2 },
  ];

  widgetsLayout: DashboardWidgetLayout[] = this.mode1Layout.map((w) => ({
    ...w,
  }));
  widgetsOrder: DashboardWidgetId[] = this.widgetsLayout.map((w) => w.id);

  expiredDocuments: any[] = [];
  isExpiredDocumentsLoading = false;
  modeMenuOpen = false;

  private _router = inject(Router);

  toggleModeMenu() {
    this.modeMenuOpen = !this.modeMenuOpen;
  }

  goToManagerDashboard() {
    this._router.navigate([], {
      relativeTo: this._route,
      queryParams: { role: 'Manager' },
      queryParamsHandling: 'merge',
    });
    this.modeMenuOpen = false;
  }
  switchToEmployee() {
    this._router.navigate([], {
      relativeTo: this._route,
      queryParams: { role: 'employee' },
      queryParamsHandling: 'merge',
    });
  }
  private _authService = inject(AuthService);

  private getInitialMode(): 1 | 2 | 3 {
    const token = this._authService.getToken();
    if (!token) return 1;

    const payload = JSON.parse(atob(token.split('.')[1]));
    const mode = Number(payload?.DashBoardTempletId ?? 1);

    return mode === 1 || mode === 2 || mode === 3 ? mode : 1;
  }

  private syncFromGrid(): void {
    if (!this.grid) return;

    const nodes = (this.grid.save() || []) as GridStackWidget[];

    this.widgetsLayout = nodes.map((n) => ({
      id: n.id as DashboardWidgetId,
      x: n.x ?? 0,
      y: n.y ?? 0,
      w: n.w ?? 1,
      h: n.h ?? 1,
    }));

    this.widgetsOrder = this.widgetsLayout.map((w) => w.id);
    localStorage.setItem(
      `layout-mode-${this.currentDashboardMode}`,
      JSON.stringify(this.widgetsLayout),
    );
  }
  get orderedWidgets() {
    return [...this.widgetsLayout].sort((a, b) => a.y - b.y || a.x - b.x);
  }

  setDashboardMode(mode: 1 | 2 | 3) {
    if (this.grid) {
      this.grid.destroy(false);
      this.grid = undefined;
      this.gridInitialized = false;
    }
    const key = this.getLayoutKey(mode);
    const saved = localStorage.getItem(key);
    const selectedLayout = saved
      ? JSON.parse(saved)
      : mode === 1
        ? this.mode1Layout
        : mode === 2
          ? this.mode2Layout
          : this.mode3Layout;
    this.widgetsLayout = selectedLayout.map((w: any) => ({ ...w }));
    this.widgetsOrder = this.widgetsLayout.map((w) => w.id);
    this.loadModeData(mode);
    setTimeout(() => this.initGridIfReady(), 50);
  }

  changeDashboardMode(mode: 1 | 2 | 3) {
    this.currentDashboardMode = mode;
    if (mode === 3) {
      this.isManager = true;
      this._router.navigate([], {
        relativeTo: this._route,
        queryParams: { role: 'Manager' },
        queryParamsHandling: 'merge',
      });
    } else {
      this.isManager = false;
      this._router.navigate([], {
        relativeTo: this._route,
        queryParams: { role: 'employee' },
        queryParamsHandling: 'merge',
      });
    }
    this.setDashboardMode(mode);
    this.modeMenuOpen = false;
  }

  // changeDashboardMode(mode: 1 | 2 | 3) {
  //   if (this.currentDashboardMode === mode) return;

  //   this.currentDashboardMode = mode;

  //   if (mode === 3) {
  //     this.isManager = true;
  //     this._router.navigate([], {
  //       relativeTo: this._route,
  //       queryParams: { role: 'Manager' },
  //       queryParamsHandling: 'merge',
  //     });
  //   } else {
  //     this.isManager = false;
  //     this._router.navigate([], {
  //       relativeTo: this._route,
  //       queryParams: { role: 'employee' },
  //       queryParamsHandling: 'merge',
  //     });
  //   }

  //   this.setDashboardMode(mode);
  // }

  private initGridIfReady(): void {
    if (this.gridInitialized) return;
    if (!this.viewReady) return;

    const options: GridStackOptions = {
      column: 6,
      cellHeight: 270,
      margin: 9,
      float: false,
      draggable: { handle: '.dashboard-card-header' },
    };

    this.grid = GridStack.init(options, '.grid-stack');
    this.grid.setStatic(true);

    this.grid.on('change', () => {
      if (!this.ignoreGridChange) {
        this.syncFromGrid();
      }
    });

    this.gridInitialized = true;
  }

  // @HostListener('window:resize')
  // onResize() {
  //   if (!this.grid) return;

  //   const width = window.innerWidth;

  //   if (width < 576) {
  //     this.grid.column(1);
  //   } else if (width < 768) {
  //     this.grid.column(2);
  //   } else if (width < 992) {
  //     this.grid.column(4);
  //   } else {
  //     this.grid.column(6);
  //   }
  // }

  getExpiredDocuments() {
    const today = new Date();
    const toDate = new Date();
    toDate.setDate(today.getDate() + 30);

    const params: any = {
      FromDate: today.toISOString().slice(0, 10),
      ToDate: toDate.toISOString().slice(0, 10),
      orderByDirection: 'ASC',
    };

    this.isExpiredDocumentsLoading = true;

    this._apiService
      .get(API_Config.matterDocumentsdashboard.get, params)
      .pipe(
        finalize(() => (this.isExpiredDocumentsLoading = false)),
        this._unsubscribe.takeUntilDestroy(),
      )
      .subscribe({
        next: (res: any) => {
          this.expiredDocuments = res?.result?.dataList ?? res?.result ?? [];
        },
        error: () => {
          this.expiredDocuments = [];
        },
      });
  }

  private applyServerLayout(order: DashboardWidgetId[]): void {
    if (!order || order.length === 0) return;

    const map = new Map<DashboardWidgetId, DashboardWidgetLayout>();
    this.widgetsLayout.forEach((w) => map.set(w.id, w));

    const newLayout: DashboardWidgetLayout[] = [];
    order.forEach((id) => {
      const found = map.get(id);
      if (found) {
        newLayout.push(found);
      }
    });

    this.widgetsLayout.forEach((w) => {
      if (!order.includes(w.id)) {
        newLayout.push(w);
      }
    });

    if (newLayout.length) {
      this.widgetsLayout = newLayout;
      this.widgetsOrder = newLayout.map((w) => w.id);
    }
  }

  private getLayoutKey(mode: 1 | 2 | 3): string {
    const roleKey = this.isManager ? 'manager' : 'employee';
    return `layout-${roleKey}-mode-${mode}`;
  }

  private loadModeData(mode: 1 | 2 | 3): void {
    this.getStatistics();

    if (mode === 3) {
      this.loadFinanceDashboard();
    }

    if (mode === 2) {
      this.getExpiredDocuments();
    }
  }
  invoiceSummary = {
    countInvoices: 0,
    sumInvoices: 0,
    sumPaid: 0,
    sumRemain: 0,
  };

  billingByMonthData: any;
  billingByMonthOptions: any;

  billingByPracticeAreaData: any;
  billingByPracticeAreaOptions: any;

  arAging = { sum30: 0, sum60: 0, sum90: 0, sum900: 0, total: 0 };
  arPieData: any;
  arPieOptions: any;

  productivityList: { name: string; hours: number }[] = [];
  invoicePieData: any;
  invoicePieOptions: any;
  private toNumber(val: any): number {
    if (val == null) return 0;
    if (typeof val === 'number') return val;

    const s = String(val)
      .replace(/,/g, '')
      .replace(/٫/g, '.')
      .replace(/[^\d.-]/g, '');

    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
  }

  private buildInvoicePizza(): void {
    const collected = this.invoiceSummary.sumPaid;
    const remaining = this.invoiceSummary.sumRemain;

    this.invoicePieData = {
      labels: ['Collected', 'Remaining'],
      datasets: [
        {
          data: [collected, remaining],
          borderWidth: 0,
        },
      ],
    };

    this.invoicePieOptions = {
      plugins: { legend: { display: false } },
      maintainAspectRatio: false,
    };
  }
  private loadFinanceDashboard(): void {
    forkJoin({
      summary: this._apiService.get('Dashboard/InvoicesDetailsDashBoardGet'),
      months: this._apiService.get('Dashboard/InvoicesDetailsMonthsSelect'),
      areas: this._apiService.get('Dashboard/InvoicesByPractsAreasSelect'),
      aging: this._apiService.get('Dashboard/InvoicesAmountByDaySelect'),
      topTs: this._apiService.get('Dashboard/TopTimeSheetSelect'),
    })
      .pipe(
        finalize(() => {
          // this.isFinanceLoading = false;
        }),
        this._unsubscribe.takeUntilDestroy(),
      )
      .subscribe({
        next: (res) => {
          const s = res.summary?.result?.[0] ?? {};
          this.invoiceSummary = {
            countInvoices: this.toNumber(s.countInvoices),
            sumInvoices: this.toNumber(s.sumInvoices),
            sumPaid: this.toNumber(s.sumPaid),
            sumRemain: this.toNumber(s.sumRemain),
          };
          this.buildInvoicePizza();
          const months = res.months?.result ?? [];
          const labels = months
            .slice()
            .reverse()
            .map((m: any) => m.dateMY);

          const amounts = months
            .slice()
            .reverse()
            .map((m: any) => this.toNumber(m.amount));

          this.billingByMonthData = {
            labels,
            datasets: [{ data: amounts, tension: 0.3 }],
          };
          this.billingByMonthOptions = {
            plugins: { legend: { display: false } },
            maintainAspectRatio: false,
          };

          let areas = (res.areas?.result ?? [])
            .map((a: any) => ({ name: a.name, total: this.toNumber(a.total) }))
            .filter((a: any) => a.total > 0);
          areas = areas
            .sort((a: any, b: any) => b.total - a.total)
            .slice(0, 10);
          this.billingByPracticeAreaData = {
            labels: areas.map((a: any) => a.name),
            datasets: [{ data: areas.map((a: any) => a.total) }],
          };
          this.billingByPracticeAreaOptions = {
            plugins: { legend: { display: false } },
            maintainAspectRatio: false,
          };
          const ag = res.aging?.result ?? {};
          this.arAging = {
            sum30: this.toNumber(ag.sum30),
            sum60: this.toNumber(ag.sum60),
            sum90: this.toNumber(ag.sum90),
            sum900: this.toNumber(ag.sum900),
            total: this.toNumber(ag.total),
          };

          this.arPieData = {
            labels: ['<= 30', '<= 60', '<= 90', '> 90'],
            datasets: [
              {
                data: [
                  this.arAging.sum30,
                  this.arAging.sum60,
                  this.arAging.sum90,
                  this.arAging.sum900,
                ],
              },
            ],
          };
          this.arPieOptions = {
            plugins: { legend: { display: false } },
            maintainAspectRatio: false,
          };
          this.productivityList = (res.topTs?.result ?? []).map((x: any) => ({
            name: x.name,
            hours: this.toNumber(x.hours),
          }));
        },
        error: () => {
          this.productivityList = [];
        },
      });
  }

  // ngOnInit(): void {
  //   this.getQueryParam();
  //   this.getExpiredDocuments()
  //   this._modeService.mode$
  //     .pipe(this._unsubscribe.takeUntilDestroy())
  //     .subscribe(mode => {
  //       console.log('Dashboard received mode:', mode);
  //       this.changeDashboardMode(mode);
  //     });
  // }

  ngOnInit(): void {
    this.getQueryParam();
    this.getExpiredDocuments();
    this._modeService.mode$
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe((mode) => {
        if (!mode) return;
        this.changeDashboardMode(mode);
      });
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.initGridIfReady();
  }

  ngOnDestroy(): void {
    this._unsubscribe.destroy();
    if (this.grid) {
      this.grid.destroy(false);
    }
  }

  // drag&drop -----------------------------------------------------------

  // private initGridIfReady(): void {
  //   if (this.gridInitialized) return;
  //   if (!this.viewReady || !this.layoutLoaded) return;

  //   const options: GridStackOptions = {
  //     column: 6,
  //     cellHeight: 270,
  //     margin: 9,
  //     float: true,
  //      draggable: {
  //     //   handle: '.dashboard-card-header',
  //     //   scroll: true,

  //      },
  //     // resizable: {
  //     //   handles: 'e, se, s',
  //     // },
  //   };
  // this.grid = GridStack.init(options, '.grid-stack');
  // this.grid.setStatic(true);
  // this.grid.on('change', () => this.syncFromGrid());
  // this.gridInitialized = true;

  //   // this.grid = GridStack.init(options, '.grid-stack');
  //   // this.grid.on('change', () => this.syncFromGrid());
  //   // this.gridInitialized = true;
  // }

  // getUserDashboardOrder() {
  //   this._apiService
  //     .get(API_Config.dashboardlayout.get)
  //     .pipe(this._unsubscribe.takeUntilDestroy())
  //     .subscribe({
  //       next: (res: any) => {
  //         const list = (res?.result?.divName ?? []) as DashboardWidgetId[];

  //         if (Array.isArray(list) && list.length > 0) {
  //           this.applyServerLayout(list);
  //         } else {
  //           this.widgetsOrder = this.widgetsLayout.map((w) => w.id);
  //         }

  //         this.layoutLoaded = true;
  //         this.initGridIfReady();
  //       },
  //       error: (err) => {
  //         console.log(err);
  //         this.widgetsOrder = this.widgetsLayout.map((w) => w.id);
  //         this.layoutLoaded = true;
  //         this.initGridIfReady();
  //       },
  //     });
  // }

  saveUserDashboardOrder() {
    const body: any = {
      divName: this.widgetsOrder,
    };

    this._apiService
      .post('Dashboard/UsersDashBoardAdd', body)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res) => console.log('Saved layout', res),
        error: (err) => console.log('Error saving order', err),
      });
  }

  getQueryParam() {
    this._route.queryParams
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: any) => {
          this.isManager = res['role'] == 'Manager';
          // this.getStatistics();
        },
      });
  }

  // getSidebarData(event: any) {
  //   this.sidebarConfig = event;
  //   this.sidebarVisible = true;
  // }

  getSidebarData(item: any) {
    if (item.type === 'Client') {
      const endpoint =
        item.key === 'newClients'
          ? 'DashboardV2/GetNewAllClients'
          : 'DashboardV2/GetAllClients';

      const params = {
        pagSize: 10,
        pageNum: 1,
        orderByDirection: 'ASC',
        isManagerDashboard: this.isManager,
      };

      this._apiService
        .get(endpoint, params)
        .pipe(this._unsubscribe.takeUntilDestroy())
        .subscribe((res: any) => {
          const list = res?.result?.dataList ?? [];
          this.sidebarConfig = {
            ...item,
            dataList: list,
          };
          this.sidebarVisible = true;
        });

      return;
    }

    this.sidebarConfig = item;
    this.sidebarVisible = true;
  }

  onHide() {
    this.sidebarVisible = false;
    this.sidebarConfig = null;
  }

  onFilter(type: string, filterValue: any) {
    this.filterOptions = {
      ...this.filterOptions,
      ...filterValue,
    };
    switch (type) {
      case 'timesheet':
        this.getTimesheetStatistics(filterValue);
        break;
      case 'session':
        this.getSessions();
        break;
      case 'task':
        this.getTasks();
        break;
      default:
        this.getActivities();
        break;
    }
  }

  getApiResult(res: any) {
    return res.Result ?? res.result ?? {};
  }

  getActivities() {
    const isManagerfilterOption = {
      isManagerDashboard: this.isManager,
    };
    const filterSessions = {
      ...this.filterOptions,
      ...isManagerfilterOption,
      orderByDirection: 'DSC',
      orderBy: 'startDate',
    };

    delete (filterSessions as any).StatusId;

    this._apiService
      .get(API_Config.activityDashboard.get, filterSessions)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          const result = this.getApiResult(res);
          this.activities = result.dataList ?? [];
        },
        error: () => {},
      });
  }

  getStatistics() {
    this.isLoading = true;
    const isManagerfilterOption = {
      isManagerDashboard: this.isManager,
    };

    this._apiService
      .get(API_Config.dashboard.get, isManagerfilterOption)
      .pipe(
        finalize(() => (this.isLoading = false)),
        this._unsubscribe.takeUntilDestroy(),
      )
      .subscribe({
        next: (res: ApiRes) => {
          const result = this.getApiResult(res);

          this.clients = [
            ...this.clients.map((element: any) => ({
              ...element,
              value: result[element.key] ?? 0,
            })),
          ];
          this.matters = [
            ...this.matters.map((element: any) => ({
              ...element,
              value: result[element.key] ?? 0,
            })),
          ];

          this.hearingSessions = [
            ...this.hearingSessions.map((element: any) => ({
              ...element,
              value: result[element.key] ?? 0,
            })),
          ];
        },
        error: () => {},
      });
  }

  getTasks() {
    const isManagerfilterOption = {
      isManagerDashboard: this.isManager,
    };
    this.filterOptions = {
      ...this.filterOptions,
      ...isManagerfilterOption,
      orderByDirection: 'DSC',
      orderBy: 'startDate',
    };
    this._apiService
      .get(API_Config.taskDashboard.get, this.filterOptions)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: any) => {
          this.tasks = res['result'].dataList;
        },
      });
  }

  getSessions() {
    const isManagerfilterOption = {
      isManagerDashboard: this.isManager,
    };
    const filterSessions = {
      ...this.filterOptions,
      ...isManagerfilterOption,
      orderByDirection: 'DSC',
      orderBy: 'startDate',
    };
    delete (filterSessions as any).StatusId;

    this._apiService
      .get(API_Config.hearingSessionDashboard.get, filterSessions)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: any) => {
          this.sessions = res['result'].dataList;
        },
      });
  }

  openActivityEditor(rowData: MatterActivityDto, type: string, mode?: string) {
    const ref = this._dialogService.open(
      TaskManagementActivityEditorComponent,
      {
        header:
          type === 'session'
            ? 'Update Hearing Session'
            : mode === 'view'
              ? 'View Activity'
              : 'Update Activity',
        data: { rowData, mode },
        width: '720px',
      },
    );
    ref.onClose.subscribe({
      next: (res: any) => {
        if (res) {
          if (type === 'session') {
            this.getSessions();
          } else if (type === 'task') {
            this.getTasks();
          } else {
            this.getActivities();
          }
        }
      },
    });
  }

  openTaskEditor(rowData?: MatterTaskDto, mode?: string) {
    const ref = this._dialogService.open(TmTaskTabEditorComponent, {
      header: mode ? (mode === 'view' ? 'View Task' : 'Save') : 'Add Task',
      data: { rowData, mode },
      width: '720px',
    });
    ref.onClose.subscribe({
      next: (res: any) => {
        if (res) this.getTasks();
      },
    });
  }

  getTimesheetStatistics(filterValue?: any) {
    const params = {
      ...(filterValue || {}),
      isManagerDashboard: this.isManager,
    };

    this.isTimesheetLoading = true;

    this._apiService
      .get(API_Config.timeSheetDashBoard.get, params)
      .pipe(
        finalize(() => (this.isTimesheetLoading = false)),
        this._unsubscribe.takeUntilDestroy(),
      )
      .subscribe({
        next: (res: any) => {
          const result = res?.result?.[0] || {};

          this.timesheetCounts = result;

          this.timesheet = [
            {
              label: 'Billable',
              value: result.billableCount,
              bgColor: '--success-600',
            },
            {
              label: 'Non-Billable',
              value: result.nonBillableCount,
              bgColor: '--success-400',
            },
            {
              label: 'No Charge',
              value: result.noChargeCount,
              bgColor: '--success-200',
            },
            {
              label: 'Total Taken',
              value: result.totalTakenCount,
              bgColor: '--bluegray-200',
            },
            {
              label: 'Remaining',
              value: result.remainingCount,
              bgColor: '--grey-300',
            },
            {
              label: 'Planned (This Month)',
              value: result.plannedThisMonthCount,
              bgColor: '--primary-200',
            },
          ];
        },
      });
  }

  downloadAttachment(file: any) {
    this._fileService.downloadDocument(file.id).subscribe({
      next: (response: any) => {
        const blob = new Blob([response.body], {
          type:
            response.headers.get('content-type') ?? 'application/octet-stream',
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.fileName ?? file.description ?? 'download';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
    });
  }
  
}
