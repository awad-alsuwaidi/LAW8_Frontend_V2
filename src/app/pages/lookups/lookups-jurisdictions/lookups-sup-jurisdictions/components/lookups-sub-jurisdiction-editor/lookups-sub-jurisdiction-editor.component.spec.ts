import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LookupsSubJurisdictionEditorComponent } from './lookups-sub-jurisdiction-editor.component';

describe('LookupsSubJurisdictionEditorComponent', () => {
  let component: LookupsSubJurisdictionEditorComponent;
  let fixture: ComponentFixture<LookupsSubJurisdictionEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LookupsSubJurisdictionEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LookupsSubJurisdictionEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
