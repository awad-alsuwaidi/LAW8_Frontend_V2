import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatterActivityEditorComponent } from './matter-activity-editor.component';

describe('MatterActivityEditorComponent', () => {
  let component: MatterActivityEditorComponent;
  let fixture: ComponentFixture<MatterActivityEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatterActivityEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatterActivityEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
