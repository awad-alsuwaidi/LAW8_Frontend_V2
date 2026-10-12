import { Component, inject, NgModule, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { ApiService } from 'src/app/@core/api/api.service';
import { ToastrNotifiService, LanguageService } from 'src/app/@core/services';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { SharedTableComponent } from 'src/app/@shared/components/shared-table/shared-table.component';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { SharedModule } from 'src/app/@shared/shared.module';
import { Security_Group_Assigned_Users_Columns } from './sg-assigned-users-editor-columns.config';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { User_Group_API } from 'src/app/@core/api/api-config/security/userGroup';
import { debounceTime, distinctUntilChanged, finalize, Subject } from 'rxjs';
import { SharedConfirmDialogComponent } from 'src/app/@shared/components/shared-confirm-dialog/shared-confirm-dialog.component';
import { ConfirmDialogType } from 'src/app/@shared/enums/confirm-dialog-type';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sg-assigned-users-editor',
  standalone: true,
  imports: [
    SharedButtonComponent,
    SharedTableComponent,
    SharedModule,
    FormsModule,
  ],
  templateUrl: './sg-assigned-users-editor.component.html',
  styleUrl: './sg-assigned-users-editor.component.scss',
})
export class SgAssignedUsersEditorComponent implements OnInit, OnDestroy {
  _apiService = inject(ApiService);
  _unsubscribeService = inject(UnsubscribeService);
  _dynamicDialogConfig = inject(DynamicDialogConfig);
  _dynamicDialogRef = inject(DynamicDialogRef);
  _toastrNotifiService = inject(ToastrNotifiService);
  _languageService = inject(LanguageService);
  protected _router = inject(Router);
  protected _route = inject(ActivatedRoute);
  private deleteDialogRef!: DynamicDialogRef;
  _dialogService = inject(DialogService);
  _unsubscribe = inject(UnsubscribeService);

  isLoading: boolean = false;
  isUpdate: boolean = false;
  data: any[] = [];
  columns: any[] = Security_Group_Assigned_Users_Columns;
  pagination: any = { pagSize: 10, pageNum: 1, orderByDirection: 'ASC' };
  first!: number;
  selectedRows: any[] = [];

  // getData() {
  //   // this.isLoading = true;
  //   this.data = dummyData;
  //   // this._apiService.get(API_Config.security.get, this.pagination).pipe(
  //   //   this._unsubscribeService.takeUntilDestroy()
  //   // ).subscribe({
  //   //   next: (res: ApiRes) => {
  //   //     if (res && res.isSuccess) {
  //   //       this.isLoading = false
  //   //       this.data = res.result.dataList;
  //   //       this.pagination.totalElements = res.result.totalCount
  //   //       this.pagination = { ...this.pagination };
  //   //       this.getSelectedGroupsByUserId()
  //   //     }

  //   //   }
  //   // })
  // }
  protected roleId: string | null = null;

  ngOnInit(): void {
    this.roleId = this._dynamicDialogConfig.data?.roleId;
    if (this.roleId) {
      this.getData(); // جلب أولي بدون سيرش
    }

    // ربط البحث بالـ API مع debounce
    this.searchSubject
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((term) => {
        this.pagination.pageNum = 1; // reset page عند البحث
        this.getData(term);
      });
  }
  onPageChange(e: any) {
    this.pagination.pagSize = Number(e.rows);
    this.pagination.pageNum = e.first / e.rows + 1;
    this.first = e?.first;
    this.getData(this.searchTerm); // مهم: يبعت نص البحث الحالي
  }

  searchTerm: string = '';
  allData: any[] = [];

  getData(searchText: string = '') {
    if (!this.roleId) return;

    const requestParams = {
      roleId: this.roleId,
      pageNum: this.pagination.pageNum,
      pagSize: this.pagination.pagSize,
      orderBy: this.pagination.orderBy,
      orderByDirection: this.pagination.orderByDirection,
      search: searchText, // هنا يبعت السيرش للـ API
    };

    this.isLoading = true;
    this._apiService
      .get(User_Group_API.userGroup.getUserToAddToRole, requestParams)
      .pipe(this._unsubscribeService.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res?.isSuccess) {
            this.data = res.result.dataList || [];
            this.pagination.totalElements = res.result?.totalCount || 0;
          }
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }

  searchSubject = new Subject<string>();

  getSelectedGroupsByUserId() {
    // const param = { userId: this._dynamicDialogConfig.data.userId }
    // this._apiService
    //   .get(API_Config.userGroup.getById, param)
    //   .pipe(this._unsubscribeService.takeUntilDestroy())
    //   .subscribe({
    //     next: (res: ApiRes) => {
    //       this.selectedRows = res['result'];
    //       this.isUpdate = this.data.length > 0
    //     },
    //   });
  }

  onRowSelectChange(e: any) {
    this.selectedRows = e;
  }
  onSearchChange() {
    this.searchSubject.next(this.searchTerm);
  }

  submit() {
    this.isLoading = true;

    const model = {
      roleId: this._dynamicDialogConfig.data.roleId,
      usersIds: this.selectedRows.map((user) => user.id),
    };

    this._apiService
      .post(API_Config.userGroup.AddUserToRole, model)
      .pipe(
        finalize(() => (this.isLoading = false)),
        this._unsubscribeService.takeUntilDestroy()
      )
      .subscribe({
        next: (res: ApiRes) => {
          const successMsg = this._languageService.getTransValue(
            'messages.createdSuccessfully'
          );
          this._toastrNotifiService.displaySuccess(successMsg);
          this._dynamicDialogRef.close({ success: true });
        },
      });
  }
  onSort(e: any) {
    if (!e || !e.field) return;

    const newOrderBy = e.field;
    const newOrderByDirection = e.order === 1 ? 'ASC' : 'DSC';

    if (
      this.pagination.orderBy === newOrderBy &&
      this.pagination.orderByDirection === newOrderByDirection
    ) {
      return;
    }

    this.pagination.orderBy = newOrderBy;
    this.pagination.orderByDirection = newOrderByDirection;
    this.pagination.pageNum = 1;
    this.first = 0;

    this.getData(this.searchTerm);
  }

  ngOnDestroy(): void {
    this._unsubscribeService.destroy();
    this.searchSubject.complete();
  }
}
