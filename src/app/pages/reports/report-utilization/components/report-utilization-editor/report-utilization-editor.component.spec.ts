import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportProductivityEditorComponent } from './report-productivity-editor.component';

describe('ReportProductivityEditorComponent', () => {
  let component: ReportProductivityEditorComponent;
  let fixture: ComponentFixture<ReportProductivityEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportProductivityEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportProductivityEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
