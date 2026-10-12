import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatterAdditionalFilterEditorComponent } from './matter-additional-filter-editor.component';

describe('MatterAdditionalFilterEditorComponent', () => {
  let component: MatterAdditionalFilterEditorComponent;
  let fixture: ComponentFixture<MatterAdditionalFilterEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatterAdditionalFilterEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatterAdditionalFilterEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
