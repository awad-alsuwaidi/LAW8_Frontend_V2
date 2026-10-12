import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LookupsPredefinedTasksEditorComponent } from './lookups-predefined-tasks-editor.component';

describe('LookupsPredefinedTasksEditorComponent', () => {
  let component: LookupsPredefinedTasksEditorComponent;
  let fixture: ComponentFixture<LookupsPredefinedTasksEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LookupsPredefinedTasksEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LookupsPredefinedTasksEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
