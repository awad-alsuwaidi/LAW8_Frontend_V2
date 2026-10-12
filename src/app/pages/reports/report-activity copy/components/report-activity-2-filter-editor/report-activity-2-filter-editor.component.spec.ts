import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportActivity2FilterEditorComponent } from './report-activity-2-filter-editor.component';

describe('ReportActivityFilterEditorComponent', () => {
  let component: ReportActivity2FilterEditorComponent;
  let fixture: ComponentFixture<ReportActivity2FilterEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportActivity2FilterEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportActivity2FilterEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
