import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LookupsPredefinedTasksFilterComponent } from './lookups-predefined-tasks-filter.component';

describe('LookupsPredefinedTasksFilterComponent', () => {
  let component: LookupsPredefinedTasksFilterComponent;
  let fixture: ComponentFixture<LookupsPredefinedTasksFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LookupsPredefinedTasksFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LookupsPredefinedTasksFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
