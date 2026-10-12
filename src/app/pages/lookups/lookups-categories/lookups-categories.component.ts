import { Component, effect, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PaginatorModule } from 'primeng/paginator';
import { ApiService } from 'src/app/@core/api/api.service';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { EmptyConfig } from 'src/app/@shared/components/shared-empty-section/interface/empty-config.interface';
import { SharedEmptySectionComponent } from 'src/app/@shared/components/shared-empty-section/shared-empty-section.component';
import { SharedSearchComponent } from 'src/app/@shared/components/shared-search/shared-search.component';
import { ToggleFormService } from 'src/app/@shared/modules/formly-config/services/toggle-form.service';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { SharedModule } from 'src/app/@shared/shared.module';
import { LookupCategoryDto } from './interfaces/lookup-category.interface';
import { SharedStatusComponent } from 'src/app/@shared/components/shared-status/shared-status.component';
import { lookupCategory_statusConfig } from './lookups-categories-status.config';
import { LookupsCategoriesService } from './services/lookups-categories.service';
import { DialogService } from 'primeng/dynamicdialog';
import { LookupsCategoryEditorComponent } from './components/lookups-category-editor/lookups-category-editor.component';
import { LanguageService } from 'src/app/@core/services';
import { Lookups_API } from 'src/app/@core/api/api-config/lookups';

@Component({
  selector: 'app-lookups-categories',
  standalone: true,
  imports: [
    RouterModule,
    SharedModule,
    SharedButtonComponent,
    SharedEmptySectionComponent,
    SharedSearchComponent,
    PaginatorModule,
    SharedStatusComponent,
  ],
  templateUrl: './lookups-categories.component.html',
  styleUrl: './lookups-categories.component.scss',
})
export class LookupsCategoriesComponent implements OnInit, OnDestroy {
  _router = inject(Router);
  _route = inject(ActivatedRoute);
  _apiService = inject(ApiService);
  _toggleFormService = inject(ToggleFormService);
  _unsubscribeService = inject(UnsubscribeService);
  _lookupsCategoriesService = inject(LookupsCategoriesService);
  _dialogService = inject(DialogService);
  _languageService = inject(LanguageService);
  data: LookupCategoryDto[] = [];
  statusConfig = lookupCategory_statusConfig;
  totalCount: number = 0;
  filterOptions: any = {
    pageNumber: 1,
    pageSize: 10,
    orderByDirection: 'ASC',
  };
  searchText: string = '';
  emptyConfig: EmptyConfig = {
    title: 'Categories',

    addPermission: 'Add_MatterCategory',
    addButton: {
      label: this._languageService.getTransValue('lookups.newCategory'),
      command: () => {
        this.openCategoryEditor();
      },
    },
  };
  selectedCategory: LookupCategoryDto | null = null;

  ngOnInit(): void {
    this.getData();
    this._lookupsCategoriesService.refresh$
      .pipe(this._unsubscribeService.takeUntilDestroy())
      .subscribe(() => {
        this.getData();
      });
  }

  openSubCategory(category: LookupCategoryDto) {
    this.selectedCategory = category;
    this._lookupsCategoriesService.setLookupCategoryDetails(category);
    this._router.navigate(['/lookups/categories/', category.id]);
  }

  getData() {
    this._apiService
      .get(Lookups_API.matterCategories.get, this.filterOptions)
      .pipe(this._unsubscribeService.takeUntilDestroy())
      .subscribe({
        next: (res: any) => {
          const body = res?.data ?? res?.result ?? res;
          const list = body?.items ?? body?.dataList ?? [];
          this.data = list.map((item: any) => ({
            id: item.id,
            nameEn: item.nameEn,
            nameAr: item.nameAr,
            active: item.isActive,
            isActive: item.isActive,
            practiceAreaId: item.practiceAreaId,
            practiceArea: item.practiceAreaName,
            practsAreaId: item.practiceAreaId,
            practsArea: item.practiceAreaName,
            hasClasses: item.hasClasses,
          }));

          this.totalCount = body?.totalCount ?? 0;
          if (
            !this._lookupsCategoriesService.getLookupCategoryDetails() &&
            this.data.length
          ) {
            this.selectedCategory = this.data[0];
            this.openSubCategory(this.selectedCategory);
          } else {
            this.selectedCategory =
              this._lookupsCategoriesService.getLookupCategoryDetails() ?? null;
          }
        },
        error: (err) => {
          console.error('Failed to load categories:', err);
          this.data = [];
          this.totalCount = 0;
        },
      });
  }

  onPageChange(event: any): void {
    this.filterOptions.pagSize = Number(event.rows);
    this.filterOptions.pageNumber = Math.floor(event.first / event.rows) + 1;
    this.filterOptions = { ...this.filterOptions };
    this.getData();
  }

  openCategoryEditor() {
    const ref = this._dialogService.open(LookupsCategoryEditorComponent, {
      header: this._languageService.getTransValue('lookups.newCategory'),
      width: '40vw',
    });
    ref.onClose.pipe(this._unsubscribeService.takeUntilDestroy()).subscribe({
      next: (res) => {
        if (res) {
          this.getData();
        }
      },
    });
  }

  searchValueChange(value: string): void {
    this.searchText = value;
    this.filterOptions.search = value;
    this.filterOptions = { ...this.filterOptions };
    this.getData();
  }

  redirectToFirstClientInList() {
    this._router.navigate(['view/', this.data[0]?.id], {
      relativeTo: this._route,
    });
  }
  ngOnDestroy(): void {
    this._unsubscribeService.destroy();
  }
}
