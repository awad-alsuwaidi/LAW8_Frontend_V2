import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersTimesheetEditorComponent } from './users-timesheet-editor.component';

describe('UsersTimesheetEditorComponent', () => {
  let component: UsersTimesheetEditorComponent;
  let fixture: ComponentFixture<UsersTimesheetEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersTimesheetEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersTimesheetEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
