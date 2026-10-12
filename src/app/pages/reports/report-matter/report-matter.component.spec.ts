import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportMatterComponent } from './report-matter.component';

describe('ReportMatterComponent', () => {
  let component: ReportMatterComponent;
  let fixture: ComponentFixture<ReportMatterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportMatterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportMatterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
