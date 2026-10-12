import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportTimesheetComponent } from './report-timesheet.component';

describe('ReportTimesheetComponent', () => {
  let component: ReportTimesheetComponent;
  let fixture: ComponentFixture<ReportTimesheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportTimesheetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportTimesheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
