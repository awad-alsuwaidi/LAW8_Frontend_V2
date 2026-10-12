import {
  effect,
  Injectable,
  OnDestroy,
  signal,
  WritableSignal,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MenuItem, SubMenuItem } from '../components/sidebar/menu.model';
import { Menu } from '../components/sidebar/menu';
import { PermissionService } from 'src/app/@core/services/permission.service';

@Injectable({
  providedIn: 'root',
})
export class MenuService implements OnDestroy {
  private _showSidebar = signal(true);
  private _showMobileMenu = signal(false);
  private _pagesMenu: WritableSignal<MenuItem[]> = signal<MenuItem[]>([]); //signal<MenuItem[]>([]);
  private _subscription = new Subscription();

  refreshMenu = effect(
    () => {
      if (this._permissionService.getUserPermissions()) {
        this.setMenu();
      }
    },
    { allowSignalWrites: true }
  );
  constructor(
    private router: Router,
    private _permissionService: PermissionService
  ) {}
  setMenu() {
    /** Set dynamic menu */
    console.log('constructor');
    this._pagesMenu.set(
      this.filterMenuByPermissions(
        Menu.pages,
        this._permissionService.getUserPermissions()
      )
    );

    let sub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        /** Expand menu base on active route */
        this._pagesMenu().forEach((menu) => {
          let activeGroup = false;
          menu.items.forEach((subMenu: any) => {
            const active = this.isActive(subMenu.route);
            subMenu.expanded = active;
            subMenu.active = active;
            if (active) activeGroup = true;
            if (subMenu.children) {
              this.expand(subMenu.children);
            }
          });
          menu.active = activeGroup;
        });
      }
    });
    this._subscription.add(sub);
  }
  get showSideBar() {
    return this._showSidebar();
  }
  get showMobileMenu() {
    return this._showMobileMenu();
  }
  get pagesMenu() {
    return this._pagesMenu();
  }

  set showSideBar(value: boolean) {
    this._showSidebar.set(value);
  }
  set showMobileMenu(value: boolean) {
    this._showMobileMenu.set(value);
  }

  public toggleSidebar() {
    this._showSidebar.set(!this._showSidebar());
  }

  public toggleMenu(menu: any) {
    this.showSideBar = true;
    menu.expanded = !menu.expanded;
  }

  public toggleSubMenu(submenu: SubMenuItem) {
    submenu.expanded = !submenu.expanded;
  }

  private expand(items: Array<any>) {
    items.forEach((item) => {
      item.expanded = this.isActive(item.route);
      if (item.children) this.expand(item.children);
    });
  }

  private isActive(instruction: any): boolean {
    return this.router.isActive(this.router.createUrlTree([instruction]), {
      paths: 'subset',
      queryParams: 'subset',
      fragment: 'ignored',
      matrixParams: 'ignored',
    });
  }
  /**
   * Filters the menu items based on the provided permissions.
   * @param pages The array of menu items to filter.
   * @param permissions The array of permissions to check against.
   * @returns The filtered array of menu items.
   */

  private filterMenuByPermissions(
    pages: MenuItem[],
    permissions: string[]
  ): MenuItem[] {
    const filterSubMenuItems = (items: SubMenuItem[]): SubMenuItem[] => {
      return items
        .map((item) => {
          const filteredChildren = item.children
            ? filterSubMenuItems(item.children)
            : undefined;

          const hasPermission = item.permission
            ? permissions.includes(item.permission)
            : true;
          const includeItem =
            hasPermission || (filteredChildren && filteredChildren.length > 0);

          if (!includeItem) return null;

          return {
            ...item,
            children:
              filteredChildren && filteredChildren.length > 0
                ? filteredChildren
                : undefined,
          };
        })
        .filter((item) => item !== null) as SubMenuItem[];
    };

    return pages
      .map((menu) => {
        const filteredItems = filterSubMenuItems(menu.items);
        return {
          ...menu,
          items: filteredItems,
        };
      })
      .filter((menu) => menu.items && menu.items.length > 0);
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}
