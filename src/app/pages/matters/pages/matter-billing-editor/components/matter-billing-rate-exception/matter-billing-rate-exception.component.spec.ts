import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatterBillingRateExceptionComponent } from './matter-billing-rate-exception.component';

describe('MatterBillingRateExceptionComponent', () => {
  let component: MatterBillingRateExceptionComponent;
  let fixture: ComponentFixture<MatterBillingRateExceptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatterBillingRateExceptionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatterBillingRateExceptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
