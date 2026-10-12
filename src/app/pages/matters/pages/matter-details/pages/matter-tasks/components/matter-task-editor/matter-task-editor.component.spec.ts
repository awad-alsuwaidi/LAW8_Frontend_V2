import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatterTaskEditorComponent } from './matter-task-editor.component';

describe('MatterTaskEditorComponent', () => {
  let component: MatterTaskEditorComponent;
  let fixture: ComponentFixture<MatterTaskEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatterTaskEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatterTaskEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
