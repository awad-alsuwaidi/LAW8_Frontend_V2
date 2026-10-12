import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopbarTimesheetEditorComponent } from './topbar-timesheet-editor.component';

describe('TopbarTimesheetEditorComponent', () => {
  let component: TopbarTimesheetEditorComponent;
  let fixture: ComponentFixture<TopbarTimesheetEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopbarTimesheetEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopbarTimesheetEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
