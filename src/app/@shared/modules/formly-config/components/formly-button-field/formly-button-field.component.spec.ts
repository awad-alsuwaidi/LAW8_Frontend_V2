import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormlyButtonFieldComponent } from './formly-button-field.component';

describe('FormlyButtonFieldComponent', () => {
  let component: FormlyButtonFieldComponent;
  let fixture: ComponentFixture<FormlyButtonFieldComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FormlyButtonFieldComponent]
    });
    fixture = TestBed.createComponent(FormlyButtonFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
