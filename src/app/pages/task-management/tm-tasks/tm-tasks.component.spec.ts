import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TmTasksComponent } from './tm-tasks.component';

describe('TmTasksComponent', () => {
  let component: TmTasksComponent;
  let fixture: ComponentFixture<TmTasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TmTasksComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TmTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
