import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiService } from 'src/app/@core/api/api.service';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { LanguageService, ToastrNotifiService } from 'src/app/@core/services';
import { SharedTableComponent } from 'src/app/@shared/components/shared-table/shared-table.component';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { Security_Users_Group_Columns } from './security-users-editor-columns.config';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { SharedModule } from 'src/app/@shared/shared.module';
import { dummyData } from './security-users-groups.fake';
import { finalize } from 'rxjs';
import { SharedSkeletonGridComponent } from "src/app/@shared/components/shared-skeleton-grid/shared-skeleton-grid.component";
import { SharedSkeletonComponent } from "src/app/@shared/components/shared-skeleton/shared-skeleton.component";

@Component({
  selector: 'app-security-users-editor',
  standalone: true,
  imports: [
    SharedTableComponent,
    SharedButtonComponent,
    SharedModule,
    SharedSkeletonGridComponent,
    SharedSkeletonComponent
],
  templateUrl: './security-users-editor.component.html',
  styleUrl: './security-users-editor.component.scss'
})
export class SecurityUsersEditorComponent implements OnInit, OnDestroy {
  _apiService = inject(ApiService)
  _unsubscribeService = inject(UnsubscribeService);
  _dynamicDialogConfig = inject(DynamicDialogConfig);
  _dynamicDialogRef = inject(DynamicDialogRef);
  _toastrNotifiService = inject(ToastrNotifiService);
  _languageService = inject(LanguageService)

  _router = inject(Router)
  isLoading: boolean = false;
  isUpdate: boolean = false;
  data: any[] = dummyData;
  columns: any[] = Security_Users_Group_Columns;
  pagination: any = { pagSize: 10, pageNum: 1, orderByDirection: 'ASC', };
  first!: number;
  selectedRows: any[] = []
  ngOnInit(): void {
    this.getData()
  }

  getData() {
        this.isLoading = true
    this._apiService.get(API_Config.security.get, this.pagination).pipe(
      this._unsubscribeService.takeUntilDestroy()
    ).subscribe({
      next: (res: ApiRes) => {
        if (res && res.isSuccess) {
          this.isLoading = false
          this.data = res.result.dataList;
          this.pagination.totalElements = res.result.totalCount
          this.pagination = { ...this.pagination };
          this.getSelectedGroupsByUserId()
        }

      }
    })
  }

      onSort(e: any) {
    // التأكد من وجود event
    if (!e || !e.field) {
      return;
    }

    const newOrderBy = e.field;
    const newOrderByDirection = e.order === 1 ? 'ASC' : 'DSC'; // تصحيح المنطق: 1 = ASC, -1 = DESC

    // تجنب استدعاء API إذا كان الترتيب نفسه
    if (this.pagination.orderBy === newOrderBy &&
      this.pagination.orderByDirection === newOrderByDirection) {
      return;
    }

    // تحديث الترتيب
    this.pagination.orderBy = newOrderBy;
    this.pagination.orderByDirection = newOrderByDirection;
    this.pagination.pageNum = 1; // العودة للصفحة الأولى عند تغيير الترتيب
    this.first = 0;

    // استدعاء API
    this.getData();
  }
  onPageChange(e: any) {
    this.pagination.pagSize = Number(e.rows);
    this.pagination.pageNum = e.first / e.rows + 1;
    this.first = e?.first;
    this.getData()
  }
  onRowSelectChange(e: any) {
    this.selectedRows = e
  }
getSelectedGroupsByUserId() {
  const param = { userId: this._dynamicDialogConfig.data.userId };
  this._apiService
    .get(API_Config.userGroup.getById, param)
    .pipe(this._unsubscribeService.takeUntilDestroy())
    .subscribe({
      next: (res: ApiRes) => {
        console.log('Data from DB:', res['result']); 

        const dbIds = res['result'].map((r: any) => r.id);
        this.selectedRows = this.data.filter(d => dbIds.includes(d.id));

        console.log('Selected rows after mapping to table data:', this.selectedRows);
        this.isUpdate = this.data.length > 0;
      },
    });
}


submit() {
  this.isLoading = true;

  const model = {
    userId: this._dynamicDialogConfig.data.userId,
    itemIds: this.selectedRows.map((obj) => obj.id),
  };

  const path = this.isUpdate ? API_Config.userGroup.update : API_Config.userGroup.create;

  this._apiService.post(path, model)
    .pipe(
      finalize(() => this.isLoading = false),
      this._unsubscribeService.takeUntilDestroy()
    )
    .subscribe({
      next: (res: ApiRes) => {
        const successMsgKey = this.isUpdate ? 'messages.updateSuccessfully' : 'messages.createdSuccessfully';
        const text = this._languageService.getTransValue(successMsgKey);
        this._toastrNotifiService.displaySuccess(text);
        this._apiService.get(API_Config.userssecurity.get, this.pagination)
          .pipe(this._unsubscribeService.takeUntilDestroy())
          .subscribe({
            next: (res: ApiRes) => {
              if (res && res.isSuccess) {
                this.data = [...res.result.dataList];
                this.pagination.totalElements = res.result.totalCount;
                this.pagination = { ...this.pagination };

                const selectedIds = model.itemIds;
                this.selectedRows = this.data.filter(d => selectedIds.includes(d.id));
              }
            }
          });

        this._dynamicDialogRef.close(true);
      }
    });
}



  ngOnDestroy(): void {
    this._unsubscribeService.destroy()
  }
}

