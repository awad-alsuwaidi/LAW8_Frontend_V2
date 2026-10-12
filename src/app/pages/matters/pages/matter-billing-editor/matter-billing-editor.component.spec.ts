import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatterBillingEditorComponent } from './matter-billing-editor.component';

describe('MatterBillingEditorComponent', () => {
  let component: MatterBillingEditorComponent;
  let fixture: ComponentFixture<MatterBillingEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatterBillingEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatterBillingEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
