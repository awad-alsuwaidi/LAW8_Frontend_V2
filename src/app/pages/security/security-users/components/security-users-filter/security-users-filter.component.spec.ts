import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecurityUsersFilterComponent } from './security-users-filter.component';

describe('SecurityUsersFilterComponent', () => {
  let component: SecurityUsersFilterComponent;
  let fixture: ComponentFixture<SecurityUsersFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecurityUsersFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SecurityUsersFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
