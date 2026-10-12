import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TabMenuModule } from 'primeng/tabmenu';

import { LanguageService } from 'src/app/@core/services';
import { PermissionService } from 'src/app/@core/services/permission.service';
import { SharedModule } from 'src/app/@shared/shared.module';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { LookupsSubMatterListComponent } from '../lookups-sub-matter-list/lookups-sub-matter-list.component';

@Component({
  selector: 'app-lookups-billing-task-tabs',
  standalone: true,
  imports: [SharedModule, TabMenuModule, LookupsSubMatterListComponent],
  templateUrl: './lookups-billing-task-tabs.component.html',
})
export class LookupsBillingTaskTabsComponent implements OnInit, OnDestroy {
  private _permission = inject(PermissionService);
  private _lang = inject(LanguageService);
  private _router = inject(Router);
  private _route = inject(ActivatedRoute);
  private _unsubscribe = inject(UnsubscribeService);

  selectedGroupId = 7;
  tabs: any[] = [];
  activeItem: any;

  ngOnInit(): void {
    this.tabs = [
      {
        id: 7,
        label: this._lang.getTransValue('common.codes'),
        command: () => this.goTo(7),
      },
      ...(this._permission.hasPermission('View_Law_TaskCodesGroup') ||
      this._permission.hasPermission('TaskCodeGroups', 'canRead')
        ? [
            {
              id: 13,
              label: this._lang.getTransValue('common.groups'),
              command: () => this.goTo(13),
            },
          ]
        : []),
    ];

    this._router.events.pipe(this._unsubscribe.takeUntilDestroy()).subscribe(() => {
      this.syncFromUrl();
    });

    this.syncFromUrl();
  }

  ngOnDestroy(): void {
    this._unsubscribe.destroy();
  }

  // ============================================================
  // ★ يقرأ الـ id من الـ URL في كل مرة
  // ============================================================
  private syncFromUrl(): void {
    const url = this._router.url;
    const parts = url.split('/').filter(Boolean);
    const lastPart = parts[parts.length - 1];
    const id = Number(lastPart);

    if ([7, 13].includes(id) && id !== this.selectedGroupId) {
      this.selectedGroupId = id;
      this.activeItem = this.tabs.find((t) => t.id === id) ?? this.tabs[0];
    } else if (!this.activeItem) {
      // أول مرة
      this.activeItem =
        this.tabs.find((t) => t.id === this.selectedGroupId) ?? this.tabs[0];
    }
  }

  private goTo(id: number): void {
    this.selectedGroupId = id;
    this.activeItem = this.tabs.find((t) => t.id === id) ?? this.tabs[0];

    // ★ استخدم navigateByUrl عشان الـ URL يتغير بشكل صريح
    this._router.navigate(['/lookups/matters-list', id]);
  }
}