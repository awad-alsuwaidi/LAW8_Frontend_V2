import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskManagementActivityEditorComponent } from './task-management-activity-editor.component';

describe('TaskManagementActivityEditorComponent', () => {
  let component: TaskManagementActivityEditorComponent;
  let fixture: ComponentFixture<TaskManagementActivityEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskManagementActivityEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskManagementActivityEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
