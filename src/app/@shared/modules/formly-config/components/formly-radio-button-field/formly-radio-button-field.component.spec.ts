import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormlyRadioButtonFieldComponent } from './formly-radio-button-field.component';

describe('FormlyRadioButtonFieldComponent', () => {
  let component: FormlyRadioButtonFieldComponent;
  let fixture: ComponentFixture<FormlyRadioButtonFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormlyRadioButtonFieldComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormlyRadioButtonFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
