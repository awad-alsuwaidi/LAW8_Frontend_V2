import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportDocumentEditorComponent } from './report-document-editor.component';

describe('ReportDocumentEditorComponent', () => {
  let component: ReportDocumentEditorComponent;
  let fixture: ComponentFixture<ReportDocumentEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportDocumentEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportDocumentEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
