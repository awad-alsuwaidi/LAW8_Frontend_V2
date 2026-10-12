import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgetpasswordOtpComponent } from './forgetpassword-otp.component';

describe('ForgetpasswordOtpComponent', () => {
  let component: ForgetpasswordOtpComponent;
  let fixture: ComponentFixture<ForgetpasswordOtpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForgetpasswordOtpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForgetpasswordOtpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
