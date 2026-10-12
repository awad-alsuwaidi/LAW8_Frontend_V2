import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersViewListComponent } from './users-view-list.component';

describe('UsersViewListComponent', () => {
  let component: UsersViewListComponent;
  let fixture: ComponentFixture<UsersViewListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersViewListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersViewListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
