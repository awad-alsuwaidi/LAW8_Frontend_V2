import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TmTasksTabComponent } from './tm-tasks-tab.component';

describe('TmTasksTabComponent', () => {
  let component: TmTasksTabComponent;
  let fixture: ComponentFixture<TmTasksTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TmTasksTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TmTasksTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
