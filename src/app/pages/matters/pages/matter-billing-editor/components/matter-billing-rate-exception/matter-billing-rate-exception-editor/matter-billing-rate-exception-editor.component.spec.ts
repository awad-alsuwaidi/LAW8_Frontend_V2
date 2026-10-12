import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatterBillingRateExceptionEditorComponent } from './matter-billing-rate-exception-editor.component';

describe('MatterBillingRateExceptionEditorComponent', () => {
  let component: MatterBillingRateExceptionEditorComponent;
  let fixture: ComponentFixture<MatterBillingRateExceptionEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatterBillingRateExceptionEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatterBillingRateExceptionEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
