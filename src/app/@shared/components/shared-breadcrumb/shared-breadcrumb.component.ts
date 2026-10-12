import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { BreadCrumb } from './interface/breadcrumb.interface';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-shared-breadcrumb',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    TranslateModule
  ],
  templateUrl: './shared-breadcrumb.component.html',
  styleUrl: './shared-breadcrumb.component.scss'
})
export class SharedBreadcrumbComponent implements OnInit {
  _router = inject(Router);
  _route = inject(ActivatedRoute);

  breadcrumbs: BreadCrumb[] = []
  ngOnInit(): void {
    this.buildBreadcrumbs();
    this._router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((result) => {
        
        this.buildBreadcrumbs();
      });
  }

  private buildBreadcrumbs() {
    let route = this._route.root;
    const breadcrumbs: BreadCrumb[] = [];
    let url = '';

    while (route.firstChild) {
      route = route.firstChild;
      const routePart = route.snapshot.url.map(segment => segment.path).join('/');
      if (routePart) {
        url += `/${routePart}`;
        const label = route.snapshot.data['breadcrumb'];
        if (label) {
          breadcrumbs.push({ label, url });
        }
      }
    }

    this.breadcrumbs = breadcrumbs;
  }
}
