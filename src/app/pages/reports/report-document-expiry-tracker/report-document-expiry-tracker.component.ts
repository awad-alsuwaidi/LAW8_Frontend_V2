import { Component } from '@angular/core';
import { ReportDocumentEditorComponent } from "./components/report-document-editor/report-document-editor.component";
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-report-document-expiry-tracker',
  standalone: true,
  imports: [ReportDocumentEditorComponent,TranslateModule],
  templateUrl: './report-document-expiry-tracker.component.html',
  styleUrl: './report-document-expiry-tracker.component.scss'
})
export class ReportDocumentExpiryTrackerComponent {

}
