import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersViewCardComponent } from './users-view-card.component';

describe('UsersViewCardComponent', () => {
  let component: UsersViewCardComponent;
  let fixture: ComponentFixture<UsersViewCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersViewCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersViewCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
