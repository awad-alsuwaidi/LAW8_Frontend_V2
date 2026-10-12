import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ARReportEditorComponent } from './components/report-document-editor/aRReport-editor.componen';

@Component({
  selector: 'app-aRReport',
  standalone: true,
  imports: [
    TranslateModule,
    ARReportEditorComponent,
  ],
  templateUrl: './aRReport.component.html',
  styleUrl: './aRReport.component.scss'
})
export class ARReportComponent {

}
