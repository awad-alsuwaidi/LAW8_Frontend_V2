import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { TabMenuModule } from 'primeng/tabmenu';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { SharedModule } from 'src/app/@shared/shared.module';
import { MatterService } from './services/matter.service';
import { PermissionService } from 'src/app/@core/services/permission.service';
import { LanguageService } from 'src/app/@core/services';

@Component({
  selector: 'app-matters',
  standalone: true,
  imports: [SharedModule, SharedButtonComponent, TabMenuModule],
  templateUrl: './matters.component.html',
  styleUrl: './matters.component.scss',
})
export class MattersComponent implements OnInit {
  _router = inject(Router);
  _route = inject(ActivatedRoute);
  _matterService = inject(MatterService);
  _permissionService = inject(PermissionService);
  _languageService = inject(LanguageService);

  items: MenuItem[] = [
    {
      label: this._languageService.getTransValue('matters.allMatters'),
      visible: this._permissionService.hasPermission('View_Matter'),
      command: () => {
        this._router.navigate(['./'], { relativeTo: this._route });
      },
    },
    {
      label: this._languageService.getTransValue('matters.favourite'),
      visible: this._permissionService.hasPermission('View_Matter'),
      command: () => {
        this._router.navigate(['./favourite'], { relativeTo: this._route });
      },
    },
  ];
  activeItem!: MenuItem;
  ngOnInit(): void {
    this.setActiveTab();
      document.body.classList.add('page-matter');
  }
  setActiveTab() {
    this.activeItem =
      this.items.find((obj) =>
        this._router.url.includes(obj?.label?.toLocaleLowerCase() || '')
      ) || this.items[0];
  }
  ngOnDestroy() {
  document.body.classList.remove('page-matter');
}
}
