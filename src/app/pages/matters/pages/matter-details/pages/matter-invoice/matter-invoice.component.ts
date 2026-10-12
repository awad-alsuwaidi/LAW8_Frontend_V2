import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { SharedModule } from 'src/app/@shared/shared.module';
import { Matter_Invoice_Columns } from './matter-invoice-columns.config';
import { MatterInvoiceDto } from 'src/app/pages/matters/interfaces/matter-invoice.interface';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiService } from 'src/app/@core/api/api.service';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { LanguageService } from 'src/app/@core/services';
import { PermissionService } from 'src/app/@core/services/permission.service';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { Router } from '@angular/router';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-matter-invoice',
  standalone: true,
  imports: [TableModule, SharedModule, PaginatorModule, SharedButtonComponent],
  templateUrl: './matter-invoice.component.html',
  styleUrl: './matter-invoice.component.scss',
})
export class MatterInvoiceComponent implements OnInit, OnDestroy {
  _permissionService = inject(PermissionService);

  _languageService = inject(LanguageService);
  _unsubscribeService = inject(UnsubscribeService);
  _apiService = inject(ApiService);
  _router = inject(Router);
  data: MatterInvoiceDto[] = [];
  totalRecords: number = 0;
  columns = Matter_Invoice_Columns;
  matterInvoiceColumns = Matter_Invoice_Columns;
  filterOptions: any = {
    pageNum: 1,
    pagSize: 10,
    orderByDirection: 'ASC',
  };
  sortField = '';
 sortOrder = 1;
 
  @Input() set id(value: number) {
    this.matterIdentifier = value;
  }
  matterIdentifier?: number;
  ngOnInit(): void {
    this.getData();
  }

  isLoading!: boolean;

  getData() {
    this.filterOptions.matterId = this.matterIdentifier;
    this.isLoading = true;

    this._apiService
      .get(API_Config.matterInvoice.get, this.filterOptions)
      .pipe(
        this._unsubscribeService.takeUntilDestroy(),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: (res: ApiRes) => {
          if (res.isSuccess) {
            this.data = res.result.dataList;
            this.totalRecords = res.result.totalCount;
          } else {
            this.data = [];
            this.totalRecords = 0;
          }
        },
        error: (err) => {
          //console.error('Error fetching invoices:', err);
          this.data = [];
          this.totalRecords = 0;
        },
      });
  }
onSort(event: any): void {
  this.sortField = event.field;
  this.sortOrder = event.order;

  this.filterOptions.orderBy = event.field;
  this.filterOptions.orderByDirection =
    event.order === 1 ? 'ASC' : 'DESC';

  this.filterOptions.pageNum = 1;

  this.getData();
}


  onPageChange(event: PaginatorState): void {
    const page = (event.first ?? 0) / (event.rows ?? 10);
    this.filterOptions.pageNum = page + 1;
    this.filterOptions.pagSize = event.rows ?? 10;

    this.getData();
  }
  createInvoice() {
    this._router.navigate(['/billing/bills/add'], {
      queryParams: {
        matterId: this.matterIdentifier,
      },
    });
  }
  ngOnDestroy(): void {
    this._unsubscribeService.destroy();
  }
}
