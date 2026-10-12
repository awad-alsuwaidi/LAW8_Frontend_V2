import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormlyButtonSelectFieldComponent } from './formly-button-select-field.component';

describe('FormlyButtonSelectFieldComponent', () => {
  let component: FormlyButtonSelectFieldComponent;
  let fixture: ComponentFixture<FormlyButtonSelectFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FormlyButtonSelectFieldComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormlyButtonSelectFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
