import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickBillSummaryComponent } from './quick-bill-summary.component';

describe('QuickBillSummaryComponent', () => {
  let component: QuickBillSummaryComponent;
  let fixture: ComponentFixture<QuickBillSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuickBillSummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuickBillSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
