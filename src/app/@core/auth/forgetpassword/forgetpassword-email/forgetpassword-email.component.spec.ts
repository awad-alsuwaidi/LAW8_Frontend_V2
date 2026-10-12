import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgetpasswordEmailComponent } from './forgetpassword-email.component';

describe('ForgetpasswordEmailComponent', () => {
  let component: ForgetpasswordEmailComponent;
  let fixture: ComponentFixture<ForgetpasswordEmailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForgetpasswordEmailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForgetpasswordEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
