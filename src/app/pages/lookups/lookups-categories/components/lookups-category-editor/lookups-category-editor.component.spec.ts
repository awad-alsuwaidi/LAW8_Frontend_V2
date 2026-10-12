import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LookupsCategoryEditorComponent } from './lookups-category-editor.component';

describe('LookupsCategoryEditorComponent', () => {
  let component: LookupsCategoryEditorComponent;
  let fixture: ComponentFixture<LookupsCategoryEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LookupsCategoryEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LookupsCategoryEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
