import { Component } from '@angular/core';
import { ReportUtilizationEditorComponent } from './components/report-utilization-editor/report-utilization-editor.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-report-utilization',
  standalone: true,
  imports: [ReportUtilizationEditorComponent,TranslateModule],
  templateUrl: './report-utilization.component.html',
  styleUrl: './report-utilization.component.scss'
})
export class ReportUtilizationComponent {

}
