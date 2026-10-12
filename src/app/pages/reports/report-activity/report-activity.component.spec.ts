import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportActivityComponent } from './report-activity.component';

describe('ReportActivityComponent', () => {
  let component: ReportActivityComponent;
  let fixture: ComponentFixture<ReportActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportActivityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
