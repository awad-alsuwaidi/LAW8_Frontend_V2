// export interface SubMenuItem {
//   icon?: string;
//   label: string;
//   route?: string;
//   expanded?: boolean;
//   active?: boolean;
//   queryParams?: any;
//   children?: Array<SubMenuItem>;
//   permission?: string;
//   permissions?: string[];
// }

export interface MenuItem {
  separator?: boolean;
  selected?: boolean;
  active?: boolean;
  items: Array<SubMenuItem>;
  permission?: string;
  permissions?: string[];
}
export interface SubMenuItem {
  label: string;
  route?: string;
  icon?: string;
  permission?: string;
  expanded?: boolean;
  children?: SubMenuItem[];
  activeMatchers?: RegExp[];
  active?: boolean;
}