import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardChartListComponent } from './dashboard-chart-list.component';

describe('DashboardChartListComponent', () => {
  let component: DashboardChartListComponent;
  let fixture: ComponentFixture<DashboardChartListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardChartListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardChartListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
