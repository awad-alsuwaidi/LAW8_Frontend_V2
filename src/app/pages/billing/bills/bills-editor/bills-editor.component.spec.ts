import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillsEditorComponent } from './bills-editor.component';

describe('BillsEditorComponent', () => {
  let component: BillsEditorComponent;
  let fixture: ComponentFixture<BillsEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BillsEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BillsEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
