import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportActivity2Component } from './report-activity-2.component';

describe('ReportActivityComponent', () => {
  let component: ReportActivity2Component;
  let fixture: ComponentFixture<ReportActivity2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportActivity2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportActivity2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
