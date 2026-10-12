import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickBillEditorComponent } from './quick-bill-editor.component';

describe('QuickBillEditorComponent', () => {
  let component: QuickBillEditorComponent;
  let fixture: ComponentFixture<QuickBillEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuickBillEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuickBillEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
