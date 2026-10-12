import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecurityUsersComponent } from './security-users.component';

describe('SecurityUsersComponent', () => {
  let component: SecurityUsersComponent;
  let fixture: ComponentFixture<SecurityUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecurityUsersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SecurityUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
