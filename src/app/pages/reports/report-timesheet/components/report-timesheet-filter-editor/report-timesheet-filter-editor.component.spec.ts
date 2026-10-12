import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportTimesheetFilterEditorComponent } from './report-timesheet-filter-editor.component';

describe('ReportTimesheetFilterEditorComponent', () => {
  let component: ReportTimesheetFilterEditorComponent;
  let fixture: ComponentFixture<ReportTimesheetFilterEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportTimesheetFilterEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportTimesheetFilterEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
