import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LookupsRateTableEditorComponent } from './lookups-rate-table-editor.component';

describe('LookupsRateTableEditorComponent', () => {
  let component: LookupsRateTableEditorComponent;
  let fixture: ComponentFixture<LookupsRateTableEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LookupsRateTableEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LookupsRateTableEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
