import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickBillTimeFeesEditorComponent } from './quick-bill-time-fees-editor.component';

describe('QuickBillTimeFeesEditorComponent', () => {
  let component: QuickBillTimeFeesEditorComponent;
  let fixture: ComponentFixture<QuickBillTimeFeesEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuickBillTimeFeesEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuickBillTimeFeesEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
