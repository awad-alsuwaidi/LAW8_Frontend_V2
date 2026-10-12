import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecievePaymentEditorComponent } from './recieve-payment-editor.component';

describe('RecievePaymentEditorComponent', () => {
  let component: RecievePaymentEditorComponent;
  let fixture: ComponentFixture<RecievePaymentEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecievePaymentEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecievePaymentEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
