import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LookupsSubCategoryEditorComponent } from './lookups-sub-category-editor.component';

describe('LookupsSubCategoryEditorComponent', () => {
  let component: LookupsSubCategoryEditorComponent;
  let fixture: ComponentFixture<LookupsSubCategoryEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LookupsSubCategoryEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LookupsSubCategoryEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
