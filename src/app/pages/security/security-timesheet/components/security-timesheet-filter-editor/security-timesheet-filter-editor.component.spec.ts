import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecurityTimesheetFilterEditorComponent } from './security-timesheet-filter-editor.component';

describe('SecurityTimesheetFilterEditorComponent', () => {
  let component: SecurityTimesheetFilterEditorComponent;
  let fixture: ComponentFixture<SecurityTimesheetFilterEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecurityTimesheetFilterEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SecurityTimesheetFilterEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
