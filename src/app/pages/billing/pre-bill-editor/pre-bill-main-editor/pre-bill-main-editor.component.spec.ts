import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreBillMainEditorComponent } from './pre-bill-main-editor.component';

describe('PreBillMainEditorComponent', () => {
  let component: PreBillMainEditorComponent;
  let fixture: ComponentFixture<PreBillMainEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreBillMainEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreBillMainEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
