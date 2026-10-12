import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickBillMainEditorComponent } from './quick-bill-main-editor.component';

describe('QuickBillMainEditorComponent', () => {
  let component: QuickBillMainEditorComponent;
  let fixture: ComponentFixture<QuickBillMainEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuickBillMainEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuickBillMainEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
