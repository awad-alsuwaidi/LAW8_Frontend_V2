import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecievePaymentEditorReferenceComponent } from './recieve-payment-editor-reference.component';

describe('RecievePaymentEditorReferenceComponent', () => {
  let component: RecievePaymentEditorReferenceComponent;
  let fixture: ComponentFixture<RecievePaymentEditorReferenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecievePaymentEditorReferenceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecievePaymentEditorReferenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
