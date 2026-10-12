import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LookupsJurisdictionsEditorComponent } from './lookups-jurisdictions-editor.component';

describe('LookupsJurisdictionsEditorComponent', () => {
  let component: LookupsJurisdictionsEditorComponent;
  let fixture: ComponentFixture<LookupsJurisdictionsEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LookupsJurisdictionsEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LookupsJurisdictionsEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
