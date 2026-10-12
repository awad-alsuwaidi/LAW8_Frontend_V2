import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardTimesheetSkeletonComponent } from './dashboard-timesheet-skeleton.component';

describe('DashboardTimesheetSkeletonComponent', () => {
  let component: DashboardTimesheetSkeletonComponent;
  let fixture: ComponentFixture<DashboardTimesheetSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardTimesheetSkeletonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardTimesheetSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
