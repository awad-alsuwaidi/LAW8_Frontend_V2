import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { LocationStrategy } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiService } from 'src/app/@core/api/api.service';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { HighlightPipe } from 'src/app/@shared/pipes/highlight.pipe';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { SharedModule } from 'src/app/@shared/shared.module';

@Component({
  selector: 'app-advanced-search',
  standalone: true,
  imports: [
    FormlyConfigModule,
    SharedModule,
    HighlightPipe,
    SharedButtonComponent,
    RouterModule,
  ],
  providers: [HighlightPipe],
  templateUrl: './app-advanced-search.component.html',
  styleUrl: './app-advanced-search.component.scss',
  animations: [
    trigger('openClose', [
      state(
        'open',
        style({
          opacity: 1,
          transform: 'translateY(0)',
          visibility: 'visible',
        }),
      ),
      state(
        'closed',
        style({
          opacity: 0,
          transform: 'translateY(-20px)',
          visibility: 'hidden',
        }),
      ),
      transition('open => closed', [animate('0.2s')]),
      transition('closed => open', [animate('0.2s')]),
    ]),
  ],
})
export class AppAdvancedSearchComponent implements OnInit {
  _unsubscribe = inject(UnsubscribeService);
  _router = inject(Router);
  
  formly: FormGroup = new FormGroup({});
  formlyFields: FormlyFieldConfig[] = [];
  formlyModel: any = {};
  isOpen = false;
  loading = false;
  searchValue = '';
  searchResult: {
    code: string;
    name: string;
    desc: string;
    category: string;
  }[] = [];
  private locationStrategy = inject(LocationStrategy);
  private _apiService = inject(ApiService);
  private router = inject(Router);
  ngOnInit(): void {
    this.initForm();
  }

  openInNewTab() {
    const url = `${window.location.origin}/#/advanced-search`;
    window.open(url, '_blank');
  }

  initForm(): void {
    this.formlyFields = [
      {
        type: 'input',
        key: 'search',
        className: 'relative text-grey400 border-grey200 search-input',
        props: {
          class: 'transition-all duration-200 ease-in-out z-20',
          placeholder: 'topBar.search',
          icon: 'icon-search',
          withClear: true,
          attributes: {
            autocomplete: 'off',
          },
          input: (e: any) => {
            this.searchValue = e.target.value;
            this.onSearch(e);
          },
          focus: () => {
            this.isOpen = true;
          },
          blur: () => {
            this.isOpen = false;
          },
        },
      },
    ];
  }

  // onSearch(event: any): void {
  //   const input = (event.target as HTMLInputElement)?.value?.trim();

  //   if (input.length > 2) {
  //     this.loading = true; // ✅ بدأ التحميل
  //     const body = { search: input };

  //     this._apiService
  //       .get(API_Config.search.quickSearch, body)
  //       .pipe(this._unsubscribe.takeUntilDestroy())
  //       .subscribe({
  //         next: (res: ApiRes) => {
  //           if (res?.isSuccess && Array.isArray(res.result)) {
  //             this.searchResult = res.result.map((item) => ({
  //               code: item.code,
  //               name: item.name,
  //               desc: item.courtNumber || '',
  //               category: item.module || item.lable || 'Unknown',
  //               id: item.id,
  //             }));
  //             this.isOpen = true;
  //           } else {
  //             this.searchResult = [];
  //             this.isOpen = false;
  //           }
  //           this.loading = false; // ✅ التحميل خلص
  //         },
  //         error: () => {
  //           this.searchResult = [];
  //           this.isOpen = false;
  //           this.loading = false; // ✅ التحميل خلص حتى في الخطأ
  //         },
  //       });
  //   } else {
  //     this.searchResult = [];
  //     this.isOpen = false;
  //     this.loading = false;
  //   }
  // }

  onSearch(event: any): void {
    const input = (event.target as HTMLInputElement)?.value?.trim();
    if (!input) {
      this.searchResult = [];
      this.isOpen = false;
      this.loading = false;
      return;
    }

    this.isOpen = true;
    this.loading = true;
    const formattedSearch = input.replace(/\s+/g, '%20');

    const body = { search: formattedSearch };

    this._apiService
      .get(API_Config.search.quickSearch, body)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res?.isSuccess && Array.isArray(res.result)) {
            this.searchResult = res.result.map((item) => ({
              code: item.code,
              name: item.name,
              desc: item.courtNumber || '',
              category: item.module || item.lable || 'Unknown',
              id: item.id,
            }));
          } else {
            this.searchResult = [];
          }
          this.loading = false;
        },
        error: () => {
          this.searchResult = [];
          this.loading = false;
        },
      });
  }

selectItem(item: any): void {
  const targetRoute =
    item?.category === 'Matter'
      ? ['/matters', item?.id]
      : ['/clients/view', item?.id];

  // لو كلاينت، ابعت الـ code كـ search query param عشان الليست الشمال تتفلتر وتظهره
  const queryParams =
    item?.category === 'Matter' ? undefined : { search: item.code };

  this._router.navigate(targetRoute, { queryParams });
  this.isOpen = false;
}
}
