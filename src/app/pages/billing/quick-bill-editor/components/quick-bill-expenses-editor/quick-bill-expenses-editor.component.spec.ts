import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickBillExpensesEditorComponent } from './quick-bill-expenses-editor.component';

describe('QuickBillExpensesEditorComponent', () => {
  let component: QuickBillExpensesEditorComponent;
  let fixture: ComponentFixture<QuickBillExpensesEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuickBillExpensesEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuickBillExpensesEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
