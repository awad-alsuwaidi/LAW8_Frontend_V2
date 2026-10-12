import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormlyInputFieldComponent } from './formly-input-field.component';

describe('FormlyInputFieldComponent', () => {
  let component: FormlyInputFieldComponent;
  let fixture: ComponentFixture<FormlyInputFieldComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FormlyInputFieldComponent]
    });
    fixture = TestBed.createComponent(FormlyInputFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
