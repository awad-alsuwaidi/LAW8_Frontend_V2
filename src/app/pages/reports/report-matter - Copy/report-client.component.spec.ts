import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportClientComponent } from './report-client.component';

describe('ReportClientComponent', () => {
  let component: ReportClientComponent;
  let fixture: ComponentFixture<ReportClientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportClientComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
