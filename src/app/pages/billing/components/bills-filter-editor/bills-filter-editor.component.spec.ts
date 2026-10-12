import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillsFilterEditorComponent } from './bills-filter-editor.component';

describe('BillsFilterEditorComponent', () => {
  let component: BillsFilterEditorComponent;
  let fixture: ComponentFixture<BillsFilterEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BillsFilterEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BillsFilterEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
