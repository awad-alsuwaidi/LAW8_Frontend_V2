import { Component } from '@angular/core';
import { ReportProductivityEditorComponent } from "./components/report-productivity-editor/report-productivity-editor.component";
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-report-productivity',
  standalone: true,
  imports: [ReportProductivityEditorComponent,TranslateModule],
  templateUrl: './report-productivity.component.html',
  styleUrl: './report-productivity.component.scss'
})
export class ReportProductivityComponent {

}
