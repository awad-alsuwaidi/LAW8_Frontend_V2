import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetEditorTimerComponent } from './timesheet-editor-timer.component';

describe('TimesheetEditorTimerComponent', () => {
  let component: TimesheetEditorTimerComponent;
  let fixture: ComponentFixture<TimesheetEditorTimerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimesheetEditorTimerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimesheetEditorTimerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
