import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { SharedTableComponent } from 'src/app/@shared/components/shared-table/shared-table.component';
import { MatterClassDto } from 'src/app/pages/matters/interfaces/matter-class.interface';
import { Matter_Class_Columns } from '../matter-class-columns.config';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiService } from 'src/app/@core/api/api.service';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { ToastrNotifiService } from 'src/app/@core/services';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-matter-class-add',
  standalone: true,
  imports: [
    SharedTableComponent,
    SharedButtonComponent,
    TranslateModule
  ],
  templateUrl: './matter-class-add.component.html',
  styleUrl: './matter-class-add.component.scss'
})
export class MatterClassAddComponent implements OnInit, OnDestroy {
  _apiService = inject(ApiService)
  _unsubscribeService = inject(UnsubscribeService);
  _dynamicDialogConfig = inject(DynamicDialogConfig);
  _dynamicDialogRef = inject(DynamicDialogRef);
  _toastrNotifiService = inject(ToastrNotifiService);
  _router=inject(Router)
  isLoading: boolean = false
  data: MatterClassDto[] = [];
  columns: any[] = Matter_Class_Columns;
  pagination: any = { pagSize: 5, pageNum: 1, orderByDirection: 'ASC', };
  first!: number;
  selectedClass: MatterClassDto[] = []
  ngOnInit(): void {
    this.getClass()
  }

  getClass() {
    this.pagination = {
      ...this.pagination,
      matterId: this._dynamicDialogConfig.data.matterIdentifier,
    };
    this._apiService.get(API_Config.Class.get, this.pagination).pipe(
      this._unsubscribeService.takeUntilDestroy()
    ).subscribe({
      next: (res: ApiRes) => {
        if (res && res.isSuccess) {
          this.data = res.result.dataList;
          this.pagination.totalElements = res.result.totalCount
          this.pagination = { ...this.pagination }
        }

      }
    })
  }
  onPageChange(e: any) {
    this.pagination.pagSize = Number(e.rows);
    this.pagination.pageNum = e.first / e.rows + 1;
    this.first = e?.first;
    this.getClass()
  }
  onRowSelectChange(e: any) {
    this.selectedClass = e
  }

  submit() {

    const requestPayload = {
      law_MatterClassCreateList: this.selectedClass.map(obj => {
        return {
          ...obj,
          law_MatterId: this._dynamicDialogConfig.data.matterIdentifier
        }
      }
      ),
    };
    if (this._router.url.includes('add')) {
      this._dynamicDialogRef.close(this.selectedClass);
      return
    }
    this._apiService
      .post(API_Config.matterClass.create, requestPayload)
      .pipe(this._unsubscribeService.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res && res.isSuccess) {
            this._toastrNotifiService.displaySuccess(res?.message);
            this._dynamicDialogRef.close(true);
          } else {
            this._toastrNotifiService.displayError(res?.message);
          }
        },
        error: (err: any) => {
          this._toastrNotifiService.displayError(err?.error?.message);
        },
      });
  }

  ngOnDestroy(): void {
    this._unsubscribeService.destroy()
  }
}
