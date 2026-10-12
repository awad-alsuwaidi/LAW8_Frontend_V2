import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LookupsTaskGroupsComponent } from './lookups-task-groups.component';

describe('LookupsTaskGroupsComponent', () => {
  let component: LookupsTaskGroupsComponent;
  let fixture: ComponentFixture<LookupsTaskGroupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LookupsTaskGroupsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LookupsTaskGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
