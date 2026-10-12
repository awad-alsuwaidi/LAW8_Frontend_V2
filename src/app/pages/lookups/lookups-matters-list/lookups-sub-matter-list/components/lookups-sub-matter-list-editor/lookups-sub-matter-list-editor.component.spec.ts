import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LookupsSubMatterListEditorComponent } from './lookups-sub-matter-list-editor.component';

describe('LookupsSubMatterListEditorComponent', () => {
  let component: LookupsSubMatterListEditorComponent;
  let fixture: ComponentFixture<LookupsSubMatterListEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LookupsSubMatterListEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LookupsSubMatterListEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
