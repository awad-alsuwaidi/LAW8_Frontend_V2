import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TopbarComponent } from './components/topbar/topbar.component';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  standalone:true,
  imports: [SidebarComponent, RouterOutlet,TopbarComponent,CommonModule],
})
export class LayoutComponent {
  constructor(private router: Router) {}

  get showLayout(): boolean {
    const hiddenRoutes = ['/advanced-search', '/auth'];
    return !hiddenRoutes.some(route =>
      this.router.url.includes(route)
    );
  }
}

