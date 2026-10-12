import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickBillCreateExpensesEditorComponent } from './quick-bill-create-expenses-editor.component';

describe('QuickBillCreateExpensesEditorComponent', () => {
  let component: QuickBillCreateExpensesEditorComponent;
  let fixture: ComponentFixture<QuickBillCreateExpensesEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuickBillCreateExpensesEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuickBillCreateExpensesEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
