import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillsTimeFeesEditorComponent } from './bills-time-fees-editor.component';

describe('BillsTimeFeesEditorComponent', () => {
  let component: BillsTimeFeesEditorComponent;
  let fixture: ComponentFixture<BillsTimeFeesEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BillsTimeFeesEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BillsTimeFeesEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
