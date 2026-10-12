import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgetpasswordChangePasswordComponent } from './forgetpassword-change-password.component';

describe('ForgetpasswordChangePasswordComponent', () => {
  let component: ForgetpasswordChangePasswordComponent;
  let fixture: ComponentFixture<ForgetpasswordChangePasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForgetpasswordChangePasswordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForgetpasswordChangePasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
