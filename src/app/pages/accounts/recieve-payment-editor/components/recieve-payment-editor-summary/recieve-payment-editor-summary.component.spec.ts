import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecievePaymentEditorSummaryComponent } from './recieve-payment-editor-summary.component';

describe('RecievePaymentEditorSummaryComponent', () => {
  let component: RecievePaymentEditorSummaryComponent;
  let fixture: ComponentFixture<RecievePaymentEditorSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecievePaymentEditorSummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecievePaymentEditorSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
