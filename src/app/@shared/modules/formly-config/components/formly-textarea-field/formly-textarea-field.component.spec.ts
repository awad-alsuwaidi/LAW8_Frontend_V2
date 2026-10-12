import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormlyTextareaFieldComponent } from './formly-textarea-field.component';

describe('FormlyTextareaFieldComponent', () => {
  let component: FormlyTextareaFieldComponent;
  let fixture: ComponentFixture<FormlyTextareaFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormlyTextareaFieldComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormlyTextareaFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
