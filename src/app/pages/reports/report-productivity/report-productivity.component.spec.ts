import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportProductivityComponent } from './report-productivity.component';

describe('ReportProductivityComponent', () => {
  let component: ReportProductivityComponent;
  let fixture: ComponentFixture<ReportProductivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportProductivityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportProductivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
