import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { LanguageService } from 'src/app/@core/services';
import { PAGESIZE } from 'src/app/@core/utilities/defines';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { SharedEmptySectionComponent } from 'src/app/@shared/components/shared-empty-section/shared-empty-section.component';
import { SharedSearchComponent } from 'src/app/@shared/components/shared-search/shared-search.component';
import { SharedModule } from 'src/app/@shared/shared.module';
import { MATTERS_LIST } from './lookups-matters-list.data';
import { PermissionService } from 'src/app/@core/services/permission.service';

@Component({
  selector: 'app-lookups-matters-list',
  standalone: true,
  imports: [
    RouterOutlet,
    SharedEmptySectionComponent,
    SharedButtonComponent,
    SharedModule,
    SharedSearchComponent,
  ],
  templateUrl: './lookups-matters-list.component.html',
  styleUrl: './lookups-matters-list.component.scss'
})
export class LookupsMattersListComponent {
  _router = inject(Router);
  _route = inject(ActivatedRoute);
  _languageService = inject(LanguageService);
  _permsissionsService = inject(PermissionService);
  data: any[] = [];
  totalCount: number = 0;
  filterOptions: any = {
    pageNumber: 1,
    pageSize: PAGESIZE,
    orderByDirection: 'ASC',
  };
  searchText: string = '';
  ngOnInit(): void {
    this.getData()
  }
getData() {
  this.data = MATTERS_LIST.filter(item =>
    this._permsissionsService.hasPermission(item.permission)
  );
  if (this.data.length) {
    const currentId = this._route.snapshot.firstChild?.params['id'];

    if (!currentId) {
      this.openSubMatterList(this.data[0]);
    }
  }
}

openSubMatterList(subMatterList: any) {
  this._router.navigate(
    [subMatterList.id],
    { relativeTo: this._route }
  );
}


  searchValueChange(value: string): void {
    this.searchText = value
    this.filterOptions.search = value;
    this.filterOptions = { ...this.filterOptions }
    this.getData();
  }
  onPageChange(event: any): void {
    this.filterOptions.pagSize = Number(event.rows);
    this.filterOptions.pageNum = event.first / event.rows + 1;
    this.filterOptions = { ...this.filterOptions }
    this.getData();
  }

  isActiveItem(id: number): boolean {
  const currentUrl = this._router.url;

  if (id === 7) {
    return (
      currentUrl.endsWith('/7') ||
      currentUrl.endsWith('/13')
    );
  }

  return currentUrl.endsWith(`/${id}`);
}
}
