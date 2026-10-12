import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatterApplicantEditorComponent } from './matter-applicant-editor.component';

describe('MatterApplicantEditorComponent', () => {
  let component: MatterApplicantEditorComponent;
  let fixture: ComponentFixture<MatterApplicantEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatterApplicantEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatterApplicantEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
