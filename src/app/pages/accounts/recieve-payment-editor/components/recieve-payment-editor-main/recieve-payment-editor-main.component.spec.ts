import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecievePaymentEditorMainComponent } from './recieve-payment-editor-main.component';

describe('RecievePaymentEditorMainComponent', () => {
  let component: RecievePaymentEditorMainComponent;
  let fixture: ComponentFixture<RecievePaymentEditorMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecievePaymentEditorMainComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecievePaymentEditorMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
