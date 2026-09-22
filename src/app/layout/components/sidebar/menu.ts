import { MenuItem } from './menu.model';

export class Menu {
  public static pages: MenuItem[] = [
    {
      group: 'main',
      items: [
        {
          label: 'Dashboard',
          labelAr: 'لوحة التحكم',
          icon: 'icon-home',
          route: '/dashboard',
        },
        {
          label: 'Tenants',
          labelAr: 'الشركات والمكاتب',
          icon: 'icon-clients',
          route: '/tenants',
        },
        {
          label: 'On-Prem Licenses',
          labelAr: 'تراخيص النسخ المحلية',
          icon: 'icon-checks',
          route: '/licensing',
        },
        {
          label: 'Subscription Management',
          labelAr: 'إدارة الاشتراكات',
          icon: 'icon-timesheet',
          route: '/subscriptions',
        },
        {
          label: 'Users & Roles',
          labelAr: 'المستخدمون والأدوار',
          icon: 'icon-setting',
          children: [
            { label: 'Users', labelAr: 'المستخدمون', route: '/platform/users', icon: 'icon-users' },
            { label: 'Roles', labelAr: 'الأدوار', route: '/platform/roles', icon: 'icon-checks' },
          ],
        },
        {
          label: 'Master Data',
          labelAr: 'البيانات الأساسية',
          icon: 'icon-lookups',
          children: [
            { label: 'Regions', labelAr: 'المناطق', route: '/setup/regions', icon: 'icon-lookups' },
            { label: 'Countries', labelAr: 'الدول', route: '/setup/countries', icon: 'icon-lookups' },
            { label: 'Currencies', labelAr: 'العملات', route: '/setup/currencies', icon: 'icon-lookups' },
            { label: 'Products', labelAr: 'المنتجات', route: '/setup/products', icon: 'icon-task' },
            { label: 'Features', labelAr: 'الميزات', route: '/setup/features', icon: 'icon-checks' },
            { label: 'Org Types', labelAr: 'أنواع الشركات والمكاتب', route: '/setup/org-types', icon: 'icon-clients' },
          ],
        },
        {
          label: 'Audit',
          labelAr: 'التدقيق',
          icon: 'icon-report',
          children: [
            { label: 'Logs', labelAr: 'السجلات', route: '/audit/logs', icon: 'icon-list' },
          ],
        },
      ],
    },
    {
      group: 'bottom',
      items: [
        {
          label: 'My Account',
          labelAr: 'حسابي',
          icon: 'icon-users',
          route: '/self-service',
        },
        {
          label: 'Help',
          labelAr: 'المساعدة',
          icon: 'icon-help',
        },
      ],
    },
  ];
}
