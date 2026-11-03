import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { SharedModule } from 'src/app/@shared/shared.module';
import { timesheetEditorColumnsConfig } from './timesheet-editor-columns.config';
import { Table, TableModule } from 'primeng/table';
import { TimesheetEditorTimerComponent } from '../timesheet-editor-timer/timesheet-editor-timer.component';
import {
  AuthService,
  LanguageService,
  ToastrNotifiService,
} from 'src/app/@core/services';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import {
  catchError,
  finalize,
  of,
  take,
  map,
  shareReplay,
  Observable,
} from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiService } from 'src/app/@core/api/api.service';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SharedMatterComponent } from 'src/app/@shared/components/bussiness/shared-matter/shared-matter.component';
import { ConfirmDialogType } from 'src/app/@shared/enums/confirm-dialog-type';
import { SharedConfirmDialogComponent } from 'src/app/@shared/components/shared-confirm-dialog/shared-confirm-dialog.component';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedTableComponent } from 'src/app/@shared/components/shared-table/shared-table.component';
import { environment } from 'src/environments/environment';
import {
  BatchRowPayload,
  LookupItem,
  TimesheetRowDto,
  TimesheetSummary,
} from '../../../interfaces/timesheet.interface';

@Component({
  selector: 'app-timesheet-editor',
  standalone: true,
  imports: [
    SharedModule,
    SharedButtonComponent,
    CheckboxModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    TimesheetEditorTimerComponent,
    DropdownModule,
    CalendarModule,
    TooltipModule,
    InputTextModule,
    SharedTableComponent,
  ],
  templateUrl: './timesheet-editor.component.html',
  styleUrl: './timesheet-editor.component.scss',
  providers: [DatePipe],
})
export class TimesheetEditorComponent implements OnInit, OnDestroy {
  fb = inject(FormBuilder);
  _apiService = inject(ApiService);
  _authService = inject(AuthService);
  _unsubscribe = inject(UnsubscribeService);
  _dialogService = inject(DialogService);
  _toastrNotifiService = inject(ToastrNotifiService);
  _datePipe = inject(DatePipe);
  cdRef = inject(ChangeDetectorRef);
  _languageService = inject(LanguageService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  @ViewChild('dt') table!: Table;
  @ViewChildren('description') descriptionRefs!: QueryList<ElementRef>;

  columns = timesheetEditorColumnsConfig;
  isListView = false;
  isInhouse = environment.brand === 'inhouse';

  taskCodes: LookupItem[] = [];
  billingHolds: LookupItem[] = [];
  entryStatuses: LookupItem[] = [];
  canViewRates = true;

  laywers: any[] = [];
  matters: any[] = [];
  private _uidSeq = 1;

  taskCodesRequests = new Map<number, Observable<any[]>>();

  taskCodesLoadingByRow: Record<number, boolean> = {};
  taskCodesByRow: Record<
    number,
    {
      label: string;
      value: number;
      isBillable?: boolean;
      isNoCharge?: boolean;
    }[]
  > = {};
  taskCodesCacheByMatter: Record<
    number,
    {
      label: string;
      value: number;
      isBillable?: boolean;
      isNoCharge?: boolean;
    }[]
  > = {};

  summary: TimesheetSummary = {
    billableHours: 0,
    nonBillableHours: 0,
    noChargeHours: 0,
    totalHours: 0,
  };

  isLoading = false;
  isSavingDraft = false;
  isSubmitting = false;
  selectedRows: any[] = [];
  timesheetDate!: Date;
  @Output() refreshTimesheet = new EventEmitter<void>();

  requestForm = this.fb.group({ data: this.fb.array([]) });
  get getFormArray(): FormArray {
    return this.requestForm.get('data') as FormArray;
  }

  ngOnInit(): void {
    try {
      const token: any = this._authService.getDecodedToken() ?? {};
      let raw = token['UserInfo'];
      if (typeof raw === 'string') {
        try {
          raw = JSON.parse(raw);
        } catch {
          raw = null;
        }
      }
      const lockDateStr = raw?.TimeSheetDate;
      this.timesheetDate = lockDateStr
        ? new Date(lockDateStr)
        : new Date(2000, 0, 1);
      if (isNaN(this.timesheetDate.getTime())) {
        this.timesheetDate = new Date(2000, 0, 1);
      }
    } catch {
      this.timesheetDate = new Date(2000, 0, 1);
    }

    this.route.queryParams.subscribe(
      (p) => (this.isListView = p['view'] === 'list'),
    );

    this.loadLookups();
    this.loadUsers();
    this.loadDrafts();
    this.loadSummary();
  }

  ngOnDestroy(): void {
    this._unsubscribe.destroy();
  }

  private unwrap(res: any): any {
    if (!res) return null;
    if (res.data !== undefined) return res.data;
    if (res.result !== undefined) return res.result;
    return res;
  }
  private reindexRows(): void {
    this.getFormArray.controls.forEach((ctrl, i) => {
      ctrl.get('rowIndex')?.setValue(i, { emitEvent: false });
    });
  }
  private isOk(res: any): boolean {
    if (!res) return false;
    return res.success === true || res.isSuccess === true;
  }

  private unwrapList(res: any): any[] {
    const d = this.unwrap(res);
    if (!d) return [];
    if (Array.isArray(d)) return d;
    return d.items ?? d.dataList ?? d.records ?? [];
  }

  private getCurrentUserId(): any {
    const token: any = this._authService.getDecodedToken() ?? {};
    let id = token['Id'] ?? token['id'] ?? token['sub'];
    if (!id && token['UserInfo']) {
      try {
        const userInfo =
          typeof token['UserInfo'] === 'string'
            ? JSON.parse(token['UserInfo'])
            : token['UserInfo'];
        id = userInfo['Id'] ?? userInfo['id'];
      } catch {}
    }
    return id || this.laywers?.[0]?.value || null;
  }

  private loadLookups(): void {
    const types = [
      'taskCodes',
      'billingHolds',
      'timesheetEntryStatuses',
      'rates',
    ];
    const qs = types
      .map((t, i) => `types[${i}]=${encodeURIComponent(t)}`)
      .join('&');

    this._apiService
      .get(`${API_Config.timesheet.lookups}?${qs}`)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: any) => {
          const r = this.unwrap(res) ?? {};
          this.taskCodes = r.taskCodes ?? [];
          this.billingHolds = r.billingHolds ?? [];
          this.entryStatuses = r.timesheetEntryStatuses ?? [];
          this.canViewRates = Array.isArray(r.rates) && r.rates !== null;

          this.getFormArray.controls.forEach((c) => {
            if (c.get('hold')?.value == null) {
              c.get('hold')?.setValue(this.defaultHold(), { emitEvent: false });
            }
          });
        },
        error: (err) => console.error('❌ Lookups failed:', err),
      });
  }

  private loadUsers(): void {
    this._apiService
      .get(API_Config.timesheet.users, { mode: 'add' })
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: any) => {
          const list = this.unwrapList(res);
          this.laywers = list.map((u: any) => ({
            label: u.name ?? u.userName ?? '',
            value: u.id ?? u.userId,
            initial: u.initial ?? u.userInitial ?? '',
          }));
        },
        error: (err) => console.error('❌ Users failed:', err),
      });
  }

  private loadDrafts(): void {
    this.isLoading = true;
    const qs = 'filters[statusCode]=Draft&pageNumber=1&pageSize=100';

    this._apiService
      .get(`${API_Config.timesheet.list}?${qs}`)
      .pipe(
        finalize(() => (this.isLoading = false)),
        this._unsubscribe.takeUntilDestroy(),
      )
      .subscribe({
        next: (res: any) => {
          const rows = this.unwrapList(res);
          this.getFormArray.clear();
          this.selectedRows = [];
          rows.forEach((item: any) =>
            this.addRow(this.mapFromServer(item), true),
          );
          this.ensureTrailingEmpty();
          this.reindexRows();
          this.preloadTaskCodes();
          this.updateLocalSummary();
        },
        error: (err) => console.error('❌ Drafts failed:', err),
      });
  }

  private loadSummary(period: 'today' | 'week' | 'month' = 'today'): void {
    this._apiService
      .get(API_Config.timesheet.summaryByUser, { period })
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: any) => {
          const r = this.unwrap(res) ?? {};
          this.summary = {
            billableHours: r.billableHours ?? 0,
            nonBillableHours: r.nonBillableHours ?? 0,
            noChargeHours: r.noChargeHours ?? 0,
            totalHours: r.totalHours ?? 0,
          };
        },
        error: (err) => console.error('❌ Summary failed:', err),
      });
  }

  private updateLocalSummary(): void {
    let billable = 0;
    let nonBillable = 0;
    let noCharge = 0;

    this.getFormArray.controls.forEach((ctrl) => {
      const v = ctrl.value;
      if (v.hidden || !v.matterId) return;

      const hours = Number(v.hours) || 0;
      if (hours <= 0) return;

      if (v.isBillable) {
        billable += hours;
      } else {
        const taskList =
          this.taskCodesByRow[ctrl.get('rowIndex')?.value] || this.taskCodes;
        const task = taskList.find((t: any) => t.value === v.taskCodeId);

        if (task && (task as any).isNoCharge) {
          noCharge += hours;
        } else {
          nonBillable += hours;
        }
      }
    });

    this.summary = {
      billableHours: Number(billable.toFixed(2)),
      nonBillableHours: Number(nonBillable.toFixed(2)),
      noChargeHours: Number(noCharge.toFixed(2)),
      totalHours: Number((billable + nonBillable + noCharge).toFixed(2)),
    };
    this.cdRef.detectChanges();
  }

  private parseDateOnly(v: any): Date {
    if (!v) return new Date();
    if (v instanceof Date) return v;
    const [y, m, d] = String(v).split('T')[0].split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  }

  private formatDateOnly(v: any): string {
    const dt = this.parseDateOnly(v);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
  }

  private defaultHold(): number {
    const noHold = this.billingHolds.find(
      (h) => /no\s*hold/i.test(h.name) || h.name === 'No Hold',
    );
    return noHold?.id ?? 1;
  }

  private mapFromServer(item: TimesheetRowDto): any {
    return {
      id: item.id ?? null,
      date: this.parseDateOnly(item.date),
      matterId: item.matterId ?? null,
      matterCode: item.matterCode ?? '',
      clientName: item.clientName ?? '',
      userId: item.userId ?? this.getCurrentUserId(),
      userName: item.userName ?? '',
      userInitial: item.userInitial ?? '',
      taskCodeId: item.taskCodeId ?? null,
      taskCodeName: item.taskCodeName ?? '',
      hours: item.hours ?? 0,
      rateId: item.rateId ?? null,
      rateAmount: item.rateAmount ?? null,
      amount: item.amount ?? 0,
      effectiveBillable: item.effectiveBillable ?? null,
      isBillable: item.isBillable ?? false,
      description: item.description ?? '',
      notes: item.notes ?? '',
      hold: item.hold ?? this.defaultHold(),
      holdName: item.holdName ?? '',
      statusCode: item.statusCode ?? '',
      statusName: item.statusName ?? '',
      canEdit: item.canEdit ?? true,
      hidden: false,
      isNewRow: false,
      isTimerRunning: false,
      tsTimmer: null,
    };
  }

  private ensureTrailingEmpty(): void {
    const last = this.getFormArray.at(this.getFormArray.length - 1);
    const empty =
      !last ||
      (!last.get('description')?.value &&
        !last.get('hours')?.value &&
        !last.get('id')?.value);

    if (!last || !empty) {
      this.addRow({ isTrailingEmpty: true });
    }
  }

  getRowKey(i: number): number {
    return this.getFormArray.at(i)?.get('rowIndex')?.value ?? i;
  }

  private preloadTaskCodes(): void {
    const lastIdx = this.getFormArray.length - 1;
    for (let i = 0; i < this.getFormArray.length; i++) {
      if (i === lastIdx) continue;
      const mid = Number(this.getFormArray.at(i)?.get('matterId')?.value);
      if (mid) this.loadTaskCodesByMatterId(mid, i);
    }
  }

  calculateAmount(rowIndex: number): void {
    const row = this.getFormArray.at(rowIndex);
    if (!row) return;

    const hours = Number(row.get('hours')?.value) || 0;
    const rate = Number(row.get('rateAmount')?.value) || 0;
    const isBillable = row.get('isBillable')?.value ?? false;

    const effectiveRate = isBillable ? rate : 0;
    const amount = (hours * effectiveRate).toFixed(2);

    row.patchValue({ amount: amount }, { emitEvent: false });
    this.updateLocalSummary();
  }

  private fetchFromLegacy(rowIndex: number): void {
    const row = this.getFormArray.at(rowIndex);
    if (!row) return;

    const matterId = row.get('matterId')?.value;
    if (!matterId) return;

    const userId = row.get('userId')?.value || this.getCurrentUserId();
    const taskCodeId = row.get('taskCodeId')?.value;

    const params: any = { id: matterId };
    if (userId) params.lawerId = userId;
    if (taskCodeId) params.taskCodeId = taskCodeId;

    this._apiService
      .get(API_Config.timesheet.getRateFromLawyerIdAndMatterId, params)
      .pipe(
        take(1),
        catchError(() => of(null)),
      )
      .subscribe({
        next: (res: any) => {
          const r = this.unwrap(res);
          if (!r) return;
          row.patchValue({
            clientName: r.name ?? r.clientName ?? row.get('clientName')?.value,
            matterCode: r.mtrNo ?? row.get('matterCode')?.value,
            taskCodeId:
              r.law_TaskCodeId ?? r.taskCodeId ?? row.get('taskCodeId')?.value,
            taskCodeName:
              r.law_TaskCode ??
              r.taskCodeName ??
              row.get('taskCodeName')?.value,
            rateAmount: r.rate ?? r.rateAmount ?? null,
          });
          this.calculateAmount(rowIndex);
        },
      });
  }

  private fetchRateAndClient(rowIndex: number): void {
    const row = this.getFormArray.at(rowIndex);
    if (!row) return;

    const matterId = row.get('matterId')?.value;
    if (!matterId) return;

    const userId = row.get('userId')?.value || this.getCurrentUserId();
    if (!userId) return;

    const taskCodeId = row.get('taskCodeId')?.value;
    const params: any = { matterId, userId };
    if (taskCodeId) params.taskCodeId = taskCodeId;

    this._apiService
      .get(API_Config.timesheet.rateSuggestion, params)
      .pipe(
        take(1),
        catchError(() => of(null)),
      )
      .subscribe({
        next: (res: any) => {
          const r = this.unwrap(res);
          if (r) {
            row.patchValue({
              clientName:
                r.clientName ?? r.name ?? row.get('clientName')?.value,
              rateId: r.rateId ?? null,
              rateAmount: r.amount ?? null,
              taskCodeId: r.taskCodeId ?? taskCodeId ?? null,
              taskCodeName: r.taskCodeName ?? row.get('taskCodeName')?.value,
              isBillable: r.isBillable ?? false,
            });
            this.calculateAmount(rowIndex);
          } else {
            this.fetchFromLegacy(rowIndex);
          }
        },
        error: () => this.fetchFromLegacy(rowIndex),
      });
  }

  loadTaskCodesByMatterId(
    matterId: number,
    formIndex: number,
    force = false,
  ): void {
    if (!matterId) return;
    const key = this.getRowKey(formIndex);
    const selected = this.getFormArray.at(formIndex)?.get('taskCodeId')?.value;

    if (!force && this.taskCodesCacheByMatter[matterId]) {
      this.taskCodesByRow[key] = this.taskCodesCacheByMatter[matterId];
      if (selected != null) {
        this.getFormArray
          .at(formIndex)
          ?.get('taskCodeId')
          ?.setValue(selected, { emitEvent: false });
      }
      return;
    }

    let request$ = this.taskCodesRequests.get(matterId);
    if (force) {
      this.taskCodesRequests.delete(matterId);
      request$ = undefined;
    }

    if (!request$) {
      request$ = this._apiService
        .get(`${API_Config.timesheet.taskCodesByMatter}/${matterId}`)
        .pipe(
          take(1),
          map((res: any) => {
            const list = this.unwrapList(res);
            return list.map((x: any) => ({
              label: x.nameEn || x.nameAr || x.name || x.taskCodeName || '',
              value: Number(x.id ?? x.taskCodeId),
              isBillable: x.isBillable,
              isNoCharge: x.isNoCharge,
            }));
          }),
          catchError(() =>
            this._apiService
              .get(`${API_Config.timesheet.taskCodesByMatter}/${matterId}`, {
                MatterId: matterId,
              })
              .pipe(
                take(1),
                map((res: any) => {
                  const list = this.unwrapList(res);
                  return list.map((x: any) => ({
                    label:
                      x.nameEn || x.nameAr || x.name || x.taskCodeName || '',
                    value: Number(x.id ?? x.taskCodeId),
                    isBillable: x.isBillable,
                    isNoCharge: x.isNoCharge,
                  }));
                }),
                catchError(() => of([])),
              ),
          ),
          shareReplay(1),
        );
      this.taskCodesRequests.set(matterId, request$);
    }

    this.taskCodesLoadingByRow[key] = true;

    request$.subscribe({
      next: (opts: any[]) => {
        this.taskCodesCacheByMatter[matterId] = opts;
        this.taskCodesByRow[key] = opts;
        this.taskCodesLoadingByRow[key] = false;
        if (selected != null) {
          this.getFormArray
            .at(formIndex)
            ?.get('taskCodeId')
            ?.setValue(selected, { emitEvent: false });
        }
        this.cdRef.detectChanges();
      },
      error: () => {
        this.taskCodesByRow[key] = [];
        this.taskCodesLoadingByRow[key] = false;
        this.cdRef.detectChanges();
      },
    });
  }

  onLawyerChange(rowIndex: number): void {
    this.fetchRateAndClient(rowIndex);
  }

  onTaskCodeChange(rowIndex: number): void {
    this.fetchRateAndClient(rowIndex);
  }

  onExplanationFocus(rowIndex: number): void {
    if (rowIndex === this.getFormArray.length - 1) {
      const currentRow = this.getFormArray.at(rowIndex);
      if (currentRow && !currentRow.get('matterId')?.value && rowIndex > 0) {
        const prevRow = this.getFormArray.at(rowIndex - 1);
        if (prevRow) {
          currentRow.patchValue({
            matterId: prevRow.get('matterId')?.value,
            matterCode: prevRow.get('matterCode')?.value,
            clientName: prevRow.get('clientName')?.value,
            userId: prevRow.get('userId')?.value,
            userName: prevRow.get('userName')?.value,
            userInitial: prevRow.get('userInitial')?.value,
            taskCodeId: prevRow.get('taskCodeId')?.value,
            taskCodeName: prevRow.get('taskCodeName')?.value,
            rateId: prevRow.get('rateId')?.value,
            rateAmount: prevRow.get('rateAmount')?.value,
            isBillable: prevRow.get('isBillable')?.value,
            isNewRow: true, 
          });

          if (prevRow.get('matterId')?.value) {
            this.loadTaskCodesByMatterId(
              prevRow.get('matterId')?.value,
              rowIndex,
              false,
            );
          }
          this.updateLocalSummary();
        }
      }
      this.addRow(); 
    }
  }

  hideRow(event: Event | null, index: number): void {
    event?.preventDefault();
    event?.stopPropagation();

    const row = this.getFormArray.at(index);
    if (!row) return;

    if (row.get('id')?.value && !row.get('canEdit')?.value) {
      this._toastrNotifiService.displayError(
        'This timesheet cannot be deleted.',
      );
      return;
    }

    const ref: DynamicDialogRef = this._dialogService.open(
      SharedConfirmDialogComponent,
      {
        data: {
          type: ConfirmDialogType.Danger,
          title: this._languageService.getTransValue(
            'timesheet.deleteTimeSheet',
          ),
          message: this._languageService.getTransValue(
            'timesheet.areYouSureYouWantDeleteThisTimeSheet',
          ),
          btns: [
            {
              label: this._languageService.getTransValue('timesheet.cancel'),
              styleClass: 'border border-grey500 text-grey500',
              command: () => ref.close(),
            },
            {
              label: this._languageService.getTransValue('timesheet.delete'),
              styleClass: 'bg-textErrorBase text-white',
              command: () => ref.close(true),
            },
          ],
        },
      },
    );

    ref.onClose.subscribe((ok) => {
      if (!ok) return;

      const id = row.get('id')?.value;

      if (!id) {
        this.loadDrafts();
        this._toastrNotifiService.displaySuccess('Row removed.');
      } else {
        this._apiService
          .delete(`${API_Config.timesheet.list}/${id}`)
          .pipe(this._unsubscribe.takeUntilDestroy())
          .subscribe({
            next: (res: any) => {
              if (this.isOk(res)) {
                this.loadDrafts();
                this._toastrNotifiService.displaySuccess(
                  'Deleted successfully',
                );
              } else {
                this._toastrNotifiService.displayError(
                  res?.message || 'Delete failed.',
                );
              }
            },
            error: (err) => {
              const msg = err?.error?.message || 'Delete failed.';
              this._toastrNotifiService.displayError(msg);
            },
          });
      }
    });
  }

  trackByUid(index: number, item: any): number {
    return item._uid;
  }

  onStartTimer(rowIndex: number): void {
    this.getFormArray.controls.forEach((c, i) => {
      if (i !== rowIndex) c.get('isTimerRunning')?.setValue(false);
    });
    this.getFormArray.controls[rowIndex]?.get('isTimerRunning')?.setValue(true);
  }

  onStopTimer(value: any, rowIndex: number): void {
    this.getFormArray.at(rowIndex)!.patchValue({
      tsTimmer: value?.tsTimmer,
      hours: value?.hours,
      isTimerRunning: true,
    });
    this.calculateAmount(rowIndex);
  }

  addRow(obj?: any, fromServer = false): void {
    const last = this.getFormArray.at(this.getFormArray.length - 1);
    if (
      !fromServer &&
      last &&
      !last.get('matterId')?.value &&
      !last.get('description')?.value
    )
      return;

    const defaultDate =
      obj?.date ??
      (last?.get('date')?.value
        ? new Date(last.get('date')!.value)
        : new Date());
    let rowToInheritFrom = last;
    if (
      last &&
      !last.get('matterId')?.value &&
      !last.get('description')?.value &&
      this.getFormArray.length > 1
    ) {
      rowToInheritFrom = this.getFormArray.at(this.getFormArray.length - 2);
    }

    let inheritedMatterId = null;
    let inheritedMatterCode = '';
    let inheritedClientName = '';
    let inheritedTaskCodeId = null;
    let inheritedTaskCodeName = '';
    let inheritedRateId = null;
    let inheritedRateAmount = null;
    let inheritedIsBillable = false;

    if (!fromServer && rowToInheritFrom) {
      inheritedMatterId = rowToInheritFrom.get('matterId')?.value ?? null;
      inheritedMatterCode = rowToInheritFrom.get('matterCode')?.value ?? '';
      inheritedClientName = rowToInheritFrom.get('clientName')?.value ?? '';
      inheritedTaskCodeId = rowToInheritFrom.get('taskCodeId')?.value ?? null;
      inheritedTaskCodeName = rowToInheritFrom.get('taskCodeName')?.value ?? '';
      inheritedRateId = rowToInheritFrom.get('rateId')?.value ?? null;
      inheritedRateAmount = rowToInheritFrom.get('rateAmount')?.value ?? null;
      inheritedIsBillable = rowToInheritFrom.get('isBillable')?.value ?? false;
    }

    const row = this.fb.group({
      id: [obj?.id ?? null],
      _uid: [obj?._uid ?? this._uidSeq++],
      rowIndex: [this.getFormArray.length],
      isTimerRunning: [false],
      tsTimmer: [obj?.tsTimmer ?? null],
      date: [defaultDate, Validators.required],
      matterId: [obj?.matterId ?? inheritedMatterId],
      matterCode: [obj?.matterCode ?? inheritedMatterCode],
      clientName: [obj?.clientName ?? inheritedClientName],
      userId: [
        obj?.userId ??
          rowToInheritFrom?.get('userId')?.value ??
          this.getCurrentUserId(),
        Validators.required,
      ],
      userName: [
        obj?.userName ?? rowToInheritFrom?.get('userName')?.value ?? '',
      ],
      userInitial: [
        obj?.userInitial ?? rowToInheritFrom?.get('userInitial')?.value ?? '',
      ],
      taskCodeId: [obj?.taskCodeId ?? inheritedTaskCodeId],
      taskCodeName: [obj?.taskCodeName ?? inheritedTaskCodeName],
      hours: [obj?.hours ?? 0, Validators.required],
      rateId: [obj?.rateId ?? inheritedRateId],
      rateAmount: [obj?.rateAmount ?? inheritedRateAmount],
      amount: [obj?.amount ?? 0],
      effectiveBillable: [obj?.effectiveBillable ?? null],
      isBillable: [obj?.isBillable ?? inheritedIsBillable],
      description: [obj?.description ?? '', Validators.required], 
      notes: [obj?.notes ?? ''],
      hold: [obj?.hold ?? this.defaultHold()],
      holdName: [obj?.holdName ?? ''],
      statusCode: [obj?.statusCode ?? ''],
      statusName: [obj?.statusName ?? ''],
      canEdit: [obj?.canEdit ?? true],
      hidden: [false],
      isNewRow: [obj?.isNewRow ?? true], 
    });

    this.getFormArray.push(row);
    row.get('rowIndex')!.setValue(this.getFormArray.length - 1);

    const matterId = Number(row.get('matterId')?.value);
    if (matterId) {
      this.loadTaskCodesByMatterId(
        matterId,
        this.getFormArray.length - 1,
        false,
      );
    }

    if (row.get('id')?.value || matterId) {
      this.calculateAmount(this.getFormArray.length - 1);
    }
  }

  onMatterChange(rowIndex: number, eventOrValue: any): void {
    let raw =
      eventOrValue?.value !== undefined ? eventOrValue.value : eventOrValue;
    if (raw && typeof raw === 'object') {
      raw = raw.value ?? raw.id;
    }
    const numericId = Number(raw);

    if (!numericId || isNaN(numericId)) return;

    const row = this.getFormArray.at(rowIndex);
    if (!row) return;

    const selected = this.matters.find((m) => Number(m.value) === numericId);

    row.patchValue({
      matterId: numericId,
      matterCode: selected?.label ?? '',
      clientName: selected?.clientName ?? '',
      taskCodeId: null,
      taskCodeName: '',
      rateId: null,
      rateAmount: null,
      amount: 0,
      isNewRow: !row.get('id')?.value, 
    });

    const key = this.getRowKey(rowIndex);
    this.taskCodesByRow[key] = [];

    this.loadTaskCodesByMatterId(numericId, rowIndex, true);
    this.fetchRateAndClient(rowIndex);

    setTimeout(() => {
      this.descriptionRefs?.toArray()[rowIndex]?.nativeElement?.focus();
    }, 100);

    this.updateLocalSummary();
  }

  onSubmit(): void {
    if (this.selectedRows.length === 0) {
      this._toastrNotifiService.displayError(
        'Please select at least one row to submit.',
      );
      return;
    }
    this.saveBatch(true);
  }

  saveDraft(): void {
    this.saveBatch(false);
  }

  private buildBatchItems(isSubmit: boolean): BatchRowPayload[] {
    const lastIdx = this.getFormArray.length - 1;
    const payload: BatchRowPayload[] = [];

    this.getFormArray.controls.forEach((ctrl, i) => {
      if (i === lastIdx) return;
      const v = ctrl.value;

      if (v.hidden) return;
      if (!v.matterId || !v.taskCodeId || !v.description?.trim()) return;
      if (!v.userId) return;

      if (isSubmit) {
        const isSelected = this.selectedRows.some(
          (r: any) => r._uid === v._uid,
        );
        if (!isSelected) return;
      }
      payload.push({
        id: v.id ?? null,
        matterId: v.matterId,
        clientName: v.clientName ?? '',
        userId: v.userId,
        taskCodeId: v.taskCodeId,
        date: this.formatDateOnly(v.date),
        hours: v.hours ?? 0,
        description: v.description.trim(),
        notes: v.notes ?? '',
        hold: v.hold ?? this.defaultHold(),
        rateId: v.rateId ?? null,
      });
    });

    return payload;
  }

  private saveBatch(submit: boolean): void {
    const items = this.buildBatchItems(submit);

    if (!items.length) {
      this._toastrNotifiService.displayError(
        submit ? 'No valid selected rows to submit.' : 'No valid rows to save.',
      );
      return;
    }

    if (submit) this.isSubmitting = true;
    else this.isSavingDraft = true;

    this._apiService
      .post(API_Config.timesheet.batch, { items, submit })
      .pipe(
        finalize(() => {
          this.isSavingDraft = false;
          this.isSubmitting = false;
        }),
        this._unsubscribe.takeUntilDestroy(),
      )
      .subscribe({
        next: (res: any) => {
          if (!this.isOk(res)) {
            const msg =
              res?.message ||
              (res as any)?.error?.[0] ||
              (submit ? 'Submit failed.' : 'Save failed.');
            this._toastrNotifiService.displayError(msg);
            return;
          }

          this._toastrNotifiService.displaySuccess(
            submit ? 'Submitted successfully.' : 'Draft saved.',
          );

          this.loadDrafts();

          if (submit) this.refreshTimesheet.emit();
        },
        error: (err) => {
          const msg =
            err?.error?.message ||
            err?.error?.error?.[0] ||
            'Error saving timesheet.';
          this._toastrNotifiService.displayError(msg);
        },
      });
  }

  onHeaderCheckboxToggle(e: any): void {
    const rows = this.getFormArray.value.slice(0, -1);
    this.selectedRows = e.checked ? [...rows] : [];
  }

  toggleView(v: 'list' | 'card'): void {
    this.isListView = v === 'list';
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { view: v },
      queryParamsHandling: 'merge',
    });
    this.cdRef.detectChanges();
  }

  limitWords(text: string, n: number): string {
    if (!text) return '';
    const words = text.trim().split(/\s+/);
    return words.length <= n ? text : words.slice(0, n).join(' ') + '...';
  }

  get listColumns(): any[] {
    const cols = JSON.parse(JSON.stringify(this.columns));
    const matterIdx = cols.findIndex((c: any) => c.field === 'matterCode');
    if (!cols.some((c: any) => c.field === 'clientName')) {
      cols.splice(matterIdx + 1, 0, {
        header: this.isInhouse
          ? 'timesheet.entityName'
          : 'timesheet.clientName',
        field: 'clientName',
        style: {
          width: '200px',
          minWidth: '200px',
          maxWidth: '200px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        },
        sortable: true,
      });
    }
    return cols;
  }

  openAllMattersDialog(rowIndex: number): void {
    const ref = this._dialogService.open(SharedMatterComponent, {
      width: '70%',
      header: 'Select Matter',
      dismissableMask: true,
      data: { selectionMode: 'single', endpoint: API_Config.matters },
    });

    ref.onClose
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe((res: any) => {
        if (!res) return;

        const list = Array.isArray(res) ? res : [res];
        if (!list.length) return;

        const m = list[0];
        const exists = this.matters.some(
          (x) => Number(x.value) === Number(m.id),
        );
        if (!exists) {
          this.matters = [
            {
              value: m.id,
              label: m.matterCode ?? m.mtrNo ?? '',
              clientName: m.clientName ?? '',
            },
            ...this.matters,
          ];
          this.cdRef.detectChanges();
        }

        this.onMatterChange(rowIndex, { value: m.id });
      });
  }

  trackByIndex(i: number): number {
    return i;
  }
}
