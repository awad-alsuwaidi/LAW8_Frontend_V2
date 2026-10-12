import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TmTaskGroupComponent } from './tm-task-group.component';

describe('TmTaskGroupComponent', () => {
  let component: TmTaskGroupComponent;
  let fixture: ComponentFixture<TmTaskGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TmTaskGroupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TmTaskGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
