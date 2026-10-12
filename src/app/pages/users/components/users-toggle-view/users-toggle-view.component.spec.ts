import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersToggleViewComponent } from './users-toggle-view.component';

describe('UsersToggleViewComponent', () => {
  let component: UsersToggleViewComponent;
  let fixture: ComponentFixture<UsersToggleViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersToggleViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersToggleViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
