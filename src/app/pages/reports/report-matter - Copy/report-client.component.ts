import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ReportClientFilterEditorComponent } from './components/report-matter-filter-editor/report-client-filter-editor.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-report-client',
  standalone: true,
  imports: [
    TranslateModule,
    ReportClientFilterEditorComponent
  ],
  templateUrl: './report-client.component.html',
  styleUrl: './report-client.component.scss'
})
export class ReportClientComponent {
  isInhouse = environment.brand === 'inhouse';

}
