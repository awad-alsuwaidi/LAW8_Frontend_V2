import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatterApplicantComponent } from './matter-applicant.component';

describe('MatterApplicantComponent', () => {
  let component: MatterApplicantComponent;
  let fixture: ComponentFixture<MatterApplicantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatterApplicantComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatterApplicantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
