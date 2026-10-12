import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreBillTimeFeesEditorComponent } from './pre-bill-time-fees-editor.component';

describe('PreBillTimeFeesEditorComponent', () => {
  let component: PreBillTimeFeesEditorComponent;
  let fixture: ComponentFixture<PreBillTimeFeesEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreBillTimeFeesEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreBillTimeFeesEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
