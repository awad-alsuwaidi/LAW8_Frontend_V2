import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskManagementActivityComponent } from './task-management-activity.component';

describe('TaskManagementActivityComponent', () => {
  let component: TaskManagementActivityComponent;
  let fixture: ComponentFixture<TaskManagementActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskManagementActivityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskManagementActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
