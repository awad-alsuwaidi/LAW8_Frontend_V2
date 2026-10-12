import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetAdditionalFilterEditorComponent } from './fees-additional-filter-editor.component';

describe('TimesheetAdditionalFilterEditorComponent', () => {
  let component: TimesheetAdditionalFilterEditorComponent;
  let fixture: ComponentFixture<TimesheetAdditionalFilterEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimesheetAdditionalFilterEditorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TimesheetAdditionalFilterEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
