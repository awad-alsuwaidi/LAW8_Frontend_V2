import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatterInvoiceComponent } from './matter-invoice.component';

describe('MatterInvoiceComponent', () => {
  let component: MatterInvoiceComponent;
  let fixture: ComponentFixture<MatterInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatterInvoiceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatterInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
