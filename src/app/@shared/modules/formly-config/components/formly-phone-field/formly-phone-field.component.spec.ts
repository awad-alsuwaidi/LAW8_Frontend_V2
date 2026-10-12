import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormlyPhoneFieldComponent } from './formly-phone-field.component';

describe('FormlyPhoneFieldComponent', () => {
  let component: FormlyPhoneFieldComponent;
  let fixture: ComponentFixture<FormlyPhoneFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormlyPhoneFieldComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormlyPhoneFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
