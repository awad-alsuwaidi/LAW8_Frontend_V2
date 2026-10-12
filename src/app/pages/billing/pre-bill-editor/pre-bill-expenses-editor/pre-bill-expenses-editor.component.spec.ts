import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreBillExpensesEditorComponent } from './pre-bill-expenses-editor.component';

describe('PreBillExpensesEditorComponent', () => {
  let component: PreBillExpensesEditorComponent;
  let fixture: ComponentFixture<PreBillExpensesEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreBillExpensesEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreBillExpensesEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
