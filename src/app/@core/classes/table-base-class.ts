import { inject, InjectionToken } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LanguageService } from '@core/services';
import { FilterService } from 'primeng/api';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { UnsubscribeService } from '@shared/services/unsubscribe/unsubscribe.service';
import { PAGESIZE } from '../utilities/defines';

export const CUSTOM_UNSUBSCRIBE_TOKEN = new InjectionToken<UnsubscribeService>(
  'CustomUnsubscribeService',
  {
    providedIn: 'root',
    factory: () => new UnsubscribeService(),
  }
);

export abstract class TableBaseClass {
  isLoading: boolean = false;
  tableColumns: any[] = [];
  tableData: any[] = [];
  tempTableData: any[] = [];

  _languageService = inject(LanguageService);
  _dialogService = inject(DialogService);
  _dynamicDialogConfig = inject(DynamicDialogConfig);
  _dynamicDialogRef = inject(DynamicDialogRef);
  _route = inject(ActivatedRoute);
  _router = inject(Router);
  _unsubscribe = inject(CUSTOM_UNSUBSCRIBE_TOKEN);

  _filterService = inject(FilterService);

  abstract getTableData(): void;

  onFilter(filtersValues: any): void {}

  onPageChange(e: any) {
    this.getTableData();
  }
  onExportExcel(): void {}
}
