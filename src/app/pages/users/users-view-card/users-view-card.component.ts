import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { PaginatorModule } from 'primeng/paginator';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { SharedSearchComponent } from 'src/app/@shared/components/shared-search/shared-search.component';
import { SharedModule } from 'src/app/@shared/shared.module';
import { UserDto } from '../interfaces/user.interface';
import { PAGESIZE } from 'src/app/@core/utilities/defines';
import { finalize } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiService } from 'src/app/@core/api/api.service';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { UsersToggleViewComponent } from '../components/users-toggle-view/users-toggle-view.component';
import { UsersTimesheetEditorComponent } from '../components/users-timesheet-editor/users-timesheet-editor.component';
import { Router } from '@angular/router';
import { HighlightPipe } from 'src/app/@shared/pipes/highlight.pipe';

@Component({
  selector: 'app-users-view-card',
  standalone: true,
  imports: [
    SharedSearchComponent,
    SharedButtonComponent,
    PaginatorModule,
    SharedModule,
    UsersToggleViewComponent,
    UsersTimesheetEditorComponent,HighlightPipe
  ],
  templateUrl: './users-view-card.component.html',
  styleUrl: './users-view-card.component.scss'
})
export class UsersViewCardComponent implements OnInit, OnDestroy {
  searchValue = '';

  private _apiService = inject(ApiService);
  private _unsubscribe = inject(UnsubscribeService);
  private _router = inject(Router);

  first: number = 0;
  isLoading!: boolean;
  data: UserDto[] = [];
  pagination: any = {
    pageNum: 1,
    pagSize: PAGESIZE,
    orderByDirection: 'ASC',
  };

  ngOnInit(): void {
    this.getData();
  }

searchValueChange(value: string): void {
  this.searchValue = value; 
  this.pagination.search = value;
  this.pagination = { ...this.pagination };
  this.getData();
}


  onPageChange(event: any): void {
    this.first = event.first;
    this.pagination.pagSize = Number(event.rows);
    this.pagination.pageNum = event.first / event.rows + 1;
    this.pagination = { ...this.pagination };
    this.getData();
  }

getData() {
  this.isLoading = true;

  this._apiService
    .get(API_Config.users.get, this.pagination)
    .pipe(
      finalize(() => (this.isLoading = false)),
      this._unsubscribe.takeUntilDestroy()
    )
    .subscribe((res: any) => {
      const body = res?.data ?? res?.result ?? {};
      const items: any[] = body?.items ?? body?.dataList ?? [];

      this.data = items.map((obj: any) => ({
        id: obj.id,
        userName: obj.userName,
        email: obj.email,
        nameEn: obj.nameEn,
        nameAr: obj.nameAr,
        name: obj.nameEn ?? obj.nameAr ?? obj.userName ?? '',
        profileImageUrl: obj.profileImageUrl ?? null,
        roles: obj.roles ?? [],
        roleLabel: Array.isArray(obj.roles) && obj.roles.length
          ? obj.roles.join(', ')
          : '',

        phoneNumber: obj.phoneNumber ?? null,
        active: obj.active ?? false,
        locked: obj.locked ?? false,
        timesheetDate: obj.timesheetDate ?? obj.createdAtUtc ?? null,
        empNo: null,
        initial: '',
        industryId: 0,
        titleId: 0,
        departmentId: 0,
        branchId: 0,
        mobile2: null,
        phone: null,
        defaultUserId: null,
        goal: null,
        indst: null,
        depart: null,
        title: null,
      })) as any;

      this.pagination.totalElements = body?.totalCount ?? 0;

      if (this.data.length > 0 && this.data[0].id) {
        this._router.navigate(['/users/view', this.data[0].id], {
          replaceUrl: true,
        });
      }
    });
}

  ngOnDestroy(): void {
    this._unsubscribe.destroy();
  }
}
