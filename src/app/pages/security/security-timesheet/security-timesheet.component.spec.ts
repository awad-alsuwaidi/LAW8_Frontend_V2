import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecurityTimesheetComponent } from './security-timesheet.component';

describe('SecurityTimesheetComponent', () => {
  let component: SecurityTimesheetComponent;
  let fixture: ComponentFixture<SecurityTimesheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecurityTimesheetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SecurityTimesheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
