import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserRateTableComponent } from './user-rate-table.component';

describe('UserRateTableComponent', () => {
  let component: UserRateTableComponent;
  let fixture: ComponentFixture<UserRateTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserRateTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserRateTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
