import { Routes } from '@angular/router';

export const REPORTS_ROUTES: Routes = [
  {
    path: 'activity',
    loadComponent: () =>
      import('./report-activity/report-activity.component').then(
        (c) => c.ReportActivityComponent,
      ),
  },
  {
    path: 'activity2',
    loadComponent: () =>import('./report-activity copy/report-activity-2.component').then(
      (c) => c.ReportActivity2Component
    )
  },
  {
    path: 'timesheet',
    loadComponent: () =>
      import('./report-timesheet/report-timesheet.component').then(
        (c) => c.ReportTimesheetComponent,
      ),
  },
  {
    path: 'matter',
    loadComponent: () =>
      import('./report-matter/report-matter.component').then(
        (c) => c.ReportMatterComponent,
      ),
  },
  {
    path: 'client',
    loadComponent: () =>
      import('./report-matter - Copy/report-client.component').then(
        (c) => c.ReportClientComponent,
      ),
  },
  {
    path: 'utilization',
    loadComponent: () =>
      import('./report-utilization/report-utilization.component').then(
        (c) => c.ReportUtilizationComponent,
      ),
  },
  {
    path: 'productivity',
    loadComponent: () =>
      import('./report-productivity/report-productivity.component').then(
        (c) => c.ReportProductivityComponent,
      ),
  },
  {
    path: 'document-expiry-tracker',
    loadComponent: () =>
      import('./report-document-expiry-tracker/report-document-expiry-tracker.component').then(
        (c) => c.ReportDocumentExpiryTrackerComponent,
      ),
  },
  {
    path: 'billing/ar-report',
    loadComponent: () =>
      import('./billing/aRReport/aRReport.component').then(
        (c) => c.ARReportComponent,
      ),
  },
];
