import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillsExpensesEditorComponent } from './bills-expenses-editor.component';

describe('BillsExpensesEditorComponent', () => {
  let component: BillsExpensesEditorComponent;
  let fixture: ComponentFixture<BillsExpensesEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BillsExpensesEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BillsExpensesEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
