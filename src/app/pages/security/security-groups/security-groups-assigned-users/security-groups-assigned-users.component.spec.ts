import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecurityGroupsAssignedUsersComponent } from './security-groups-assigned-users.component';

describe('SecurityGroupsAssignedUsersComponent', () => {
  let component: SecurityGroupsAssignedUsersComponent;
  let fixture: ComponentFixture<SecurityGroupsAssignedUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecurityGroupsAssignedUsersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SecurityGroupsAssignedUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
