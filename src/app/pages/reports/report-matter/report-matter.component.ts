import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ReportMatterFilterEditorComponent } from './components/report-matter-filter-editor/report-matter-filter-editor.component';

@Component({
  selector: 'app-report-matter',
  standalone: true,
  imports: [
    TranslateModule,
    ReportMatterFilterEditorComponent
  ],
  templateUrl: './report-matter.component.html',
  styleUrl: './report-matter.component.scss'
})
export class ReportMatterComponent {

}
