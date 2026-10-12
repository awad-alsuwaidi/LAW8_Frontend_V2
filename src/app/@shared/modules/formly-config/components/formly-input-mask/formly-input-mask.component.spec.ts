import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormlyInputMaskComponent } from './formly-input-mask.component';

describe('FormlyInputMaskComponent', () => {
  let component: FormlyInputMaskComponent;
  let fixture: ComponentFixture<FormlyInputMaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormlyInputMaskComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormlyInputMaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
