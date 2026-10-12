import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatterTaskGroupComponent } from './matter-task-group.component';

describe('MatterTaskGroupComponent', () => {
  let component: MatterTaskGroupComponent;
  let fixture: ComponentFixture<MatterTaskGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatterTaskGroupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatterTaskGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
