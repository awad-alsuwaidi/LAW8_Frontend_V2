import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  signal,
  ViewChild,
  ViewChildren,
  WritableSignal,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
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
import { catchError, combineLatest, finalize, of, retry } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiService } from 'src/app/@core/api/api.service';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { getOptionsArray } from 'src/app/@core/utilities/functions/get-options-arr';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SharedMatterComponent } from 'src/app/@shared/components/bussiness/shared-matter/shared-matter.component';
import { Task } from '../../../enums/task.enum';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { ConfirmDialogType } from 'src/app/@shared/enums/confirm-dialog-type';
import { SharedConfirmDialogComponent } from 'src/app/@shared/components/shared-confirm-dialog/shared-confirm-dialog.component';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { TimesheetDto } from '../../../interfaces/timesheet.interface';
import { SharedTableComponent } from 'src/app/@shared/components/shared-table/shared-table.component';
import { TopbarTimesheetEditorComponent } from 'src/app/layout/components/topbar/topbar-timesheet-editor/topbar-timesheet-editor.component';
import { environment } from 'src/environments/environment';

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
    TableModule,
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
  http = inject(HttpClient);
  billableHoursCount: number = 0;
  nonBillableHoursCount: number = 0;
  noChargeHoursCount: number = 0;
  router = inject(Router);
  @ViewChild('dt') table!: Table;
  columns: any[] = timesheetEditorColumnsConfig;
  laywers: any[] = [];
  tasks: any[] = [];
  matters: any[] = [];
  selectedRows: any[] = [];
  @Input() data: TimesheetDto[] = [];
  isListView: boolean = false;
  private cdr = inject(ChangeDetectorRef);
  taskCodesByRow: Record<number, { label: string; value: number }[]> = {};
  taskCodesLoadingByRow: Record<number, boolean> = {};
  taskCodesCacheByMatter: Record<number, { label: string; value: number }[]> =
    {};
  isInhouse = environment.brand === 'inhouse';
  showExplanationError: { [key: number]: boolean } = {};
  isLoading = false;

  pagination: any = {
    pageNum: 1,
    pagSize: 10,
    filters: {},
    orderByDirection: 'ASC',
  };

  get pagedTableData() {
    const visibleRows = this.getFormArray.value.filter(
      (row: { hidden: any }) => !row.hidden,
    );

    const rowsToShow = visibleRows.slice(0, visibleRows.length - 1);
    this.pagination.totalElements = rowsToShow.length;

    const start = (this.pagination.pageNum - 1) * this.pagination.pagSize;
    const end = start + this.pagination.pagSize;

    return rowsToShow.slice(start, end).map((item: any) => ({
      ...item,
      law_Lawer:
        this.laywers.find((l: any) => l.value === item.law_LawerId)?.label ||
        item.law_Lawer ||
        '',
      law_TaskCode:
        this.tasks.find((t: any) => t.value === item.law_TaskCodeId)?.label ||
        item.law_TaskCode ||
        '',
    }));
  }

  @Output() refreshTimesheet = new EventEmitter<void>();

  get listColumns() {
    const cols = JSON.parse(JSON.stringify(this.columns));

    const matterIdx = cols.findIndex(
      (c: { field: string }) => c.field === 'mtrNo',
    );

    if (!cols.some((c: { field: string }) => c.field === 'clientName')) {
      cols.splice(matterIdx + 1, 0, {
        header: this.isInhouse
          ? 'timesheet.entityName'
          : 'timesheet.clientName',
        field: 'clientName',
        style: {
          width: '150px',
          minWidth: '150px',
          maxWidth: '200px',
          textAlign: 'left',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        },
        sortable: true,
      });
    } else {
      const currentIdx = cols.findIndex(
        (c: { field: string }) => c.field === 'clientName',
      );
      const [clientCol] = cols.splice(currentIdx, 1);
      clientCol.style = {
        width: '200px',
        minWidth: '200px',
        maxWidth: '200px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      };
      cols.splice(matterIdx + 1, 0, clientCol);
    }

    cols.forEach(
      (col: {
        field: string;
        style: { width: string; minWidth: string; maxWidth: string };
      }) => {
        if (col.field === 'law_TaskCodeId' || col.field === 'law_LawerId') {
          col.style = { width: '100px', minWidth: '100px', maxWidth: '100px' };
        }
        if (col.field === 'explanationExplanation') {
          col.style = { width: '300px', minWidth: '250px', maxWidth: '450px' };
        }
        if (!col.style) {
          col.style = { width: '130px', minWidth: '130px', maxWidth: '130px' };
        }
      },
    );

    return cols;
  }
  private parseDateOnly(value: any): Date {
    if (!value) return new Date();

    if (value instanceof Date) return value;

    const datePart = String(value).split('T')[0];
    const [y, m, d] = datePart.split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  }

  private formatDateOnly(value: any): string {
    const dt = this.parseDateOnly(value);
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const d = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  limitWords(text: string, wordLimit: number): string {
    if (!text) return '';
    const words = text.trim().split(/\s+/);
    if (words.length <= wordLimit) {
      return text;
    }
    return words.slice(0, wordLimit).join(' ') + '...';
  }

  openEditor(rowData?: any): void {
    const ref = this._dialogService.open(TopbarTimesheetEditorComponent, {
      header: rowData ? 'Edit Timesheet' : 'Add Timesheet',
      width: window.innerWidth < 768 ? '90vw' : '40vw',
      data: { formValue: rowData, isEdit: !!rowData },
    });
    const reloadAddComponent = () => {
      console.log('🔹 Navigating to /timesheet first');
      this.router.navigate(['/timesheet']).then(() => {
        console.log('✅ Arrived at /timesheet');
        setTimeout(() => {
          console.log('🔹 Navigating to /timesheet/add');
          this.router
            .navigate(['/timesheet/add'], {
              queryParams: { reload: new Date().getTime() },
            })
            .then(() => {
              console.log('✅ Arrived at /timesheet/add');
            })
            .catch((err) => console.error('❌ Navigation error:', err));
        });
      });
    };
    ref.onClose.subscribe((isUpdated: boolean) => {
      if (isUpdated) {
        window.location.reload();
        this.isListView = true;
        this.refreshTimesheet.emit();
      }
    });
  }
  toggleView(viewType: 'list' | 'card') {
    this.isListView = viewType === 'list';
    const view = this.isListView ? 'list' : 'card';

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { view },
      queryParamsHandling: 'merge',
    });
    this.cdr.detectChanges();
  }

  route = inject(ActivatedRoute);

  onFilterChange(filter: any) {
    this.pagination.filters = filter;
    this.getData();
  }
  onDelete(rowData: TimesheetDto) {
    const reloadAddComponent = () => {
      console.log('🔹 Navigating to /timesheet first');
      this.router.navigate(['/timesheet']).then(() => {
        console.log('✅ Arrived at /timesheet');
        setTimeout(() => {
          console.log('🔹 Navigating to /timesheet/add');
          this.router
            .navigate(['/timesheet/add'], {
              queryParams: { reload: new Date().getTime() },
            })
            .then(() => {
              console.log('✅ Arrived at /timesheet/add');
            })
            .catch((err) => console.error('❌ Navigation error:', err));
        });
      });
    };
    const ref = this._dialogService.open(SharedConfirmDialogComponent, {
      modal: true,
      styleClass: 'w-[400px]',
      data: {
        type: ConfirmDialogType.Danger,
        title: this._languageService.getTransValue('timesheet.deleteTimeSheet'),
        message: this._languageService.getTransValue('timesheet.delete'),
        btns: [
          {
            label: this._languageService.getTransValue('lookups.discard'),
            styleClass: 'border border-grey500 text-grey500',
            command: () => {
              ref.close();
            },
          },
          {
            label: this._languageService.getTransValue('timesheet.delete'),
            styleClass: 'bg-textErrorBase text-white',
            command: () => {
              this._apiService
                .post(API_Config.timesheet.delete, {}, { id: rowData.id })
                .pipe(this._unsubscribe.takeUntilDestroy())
                .subscribe({
                  next: (res: ApiRes) => {
                    if (res && res.isSuccess) {
                      window.location.reload();
                      ref.close();
                      this.getData();
                    }
                  },
                });
            },
          },
        ],
      },
    });
  }

  getData() {
    this.isLoading = true;
    this._apiService
      .get(API_Config.timesheet.getDraftTimeSheet, this.pagination)
      .pipe(
        finalize(() => (this.isLoading = false)),
        this._unsubscribe.takeUntilDestroy(),
      )
      .subscribe((res: any) => {
        this.data = res?.result?.dataList || [];
        this.pagination.totalElements = res?.result?.totalCount || 0;
      });
  }
  onPageChange(event: any) {
    this.pagination.pagSize = event.rows;
    this.pagination.pageNum = event.first / event.rows + 1;
    this.getData();
  }
  get toggleViewLabel(): string {
    return this.isListView ? 'Show Table' : 'Show List';
  }

  TaskEnum = Task;
  requestForm = this.fb.group({
    data: this.fb.array([]),
  });
  get getFormArray(): FormArray {
    return this.requestForm?.get('data') as FormArray;
  }
  timesheetDate!: Date;
  currentRunningTimerIndex: number | null = null;
  @ViewChildren('explanation') explanation!: QueryList<ElementRef>;
  ngOnInit(): void {
    this.initForm();
    this.getDraftTimesheet();
    this.getDefaultHoldId();
    const userInfo = this._authService.getDecodedToken()['UserInfo'];
    this.timesheetDate = new Date(JSON.parse(userInfo).TimeSheetDate);
    this.route.queryParams.subscribe((params) => {
      this.isListView = params['view'] === 'list';
    });
  }
  listData: any[] = [];
  get tableData() {
    return this.getFormArray.value.map((item: any) => ({ ...item }));
  }
  // timesheettabelColumns = timesheettabelColumnsConfig;
  initForm(): void {
    this.updateTaskHoursSummary();
  }
  deletedRows: any[] = [];
  isSavingDraft: boolean = false;
  isSubmitting: boolean = false;

  getDraftTimesheet() {
    this._apiService
      .get(API_Config.timesheet.getDraftTimeSheet, this.filterOptions)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res.result?.length > 0) {
            const validRows = res.result.filter(
              (item: any) =>
                item.matterId && item.explanationExplanation?.trim(),
            );

            validRows.forEach((item: any, index: number) => {
              const existingRow = this.getFormArray.at(index);
              if (existingRow) {
                existingRow.patchValue({
                  ...item,
                  isNewRow: false,
                  hidden: false,
                  // tmDate: this._datePipe.transform(item?.tmDate, 'YYYY-MM-dd'),
                  tmDate: this.parseDateOnly(item?.tmDate),
                });
              } else {
                this.addRow({
                  ...item,
                  isNewRow: false,
                  hidden: false,
                  // tmDate: this._datePipe.transform(item?.tmDate, 'YYYY-MM-dd'),
                  tmDate: this.parseDateOnly(item?.tmDate),
                });
              }
            });
          }
          // if (this.getFormArray.length === 0) {
          //   this.addRow();
          // } else {
          //   const lastRow = this.getFormArray.at(this.getFormArray.length - 1);
          //   if (
          //     lastRow?.get('matterId')?.value ||
          //     lastRow?.get('explanationExplanation')?.value
          //   ) {
          //     this.addRow();
          //   }
          const lastRow = this.getFormArray.at(this.getFormArray.length - 1);

          if (!lastRow) {
            this.addRow();
          } else {
            const isLastRowEmpty =
              !lastRow.get('matterId')?.value &&
              !lastRow.get('explanationExplanation')?.value &&
              !lastRow.get('mtrNo')?.value;

            if (!isLastRowEmpty) {
              this.addRow();
            }
          }
          this.preloadTaskCodesForRows();
          this.updateTaskHoursSummary();
          this.getLookupsData();
        },
      });
  }

  hideRow(event: Event, index: number) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const row = this.getFormArray.at(index);
    if (!row) return;

    const confirmDeleteRef: DynamicDialogRef = this._dialogService.open(
      SharedConfirmDialogComponent,
      {
        data: {
          type: ConfirmDialogType.Success,
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
              command: (): void => confirmDeleteRef.close(),
            },
            {
              label: this._languageService.getTransValue('timesheet.delete'),
              styleClass: 'bg-textErrorBase text-white',
              command: (): void => {
                confirmDeleteRef.close();
                const visibleRowsCount = this.getFormArray.controls.filter(
                  (r) => !r.get('hidden')?.value,
                ).length;

                if (visibleRowsCount <= 1) {
                  row.reset({
                    id: null,
                    rowIndex: 0,
                    isTimerRunning: false,
                    tsTimmer: null,
                    tmDate: new Date(),
                    matterId: null,
                    mtrNo: '',
                    clientName: '',
                    law_LawerId: this._authService.getDecodedToken()['Id'],
                    law_TaskCodeId: null,
                    hours: 0,
                    rate: 0,
                    amount: 0,
                    explanationExplanation: '',
                    notes: '',
                    hidden: false,
                    isNewRow: true,
                  });
                  this.updateTaskHoursSummary();
                  this.cdRef.detectChanges();
                  confirmDeleteRef.close(true);
                  return;
                }

                const reloadAddComponent = () => {
                  console.log('🔹 Navigating to /timesheet first');
                  this.router.navigate(['/timesheet']).then(() => {
                    console.log('✅ Arrived at /timesheet');
                    setTimeout(() => {
                      console.log('🔹 Navigating to /timesheet/add');
                      this.router
                        .navigate(['/timesheet/add'], {
                          queryParams: { reload: new Date().getTime() },
                        })
                        .then(() => {
                          console.log('✅ Arrived at /timesheet/add');
                        })
                        .catch((err) =>
                          console.error('❌ Navigation error:', err),
                        );
                    });
                  });
                };

                if (row.get('id')?.value) {
                  const param = { id: row.get('id')?.value };
                  this._apiService
                    .post(API_Config.timesheet.delete, {}, param)
                    .pipe(this._unsubscribe.takeUntilDestroy())
                    .subscribe({
                      next: (res: ApiRes) => {
                        if (res.isSuccess) {
                          row.get('hidden')?.setValue(true);
                          this.updateTaskHoursSummary();
                          this.cdRef.detectChanges();
                          this.backgroundReRenderTable();
                          reloadAddComponent();
                        } else {
                          this._toastrNotifiService.displayError(res.message);
                          confirmDeleteRef.close(true);
                        }
                      },
                      error: () => {
                        this._toastrNotifiService.displayError(
                          'Failed to delete row',
                        );
                        confirmDeleteRef.close(true);
                      },
                    });
                  // } else {
                  //   row.get('hidden')?.setValue(true);
                  //   this.updateTaskHoursSummary();
                  //   this.cdRef.detectChanges();
                  //   reloadAddComponent();
                  //   confirmDeleteRef.close(true);
                  // }
                } else {
                  this.getFormArray.removeAt(index);
                  this.updateTaskHoursSummary();
                  this.cdRef.detectChanges();
                  this.backgroundReRenderTable();
                  confirmDeleteRef.close(true);
                }
              },
            },
          ],
        },
      },
    );
  }

  private preloadTaskCodesForRows(): void {
    const lastIndex = this.getFormArray.length - 1;

    for (let i = 0; i < this.getFormArray.length; i++) {
      if (i === lastIndex) continue;

      const ctrl = this.getFormArray.at(i);
      const matterId = Number(ctrl.get('matterId')?.value);

      if (!matterId) continue;
      if (ctrl.get('rowIndex')?.value == null) {
        ctrl.get('rowIndex')?.setValue(i, { emitEvent: false });
      }

      this.loadTaskCodesByMatterId(matterId, i);
    }
  }
  private loadTaskCodesByMatterId(
    matterId: number,
    formIndex: number,
    force = false,
  ): void {
    if (!matterId) return;

    const rowKey = this.getRowKey(formIndex);
    const selectedId = this.getFormArray
      .at(formIndex)
      ?.get('law_TaskCodeId')?.value;

    if (!force && this.taskCodesCacheByMatter[matterId]) {
      this.taskCodesByRow[rowKey] = this.taskCodesCacheByMatter[matterId];
      if (selectedId != null) {
        this.getFormArray
          .at(formIndex)
          ?.get('law_TaskCodeId')
          ?.setValue(selectedId, { emitEvent: false });
      }
      return;
    }

    this.taskCodesLoadingByRow[rowKey] = true;

    this._apiService
      .get('AppLookup/GetLaw_TaskCodesByMatterId', { MatterId: matterId })
      .pipe(
        finalize(() => (this.taskCodesLoadingByRow[rowKey] = false)),
        this._unsubscribe.takeUntilDestroy(),
      )
      .subscribe({
        next: (res: any) => {
          const opts =
            (res?.result ?? []).map((x: any) => ({
              label: x.name,
              value: Number(x.id),
            })) ?? [];

          this.taskCodesCacheByMatter[matterId] = opts;
          this.taskCodesByRow[rowKey] = opts;
          if (selectedId != null) {
            this.getFormArray
              .at(formIndex)
              ?.get('law_TaskCodeId')
              ?.setValue(selectedId, { emitEvent: false });
          }

          this.cdr.detectChanges();
        },
        error: () => {
          this.taskCodesByRow[rowKey] = [];
        },
      });
  }

  private backgroundReRenderTable(): void {
    const current = this.isListView;
    this.isListView = !current;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.isListView = current;
      this.cdr.detectChanges();
    }, 0);
  }

  onExplanationFocus(rowIndex: number) {
    const lastIndex = this.getFormArray.length - 1;
    if (rowIndex === lastIndex) {
      this.addRow();
    }
  }

  addRow(obj?: any) {
    const lastRow = this.getFormArray.at(this.getFormArray.length - 1);
    if (
      lastRow &&
      !lastRow.get('matterId')?.value &&
      !lastRow.get('explanationExplanation')?.value
    ) {
      return;
    }

    const defaultDate =
      obj?.tmDate ||
      (lastRow?.get('tmDate')?.value
        ? new Date(lastRow.get('tmDate')?.value)
        : new Date());

    const row = this.fb.group({
      id: [obj?.id ?? null],
      rowIndex: [this.getFormArray.length],
      isTimerRunning: [false],
      tsTimmer: [obj?.tsTimmer ?? null],
      tmDate: [defaultDate, [Validators.required]],
      matterId: [obj?.matterId ?? lastRow?.get('matterId')?.value ?? null],
      mtrNo: [obj?.mtrNo ?? lastRow?.get('mtrNo')?.value ?? ''],
      clientName: [obj?.clientName ?? lastRow?.get('clientName')?.value ?? ''],
      // matterId: [obj?.matterId ?? null, [Validators.required]],
      // mtrNo: [obj?.mtrNo ?? ''],
      // clientName: [obj?.clientName ?? '', [Validators.required]],
      law_LawerId: [
        obj?.law_LawerId ?? this._authService.getDecodedToken()['Id'],
        [Validators.required],
      ],
      law_TaskCodeId: [
        obj?.law_TaskCodeId ?? lastRow?.get('law_TaskCodeId')?.value ?? '',
      ],
      rate: [obj?.rate ?? lastRow?.get('rate')?.value ?? ''],
      // law_TaskCodeId: [obj?.law_TaskCodeId ?? null, [Validators.required]],
      // rate: [obj?.rate ?? 0, [Validators.required]],
      hours: [obj?.hours ?? 0, [Validators.required]],
      amount: [obj?.amount ?? 0, [Validators.required]],
      explanationExplanation: [
        obj?.explanationExplanation ?? '',
        [Validators.required],
      ],
      notes: [obj?.notes ?? ''],
      hidden: [obj?.hidden ?? false],
      isNewRow: [obj?.isNewRow ?? true],
    });

    this.getFormArray.push(row);
    row.get('rowIndex')?.setValue(this.getFormArray.length - 1);
    this.tableValue = [...this.getFormArray.value];
    const newIndex = this.getFormArray.length - 1;
    const inheritedMatterId = Number(
      this.getFormArray.at(newIndex)?.get('matterId')?.value,
    );
    if (inheritedMatterId) {
      this.loadTaskCodesByMatterId(inheritedMatterId, newIndex);
    }
  }

  defaultHoldId: number | null = null;
  getDefaultHoldId() {
    this._apiService
      .get('AppLookup/GetBillingExpenseHoldLookup')
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: any) => {
          if (res?.isSuccess && res.result?.length) {
            this.defaultHoldId = res.result[0].id;
          } else {
          }
        },
        error: (err) => console.error('❌ Error fetching Hold ID:', err),
      });
  }
  saveInProgress = false;
  saveDraft() {
    this.isSavingDraft = true;
    // const rows = this.getFormArray.value;
    const rows = this.getFormArray.value.slice(0, -1);

    const isPlaceholderRow = (row: any) => {
      if (!row) return true;
      const noMatter = !row.matterId;
      const noExplanation = !(
        row.explanationExplanation && row.explanationExplanation.trim()
      );
      const noTask = !row.law_TaskCodeId;
      const noOther = !row.hours && !row.rate && !row.amount && !row.mtrNo;
      return noMatter && noExplanation && noTask && noOther;
    };

    const rowsToValidate = rows.filter((r: any) => !isPlaceholderRow(r));

    console.log('rows (all):', rows);
    console.log('rowsToValidate (non-placeholder):', rowsToValidate);

    const invalidMatterRows = rowsToValidate.filter(
      (row: any) => !row.matterId,
    );
    if (invalidMatterRows.length > 0) {
      this.getFormArray.controls.forEach((ctrl: any, idx: number) => {
        const val = ctrl.value;
        if (!isPlaceholderRow(val) && !val.matterId) {
          if (ctrl.get) ctrl.get('mtrNo')?.setErrors({ required: true });
        }
        ctrl.markAllAsTouched?.();
      });

      this.isSavingDraft = false;
      this._toastrNotifiService.displayError(
        'Please select a Matter for all rows (except empty rows).',
      );
      return;
    }

    const invalidTaskRows = rowsToValidate.filter(
      (row: any) =>
        row.matterId && (!row.law_TaskCodeId || row.law_TaskCodeId === 0),
    );
    if (invalidTaskRows.length > 0) {
      this.getFormArray.controls.forEach((ctrl: any) => {
        const val = ctrl.value;
        if (
          !isPlaceholderRow(val) &&
          val.matterId &&
          (!val.law_TaskCodeId || val.law_TaskCodeId === 0)
        ) {
          if (ctrl.get)
            ctrl.get('law_TaskCodeId')?.setErrors({ required: true });
        }
        ctrl.markAllAsTouched?.();
      });

      this.isSavingDraft = false;
      this._toastrNotifiService.displayError(
        'Some matters have no Task Code assigned.',
      );
      return;
    }

    const emptyExplanationRows = rowsToValidate.filter(
      (row: any) =>
        row.matterId &&
        !(row.explanationExplanation && row.explanationExplanation.trim()),
    );
    if (emptyExplanationRows.length > 0) {
      this.getFormArray.controls.forEach((ctrl: any) => {
        const val = ctrl.value;
        if (
          !isPlaceholderRow(val) &&
          val.matterId &&
          !(val.explanationExplanation && val.explanationExplanation.trim())
        ) {
          if (ctrl.get)
            ctrl.get('explanationExplanation')?.setErrors({ required: true });
        }
        ctrl.markAllAsTouched?.();
      });

      this.isSavingDraft = false;
      this._toastrNotifiService.displayError(
        'Please fill in the Explanation for all matters.',
      );
      return;
    }

    const rowsToSend = rows
      .map((row: any) => row)
      .filter((row: any) => !isPlaceholderRow(row) && !row.hidden)
      .filter(
        (row: any) =>
          row.matterId &&
          row.law_TaskCodeId &&
          row.explanationExplanation?.trim(),
      )
      .map((row: any) => ({
        id: row.id ?? null,
        matterId: row.matterId,
        mtrNo: row.mtrNo ?? '',
        law_LawerId:
          row.law_LawerId ?? this._authService.getDecodedToken()['Id'],
        law_TaskCodeId: row.law_TaskCodeId,
        tmDate: this.formatDateOnly(row.tmDate),
        hours: row.hours ?? 0,
        rate: row.rate ?? 0,
        amount: row.amount ?? 0,
        explanationExplanation: row.explanationExplanation.trim(),
        notes: row.notes ?? '',
        holdId: row.holdId ?? this.defaultHoldId,
        // typeId:1
      }));

    console.log('rowsToSend:', rowsToSend);

    if (rowsToSend.length === 0) {
      this.isSavingDraft = false;
      this._toastrNotifiService.displayError('No valid rows to save.');
      return;
    }

    this.saveInProgress = true;

    this._apiService
      .post(API_Config.timesheet.update, rowsToSend)
      .pipe(
        this._unsubscribe.takeUntilDestroy(),
        finalize(() => {
          this.isSavingDraft = false;
          this.saveInProgress = false;
        }),
      )
      .subscribe({
        next: (res: ApiRes) => {
          if (res.isSuccess) {
            this._toastrNotifiService.displaySuccess(
              'Draft saved successfully.',
            );
            this.deletedRows = [];
            this.getFormArray.clear();
            this.getDraftTimesheet();
          } else {
            this._toastrNotifiService.displayError(
              res.message || 'Error saving draft.',
            );
          }
        },
        error: (err) => {
          console.error('Save Draft Error:', err);
          this._toastrNotifiService.displayError('Error saving draft.');
        },
      });
  }

  onHeaderCheckboxToggle(event: any) {
    const validRows = this.getFormArray.value.slice(0, -1);

    if (event.checked) {
      this.selectedRows = [...validRows];
    } else {
      this.selectedRows = [];
    }
  }

  expandedRows: { [key: string]: boolean } = {};
  @ViewChild('dt') dt: Table | undefined;

  getLookupsData() {
    combineLatest({
      lawyers: this._apiService.get(
        API_Config.general.getUsersInitialSaparateForTimeShet,
      ),
      tasks: this._apiService.get(API_Config.general.getTaskCode),
      matters: this._apiService.get(API_Config.general.getRecentMatters),
    })
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: any) => {
          // this.laywers =
          //   res?.lawyers?.result.map((obj: any) => ({
          //     label: obj.initial,
          //     value: obj.id,
          //     initial: obj.name,
          //   })) || [];
          this.laywers =
            res?.lawyers?.result.map((obj: any) => ({
              label: obj.name,
              value: obj.id,
              initial: obj.initial,
            })) || [];

          this.tasks = getOptionsArray(res?.tasks?.result, 'id', 'name');
          this.matters = getOptionsArray(res?.matters?.result, 'id', 'name');
        },
      });
  }
  onStartTimer(rowIndex: number) {
    const isAnyTimerRunning = this.getFormArray.controls.some(
      (control) => control.get('isTimerRunning')?.value,
    );
    if (isAnyTimerRunning) {
      (this.getFormArray.controls as FormGroup[]).forEach(
        (formGroup: FormGroup, index: number) => {
          if (rowIndex != index)
            formGroup?.get('isTimerRunning')?.setValue(false);
        },
      );
    }
    this.getFormArray.controls[rowIndex]?.get('isTimerRunning')?.setValue(true);
  }
  onStopTimer(value: any, rowIndex: number) {
    this.getFormArray.controls[rowIndex].patchValue({
      tsTimmer: value?.tsTimmer,
      hours: value?.hours,
      isTimerRunning: true,
    });
    this.setAmountValue(rowIndex);
    this.updateTaskHoursSummary();
  }

  getRateFromLawyerIdAndMatterId(rowIndex: number) {
    let row = this.getFormArray.value[rowIndex];
    let lawyerId = row?.law_LawerId;
    let matterId = row?.matterId;
    if (!lawyerId && !matterId) return;
    const param = {
      id: matterId,
      lawerId: lawyerId,
    };
    this._apiService
      .get(API_Config.timesheet.getRateFromLawyerIdAndMatterId, param)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res && res.isSuccess) {
            this.getFormArray.controls[rowIndex].patchValue({
              rate: +res['result'].rate,
              law_TaskCodeId: res['result'].law_TaskCodeId,
            });
            this.setAmountValue(rowIndex);
          }
        },
      });
  }

  setAmountValue(rowIndex: number) {
    const hours = this.getFormArray?.controls[rowIndex]?.get('hours')?.value;
    const rate = this.getFormArray.controls[rowIndex]?.get('rate')?.value;
    const taskCodeId =
      this.getFormArray.controls[rowIndex]?.get('law_TaskCodeId')?.value;

    if (!isNaN(hours)) {
      let effectiveRate = 0;

      const numericTaskCodeId = Number(taskCodeId);
      const billableTaskCode = Number(this.TaskEnum.Billable);

      if (numericTaskCodeId === billableTaskCode) {
        effectiveRate = !isNaN(rate) ? Number(rate) : 0;
      }

      const amount = (Number(hours) * effectiveRate).toFixed(2);
      this.getFormArray.controls[rowIndex].patchValue({
        amount: amount,
      });
    }
  }
  selectMatter(e: any, rowIndex: number) {
    let matterId = this.matters.find((obj) => obj.label == e.value)?.value;
    this.getFormArray.controls[rowIndex]?.get('matterId')?.setValue(matterId);
    this.explanation.toArray()[rowIndex].nativeElement.focus();
    this.getRateFromLawyerIdAndMatterId(rowIndex);
    if (matterId) this.getClientNameByMatterId(matterId, rowIndex);

    this.addRow();
  }
  getClientNameByMatterId(matterId: number, rowIndex: number) {
    const param = { id: matterId };
    this._apiService
      .get(API_Config.timesheet.getClientNameByMatterId, param)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          this.getFormArray.controls[rowIndex].patchValue({
            clientName: res['result'].name,
          });
        },
      });
  }

  getRowKey(formIndex: number): number {
    return this.getFormArray.at(formIndex)?.get('rowIndex')?.value ?? formIndex;
  }

  saveSelectedMatter(rowIndex: number, selectedMatter: any) {
    setTimeout(() => {
      this.updateFormWithMatter(rowIndex, {
        value: selectedMatter.id,
        label: selectedMatter.mtrNo ?? selectedMatter.name,
        clientName: selectedMatter.law_Client,
      });
    }, 0);
  }

  onDropdownChange(rowIndex: number, selectedValue: any) {
    const selectedMatter =
      this.matters.find((m) => m.value === selectedValue) ||
      this.matters.find((m) => m.label === selectedValue);

    if (!selectedMatter) return;

    this.updateFormWithMatter(rowIndex, selectedMatter);
  }
  updateFormWithMatter(rowIndex: number, selectedMatter: any) {
    const control = this.getFormArray.controls[rowIndex];
    if (!control) return;

    const lawyerId = control.get('law_LawerId')?.value;
    const lang = localStorage.getItem('law8-LocalStore.lang') ?? 'en';

    control.patchValue({
      matterId: selectedMatter.value,
      mtrNo: selectedMatter.label,
      clientName: selectedMatter.clientName || '',
      law_TaskCodeId: null,
    });

    const rowKey = this.getRowKey(rowIndex);
    this.taskCodesByRow[rowKey] = [];
    this.loadTaskCodesByMatterId(Number(selectedMatter.value), rowIndex, true);

    this.fetchClientRate(selectedMatter.value, lawyerId, lang, rowIndex);
  }

  fetchClientRate(
    matterId: number,
    lawyerId: string,
    lang: string,
    rowIndex: number,
    callback?: () => void,
  ) {
    if (!lawyerId || !matterId) {
      console.warn(
        `fetchClientRate: missing lawyerId or matterId`,
        lawyerId,
        matterId,
      );
      return;
    }
    const taskCodeId = this.getFormArray.controls[rowIndex]?.get('law_TaskCodeId')?.value;
    this._apiService
      .get(API_Config.timesheet.getRateFromLawyerIdAndMatterId, {
        id: matterId,
        lawerId: lawyerId,
        taskCodeId: taskCodeId,
      })
      .subscribe({
        next: (res: any) => {
          if (res?.isSuccess && res.result) {
            console.log('Client Rate API response', res.result);

            const clientRate = {
              clientName: res.result.name,
              mtrNo: res.result.mtrNo ?? '',
              law_TaskCodeId: res.result.law_TaskCodeId ?? null,
              rate: res.result.rate ?? null,
            };

            const control = this.getFormArray.controls[rowIndex];
            if (control) {
              control.patchValue({
                clientName: clientRate.clientName,
                mtrNo: clientRate.mtrNo,
                law_TaskCodeId: clientRate.law_TaskCodeId,
                rate: clientRate.rate,
              });
              this.setAmountValue(rowIndex);
              this.tableValue = [...this.getFormArray.value];
            }

            if (callback) callback();
          } else {
            console.warn('fetchClientRate: API returned invalid response', res);
          }
        },
        error: (err) => console.error('fetchClientRate failed', err),
      });
  }

onTaskCodeChange(rowIndex: number) {
  const row = this.getFormArray.controls[rowIndex];

  const matterId = row.get('matterId')?.value;
  const lawyerId = row.get('law_LawerId')?.value;
  const taskCodeId = row.get('law_TaskCodeId')?.value;

  if (!matterId || !lawyerId || !taskCodeId) return;

  this._apiService
    .get(API_Config.timesheet.getRateFromLawyerIdAndMatterId, {
      id: matterId,
      lawerId: lawyerId,
      taskCodeId: taskCodeId,
    })
    .subscribe((res: any) => {
      if (res?.isSuccess) {
        row.patchValue({
          clientName: res.result.name,
          rate: res.result.rate,
        });

        this.setAmountValue(rowIndex);
      }
    });
}

  openAllMattersDialog(rowIndex: number) {
    if (!this.getFormArray.controls[rowIndex]) {
      console.warn(`openAllMattersDialog: no control at rowIndex ${rowIndex}`);
      return;
    }

    const allMatterDialogRef = this._dialogService.open(SharedMatterComponent, {
      width: '70%',
      header: 'Select Matter',
      data: {
        selectionMode: 'multiple',
        endpoint: API_Config.matters,
      },
      dismissableMask: true,
    });

    allMatterDialogRef.onClose
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: any) => {
          if (res && res.length > 0) {
            console.log('Selected matters from dialog', res);
            this.saveSelectedMatter(rowIndex, res[0]);
          }
        },
      });
  }

  updateTaskHoursSummary() {
    this.billableHoursCount = this.calculateHoursBasedOnTaskCode(
      this.TaskEnum.Billable,
    );
    this.nonBillableHoursCount = this.calculateHoursBasedOnTaskCode(
      this.TaskEnum.NonBillable,
    );
    this.noChargeHoursCount = this.calculateHoursBasedOnTaskCode(
      this.TaskEnum.NoCharge,
    );
  }
  private calculateHoursBasedOnTaskCode(taskCode: any): number {
    return this.getFormArray.value
      .filter((obj: any) => obj?.law_TaskCodeId === taskCode)
      .reduce((acc: number, curr: any) => acc + curr.hours, 0);
  }

  onDeleteRow(rowIndex: number, event?: Event): void {
    if (this.getFormArray.length <= 1) return;

    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const confirmDeleteRef: DynamicDialogRef = this._dialogService.open(
      SharedConfirmDialogComponent,
      {
        data: {
          type: ConfirmDialogType.Success,
          title: this._languageService.getTransValue(
            'timesheet.DeleteTimeSheet',
          ),
          message: this._languageService.getTransValue(
            'timesheet.areYouSureYouWantDeleteThisTimeSheet',
          ),
          btns: [
            {
              label: this._languageService.getTransValue('timesheet.cancel'),
              styleClass: 'border border-grey500 text-grey500',
              command: () => confirmDeleteRef.close(),
            },
            {
              label: this._languageService.getTransValue('timesheet.delete'),
              styleClass: 'bg-textErrorBase text-white',
              command: () => confirmDeleteRef.close(true),
            },
          ],
        },
      },
    );

    confirmDeleteRef.onClose.subscribe({
      next: (res) => {
        if (res) {
          const row = this.getFormArray.at(rowIndex);
          const rowId = row.get('id')?.value;

          if (!rowId) {
            row.get('isHidden')?.setValue(true);
            const selectedIndex = this.selectedRows.indexOf(row.value);
            if (selectedIndex !== -1)
              this.selectedRows.splice(selectedIndex, 1);

            this.updateTaskHoursSummary();
            return;
          }

          const param = { id: rowId };
          this._apiService
            .post(API_Config.timesheet.delete, {}, param)
            .pipe(this._unsubscribe.takeUntilDestroy())
            .subscribe({
              next: (res: ApiRes) => {
                if (res.isSuccess) {
                  row.get('isHidden')?.setValue(true);

                  const selectedIndex = this.selectedRows.indexOf(row.value);
                  if (selectedIndex !== -1)
                    this.selectedRows.splice(selectedIndex, 1);

                  this.updateTaskHoursSummary();
                } else {
                  this._toastrNotifiService.displayError(res.message);
                }
              },
              error: (err) => {
                this._toastrNotifiService.displayError('Failed to delete row');
              },
            });
        }
      },
    });
  }

  onSaveClick(rowData: any) {
    if (!this.selectedRows.includes(rowData)) {
      this.selectedRows = [...this.selectedRows, rowData];
    }
    this.onSubmit();
  }

  onSubmit(): void {
    this.selectedRows = this.selectedRows.map((row) => {
      const index = this.getFormArray.value.findIndex(
        (r: { rowIndex: any }) => r.rowIndex === row.rowIndex,
      );
      return this.getFormArray.at(index)?.value;
    });

    if (this.selectedRows.length === 0) {
      this._toastrNotifiService.displayError('Please Select At Least One Row');
      return;
    }

    const hasZeroHours = this.selectedRows.some((row) => row.hours == 0);
    if (hasZeroHours) {
      this._toastrNotifiService.displayError(
        'Time Value Should Be 0.1 Or Greater',
      );
      return;
    }
    const invalidRows = this.selectedRows.filter(
      (row) =>
        !row.matterId ||
        !row.law_TaskCodeId ||
        !row.explanationExplanation?.trim(),
    );

    if (invalidRows.length > 0) {
      this._toastrNotifiService.displayError(
        'Please complete all mandatory fields before submitting.',
      );
      return;
    }

    this.isSubmitting = true;

    const payload = this.selectedRows.map((row) => ({
      id: row.id ?? null,
      matterId: row.matterId,
      mtrNo: row.mtrNo ?? '',
      law_LawerId: row.law_LawerId ?? this._authService.getDecodedToken()['Id'],
      law_TaskCodeId: row.law_TaskCodeId,
      // tmDate: row.tmDate
      //   ? new Date(row.tmDate).toISOString()
      //   : new Date().toISOString(),
      tmDate: row.tmDate
        ? this._datePipe.transform(row.tmDate, 'yyyy-MM-dd')
        : this._datePipe.transform(new Date(), 'yyyy-MM-dd'),

      hours: row.hours ?? 0,
      rate: row.rate ?? 0,
      amount: row.amount ?? 0,
      explanationExplanation: row.explanationExplanation?.trim(),
      notes: row.notes ?? '',
      holdId: row.holdId ?? this.defaultHoldId,
    }));

    this._apiService
      .post(API_Config.timesheet.create, payload)
      .pipe(
        finalize(() => (this.isSubmitting = false)),
        this._unsubscribe.takeUntilDestroy(),
      )
      .subscribe({
        next: (res: ApiRes) => {
          if (res.isSuccess) {
            this.getFormArray.clear();
            this.selectedRows = [];
            this.getDraftTimesheet();
            this._toastrNotifiService.displaySuccess(res.message);
          } else {
            this._toastrNotifiService.displayError(res.message);
          }
        },
        error: (err) => {
          console.error(err);
          this._toastrNotifiService.displayError('Error submitting timesheet.');
        },
      });
  }

  filterOptions: any = { orderByDirection: 'ASC' };

  onSort(event: { field: string; order: number }) {
    // const newOrder = event.order === 1 ? 'ASC' : 'DESC';
    // if (
    //   this.filterOptions.orderBy === event.field &&
    //   this.filterOptions.orderByDirection === newOrder
    // ) {
    //   return;
    // }
    // this.table.value = [];
    // this.filterOptions = {
    //   orderBy: event.field,
    //   orderByDirection: newOrder,
    // };
    // this.getDraftTimesheet();
  }

  tableValue: any[] = [];

  trackByIndex(index: number, item: any): number {
    return index;
  }

  ngOnDestroy(): void {
    this._unsubscribe.destroy();
  }
}
