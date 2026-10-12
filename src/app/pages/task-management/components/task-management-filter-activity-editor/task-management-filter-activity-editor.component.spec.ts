import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskManagementFilterActivityEditorComponent } from './task-management-filter-activity-editor.component';

describe('TaskManagementFilterActivityEditorComponent', () => {
  let component: TaskManagementFilterActivityEditorComponent;
  let fixture: ComponentFixture<TaskManagementFilterActivityEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskManagementFilterActivityEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskManagementFilterActivityEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
