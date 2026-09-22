export interface SubMenuItem {
  label: string;
  labelAr?: string;
  route?: string;
  icon?: string;
  children?: SubMenuItem[];
}

export interface MenuItem {
  group: string;
  items: SubMenuItem[];
}
