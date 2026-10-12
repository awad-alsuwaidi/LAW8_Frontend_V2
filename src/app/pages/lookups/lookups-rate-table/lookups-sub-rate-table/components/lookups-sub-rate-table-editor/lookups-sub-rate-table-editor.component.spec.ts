import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LookupsSubRateTableEditorComponent } from './lookups-sub-rate-table-editor.component';

describe('LookupsSubRateTableEditorComponent', () => {
  let component: LookupsSubRateTableEditorComponent;
  let fixture: ComponentFixture<LookupsSubRateTableEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LookupsSubRateTableEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LookupsSubRateTableEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
