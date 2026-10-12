import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ReportActivity2FilterEditorComponent } from './components/report-activity-2-filter-editor/report-activity-2-filter-editor.component';

@Component({
  selector: 'app-report-activity-2',
  standalone: true,
  imports: [
    TranslateModule,
    ReportActivity2FilterEditorComponent,
  ],
  templateUrl: './report-activity-2.component.html',
  styleUrl: './report-activity-2.component.scss'
})
export class ReportActivity2Component {

}
