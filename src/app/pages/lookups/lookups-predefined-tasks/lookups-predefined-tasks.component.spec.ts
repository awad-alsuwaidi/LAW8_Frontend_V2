import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LookupsPredefinedTasksComponent } from './lookups-predefined-tasks.component';

describe('LookupsPredefinedTasksComponent', () => {
  let component: LookupsPredefinedTasksComponent;
  let fixture: ComponentFixture<LookupsPredefinedTasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LookupsPredefinedTasksComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LookupsPredefinedTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
