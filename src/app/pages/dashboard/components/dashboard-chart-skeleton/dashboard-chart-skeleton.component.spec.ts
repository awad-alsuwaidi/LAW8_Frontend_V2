import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardChartSkeletonComponent } from './dashboard-chart-skeleton.component';

describe('DashboardChartSkeletonComponent', () => {
  let component: DashboardChartSkeletonComponent;
  let fixture: ComponentFixture<DashboardChartSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardChartSkeletonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardChartSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
