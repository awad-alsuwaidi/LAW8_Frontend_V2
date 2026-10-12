import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedMatterAdditionalFilterEditorComponent } from './shared-matter-additional-filter-editor.component';

describe('SharedMatterAdditionalFilterEditorComponent', () => {
  let component: SharedMatterAdditionalFilterEditorComponent;
  let fixture: ComponentFixture<SharedMatterAdditionalFilterEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedMatterAdditionalFilterEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SharedMatterAdditionalFilterEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
