import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormlyTableFieldComponent } from './formly-table-field.component';

describe('FormlyTableFieldComponent', () => {
  let component: FormlyTableFieldComponent;
  let fixture: ComponentFixture<FormlyTableFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormlyTableFieldComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormlyTableFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
