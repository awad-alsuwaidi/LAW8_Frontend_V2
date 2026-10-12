import {
  Component,
  HostListener,
  inject,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { MenuService } from '../../services/menu.service';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { SubMenuItem } from './menu.model';
import { LanguageService } from '@core/services/language.service';
import { filter } from 'rxjs';
import { SharedModule } from '@shared/shared.module';
import { environment } from 'src/environments/environment';
import { AppConfigService } from 'src/app/@core/services/app-config.service';
import { AuthService } from 'src/app/@core/services';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: true,
  imports: [RouterModule, SharedModule],
})
export class SidebarComponent implements OnInit, AfterViewInit {
  _menuService = inject(MenuService);
  _languageService = inject(LanguageService);
  _router = inject(Router);
  _appConfigService = inject(AppConfigService);
    _authService=inject(AuthService);
  
  contextMenuVisible = false;
  contextMenuPosition = { x: 0, y: 0 };
  selectedItem: any = null;
  isProduction = environment.production;
  currentUrl!: string;
  activeRoute: string = '';
  @ViewChild('menuContainer') menuContainer!: ElementRef;
  showScrollbar: boolean = false;

  constructor(private router: Router) {
    this._router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentUrl = event.urlAfterRedirects;
        if (!this.activeRoute) this.activeRoute = this.currentUrl;
      });
  }

  ngOnInit(): void {
    this.onResize();
    this.currentUrl = this._router.url;
    this.activeRoute = this.currentUrl;
  }

  ngAfterViewInit() {
    setTimeout(() => this.updateScrollbar(), 0);
  }

  @HostListener('window:resize')
  onResize() {
    if (window.innerWidth < 700) {
      this._menuService.showSideBar = false;
    } else {
      this._menuService.showSideBar = true;
    }
    this.updateScrollbar();
  }

  private updateScrollbar() {
    if (!this.menuContainer) return;
    const el = this.menuContainer.nativeElement as HTMLElement;
    this.showScrollbar = el.scrollHeight > el.clientHeight;
  }

  get appVersion(): string {
    return this._appConfigService.version;
  }

  openInNewTab() {
    if (this.selectedItem?.route) {
      const fullUrl = window.location.origin + '/#' + this.selectedItem.route;
      window.open(fullUrl, '_blank');
    }
    this.contextMenuVisible = false;
  }

  onToggleSidebar() {
    this._menuService.toggleSidebar();
    setTimeout(() => this.updateScrollbar(), 0);
  }
  onRightClick(event: MouseEvent, item: any) {
    event.preventDefault();

    this.contextMenuVisible = true;
    this.selectedItem = item;

    const menuWidth = 170;
    const menuHeight = 40;

    let x = event.clientX;
    let y = event.clientY;

    if (x + menuWidth > window.innerWidth) {
      x = window.innerWidth - menuWidth - 10;
    }

    if (y + menuHeight > window.innerHeight) {
      y = window.innerHeight - menuHeight - 10;
    }

    this.contextMenuPosition = { x, y };
  }

  @HostListener('document:click')
  clickOutside() {
    this.contextMenuVisible = false;
  }

  public onMenuItemClick(item: SubMenuItem, event: MouseEvent) {
    event.stopPropagation();
    if (item.children?.length) {
      item.expanded = !item.expanded;
    } else if (item.route) {
      this.activeRoute = item.route;
      this._router.navigate([item.route]);
    }
    setTimeout(() => this.updateScrollbar(), 0);
  }

  private normalizeUrl(url: string): string {
    return (url || '').split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';
  }

  isActive(item: SubMenuItem | string): boolean {
    const currentUrl = this.normalizeUrl(this._router.url);

    if (typeof item === 'string') {
      return currentUrl === this.normalizeUrl(item);
    }

    const isSelfActive =
      (item.route && currentUrl === this.normalizeUrl(item.route)) ||
      item.activeMatchers?.some((pattern) => pattern.test(currentUrl));

    const isChildActive = item.children?.some((child) => this.isActive(child));

    return !!isSelfActive || !!isChildActive;
  }
}
