import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormlyInputBtnFieldComponent } from './formly-input-btn-field.component';

describe('FormlyInputBtnFieldComponent', () => {
  let component: FormlyInputBtnFieldComponent;
  let fixture: ComponentFixture<FormlyInputBtnFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormlyInputBtnFieldComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormlyInputBtnFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
