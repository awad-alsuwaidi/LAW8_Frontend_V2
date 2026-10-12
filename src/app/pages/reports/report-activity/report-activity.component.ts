import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ReportActivityFilterEditorComponent } from './components/report-activity-filter-editor/report-activity-filter-editor.component';

@Component({
  selector: 'app-report-activity',
  standalone: true,
  imports: [
    TranslateModule,
    ReportActivityFilterEditorComponent,
  ],
  templateUrl: './report-activity.component.html',
  styleUrl: './report-activity.component.scss'
})
export class ReportActivityComponent {

}
