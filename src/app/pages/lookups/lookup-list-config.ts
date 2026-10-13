import { LookupConfig } from './interface/lookup.interface';
import { LookupsComponent } from './lookups.component';

export function getLookupCards(THIS: LookupsComponent): LookupConfig[] {
  return [
    {
      icon: 'icon-matters',
      title: THIS._languageService.getTransValue(
        'lookups.mattersCategories_title',
      ),
      description: THIS._languageService.getTransValue(
        'lookups.mattersCategories_description',
      ),
      routeName: 'MatterCategories',
      action: 'canRead',
      command: () => THIS._router.navigate(['/lookups/categories']),
    },
    {
      icon: 'icon-matters',
      title: THIS._languageService.getTransValue('lookups.mattersLists_title'),
      description: THIS._languageService.getTransValue(
        'lookups.mattersLists_description',
      ),
      routeName: 'MatterStatuses',
      anyOfRouteNames: [
        { routeName: 'MatterStatuses', action: 'canRead' },
        { routeName: 'MatterStages', action: 'canRead' },
        { routeName: 'ReferralTypes', action: 'canRead' },
        { routeName: 'PartyDescriptions', action: 'canRead' },
        { routeName: 'AdjournmentReasons', action: 'canRead' },
        { routeName: 'TaskCodes', action: 'canRead' },
        { routeName: 'TaskCodeGroups', action: 'canRead' },
        { routeName: 'PracticeAreas', action: 'canRead' },
        { routeName: 'Departments', action: 'canRead' },
        { routeName: 'Industries', action: 'canRead' },
      ],
      command: () => THIS._router.navigate(['/lookups/matters-list']),
    },
    {
      icon: 'icon-task',
      title: THIS._languageService.getTransValue('lookups.taskGroups_title'),
      description: THIS._languageService.getTransValue(
        'lookups.taskGroups_description',
      ),
      routeName: 'TaskCodes',
      action: 'canRead',
      command: () => THIS._router.navigate(['/lookups/task-groups']),
    },
    {
      icon: 'icon-task',
      title: THIS._languageService.getTransValue(
        'lookups.predefinedTasks_title',
      ),
      description: THIS._languageService.getTransValue(
        'lookups.predefinedTasks_description',
      ),
      routeName: 'PredefinedTasks',
      action: 'canRead',
      command: () => THIS._router.navigate(['/lookups/predefined-tasks']),
    },
    {
      icon: 'icon-omega-circle',
      title: THIS._languageService.getTransValue('lookups.jurisdictions_title'),
      description: THIS._languageService.getTransValue(
        'lookups.jurisdictions_description',
      ),
      routeName: 'Jurisdictions',
      action: 'canRead',
      command: () => THIS._router.navigate(['/lookups/jurisdictions']),
    },
    {
      icon: 'icon-task',
      title: THIS._languageService.getTransValue('lookups.rateTable_title'),
      description: THIS._languageService.getTransValue(
        'lookups.rateTable_description',
      ),
      routeName: 'Rates',
      action: 'canRead',
      command: () => THIS._router.navigate(['/lookups/rate-table']),
    },
    {
      icon: 'icon-bank',
      title: 'Bank Accounts',
      description: 'All Bank Accounts',
      routeName: 'BankAccounts',
      action: 'canRead',
      command: () => THIS._router.navigate(['/lookups/bank-accounts']),
    },
    {
      icon: 'icon-buildings',
      title: 'G/L Accounts',
      description: 'All G/L Accounts',
      routeName: 'GlAccounts',
      action: 'canRead',
      command: () => THIS._router.navigate(['/lookups/gl-bank-accounts']),
    },
  ];
}
