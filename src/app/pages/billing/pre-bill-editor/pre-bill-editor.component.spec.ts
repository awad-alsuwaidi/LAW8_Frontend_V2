import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreBillEditorComponent } from './pre-bill-editor.component';

describe('PreBillEditorComponent', () => {
  let component: PreBillEditorComponent;
  let fixture: ComponentFixture<PreBillEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreBillEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreBillEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
