import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ReportTimesheetFilterEditorComponent } from './components/report-timesheet-filter-editor/report-timesheet-filter-editor.component';

@Component({
  selector: 'app-report-timesheet',
  standalone: true,
  imports: [
    TranslateModule,
    ReportTimesheetFilterEditorComponent
  ],
  templateUrl: './report-timesheet.component.html',
  styleUrl: './report-timesheet.component.scss'
})
export class ReportTimesheetComponent {

}
