import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormlySelectFieldComponent } from './formly-select-field.component';

describe('FormlySelectFieldComponent', () => {
  let component: FormlySelectFieldComponent;
  let fixture: ComponentFixture<FormlySelectFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormlySelectFieldComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormlySelectFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
