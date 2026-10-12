import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportUtilizationComponent } from './report-utilization.component';

describe('ReportProductivityComponent', () => {
  let component: ReportUtilizationComponent;
  let fixture: ComponentFixture<ReportUtilizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportUtilizationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportUtilizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
