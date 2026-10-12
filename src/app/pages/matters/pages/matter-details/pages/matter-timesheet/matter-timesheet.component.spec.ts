import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatterTimesheetComponent } from './matter-timesheet.component';

describe('MatterTimesheetComponent', () => {
  let component: MatterTimesheetComponent;
  let fixture: ComponentFixture<MatterTimesheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatterTimesheetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatterTimesheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
