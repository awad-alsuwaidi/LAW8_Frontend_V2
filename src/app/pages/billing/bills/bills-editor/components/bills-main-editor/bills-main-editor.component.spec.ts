import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillsMainEditorComponent } from './bills-main-editor.component';

describe('BillsMainEditorComponent', () => {
  let component: BillsMainEditorComponent;
  let fixture: ComponentFixture<BillsMainEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BillsMainEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BillsMainEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
