import { CommonModule } from '@angular/common';
import {
  Component,
  ContentChild,
  EventEmitter,
  inject,
  input,
  Input,
  InputSignal,
  OnChanges,
  Output,
  SimpleChanges,
  TemplateRef,
} from '@angular/core';
import {
  TableModule,
  TableRowSelectEvent,
  TableRowUnSelectEvent,
} from 'primeng/table';
import { SharedModule } from '../../shared.module';
import { PaginatorModule } from 'primeng/paginator';
import { AuthService, LanguageService } from 'src/app/@core/services';
import { PAGE_SIZE_OPTION, PAGESIZE } from 'src/app/@core/utilities/defines';
import { SharedStatusComponent } from '../shared-status/shared-status.component';
import { TooltipModule } from 'primeng/tooltip';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputSwitchChangeEvent } from 'primeng/inputswitch';
import { SkeletonModule } from 'primeng/skeleton';
import { CheckboxModule } from 'primeng/checkbox';
import { EmptyConfig } from '../shared-empty-section/interface/empty-config.interface';
import { SharedEmptySectionComponent } from '../shared-empty-section/shared-empty-section.component';
import { SortEvent } from 'primeng/api';
import { HighlightPipe } from '../../pipes/highlight.pipe';

@Component({
  selector: 'app-shared-table',
  standalone: true,
  imports: [
    TableModule,
    CommonModule,
    SharedModule,
    PaginatorModule,
    SharedStatusComponent,
    TooltipModule,
    AvatarModule,
    AvatarGroupModule,
    InputSwitchModule,
    SkeletonModule,
    CheckboxModule,
    SharedEmptySectionComponent,
    HighlightPipe,
  ],
  templateUrl: './shared-table.component.html',
  styleUrl: './shared-table.component.scss',
})
export class SharedTableComponent implements OnChanges {
  _languageService = inject(LanguageService);
  @Input() withPagination: boolean = true;
  @Input() paginationClient: boolean = false;
  @Input() withCheckbox!: boolean;
  @Input() selectedRows: any[] = [];
  data: InputSignal<any> = input();
  @Input() columns: any[] = [];
  rows: number = 10;
  @Input() statusConfig: any;
  @Input() styleClass: any;
  @Input() selectionMode: any;
  @Input() resizableColumns: boolean = false;
  @Input() isLoading!: boolean;
  @Input() freezeActions: boolean = false;
  @Output() onPageChange = new EventEmitter();
  @Output() onRowSelectChange = new EventEmitter();
  @Output() onToggleSwitch = new EventEmitter();
  @Output() onSort = new EventEmitter();
  @Output() filterChange = new EventEmitter<any>();
  @Input() first: number = 0;
  @Output() onCheck = new EventEmitter();
  @ContentChild('columnActions', { static: false })
  columnActionsTemplateRef?: TemplateRef<any>;
  private authService = inject(AuthService);
  @Input() pagination: any = {
    pageSize: 10,
    pageNumber: 1,
    totalElements: 0,
    sortBy: 'nameEn',
    isDescending: false,
  };
  @ContentChild('customColumn', { static: false })
  customColumnTemplateRef?: TemplateRef<any>;
  emptyConfig: EmptyConfig = {
    messageTitle: this._languageService.getTransValue('common.nodataavailable'),
    addPermission: '',
  };
  @Input() searchValue: string = '';
  private originalColumns: any[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['columns']?.currentValue) {
      this.originalColumns = [...changes['columns'].currentValue];
      this.columns = this.originalColumns.filter(
        (col) =>
          !col.requiredPermission ||
          this.authService.hasPermission(col.requiredPermission),
      );
    }

    if (changes['pagination']?.currentValue) {
      this.getTableMessages();

      // ★ دعم الشكلين — pageNumber/pageSize أو pageNum/pagSize
      const pageNumber =
        this.pagination?.pageNumber ?? this.pagination?.pageNum ?? 1;
      const pageSize =
        this.pagination?.pageSize ?? this.pagination?.pagSize ?? 10;

      this.first = (Number(pageNumber) - 1) * Number(pageSize);
      this.rows = Number(pageSize);

      console.log('📊 Pagination synced:', {
        pageNumber,
        pageSize,
        first: this.first,
        totalElements: this.pagination?.totalElements,
      });
    }
  }

  getTableMessages(): void {
    const total = this.pagination?.totalElements ?? 0;
    this.currentPageReportTemplate = `${this._languageService.getTransValue(
      'messages.dataMessage',
    )} ${total}`;
  }

  @Input() isTimesheet: boolean = false;
  onPageSizeChange(size: number) {
    this.rows = size;

    if (this.paginationClient) return;

    this.pageChanged({
      rows: size,
      first: 0,
      page: 0,
    });
  }

  onFilter(field: string, value: any) {
    this.filterChange.emit({ field, value });
  }

  currentPageReportTemplate: string = this._languageService.getTransValue(
    'messages.dataMessage',
  );
  PAGE_SIZE_OPTION = PAGE_SIZE_OPTION;

  pageChanged(e?: any) {
    if (e) {
      this.pagination.pageSize = Number(e.rows);
      this.pagination.pageNumber = e.page + 1;

      this.pagination.pagSize = Number(e.rows);
      this.pagination.pageNum = e.page + 1;

      this.first = e.first;
      this.onPageChange.emit(e);
    }
  }
  onRowSelect(e: TableRowSelectEvent) {
    this.onRowSelectChange.emit(this.selectedRows);
  }
  onCheckRow(e: any) {
    this.onCheck.emit(e);
  }
  getInitials(fullName: string): string {
    if (!fullName) return '';

    const parts = fullName.trim().split(' ');

    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase() + '.';
    }

    return parts.map((p) => p.charAt(0).toUpperCase()).join('. ') + '.';
  }

  onRowUnselect(e: TableRowUnSelectEvent) {
    this.onRowSelectChange.emit(this.selectedRows);
  }

  highlightRow(rowData: any) {
    return this.selectedRows.some((obj: any) => obj.id === rowData.id);
  }
  onSwitch(e: InputSwitchChangeEvent, rowData: any, col: string) {
    const switchData = {
      value: e.checked,
      rowData,
      col,
    };
    this.onToggleSwitch.emit(switchData);
  }

  // getSort(event: SortEvent) {
  //   console.log('Sort event:', event);

  //   this.pagination.orderBy = event.field;
  //   this.pagination.orderByDirection = event.order === 1 ? 'ASC' : 'DSC';
  //   this.onSort.emit(event);
  // }
  //   getSort(event: SortEvent) {
  //   console.log('Sort emitted from shared:', event.field);
  //   this.onSort.emit({ field: event.field });
  // }

  get currentSortField(): string {
    return this.pagination?.sortBy ?? this.pagination?.orderBy ?? '';
  }

  get currentSortOrder(): number {
    if (typeof this.pagination?.isDescending === 'boolean') {
      return this.pagination.isDescending ? -1 : 1;
    }
    return this.pagination?.orderByDirection === 'DESC' ? -1 : 1;
  }
  getSort(event: SortEvent) {
    const isDescending = event.order === -1;

    if (this.pagination) {
      this.pagination.sortBy = event.field;
      this.pagination.isDescending = isDescending;

      this.pagination.orderBy = event.field;
      this.pagination.orderByDirection = isDescending ? 'DESC' : 'ASC';
    }
    this.onSort.emit({
      field: event.field,
      order: event.order,
      sortBy: event.field,
      isDescending: isDescending,
    });
  }
}
