import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetPasswordEditorComponent } from './reset-password-editor.component';

describe('ResetPasswordEditorComponent', () => {
  let component: ResetPasswordEditorComponent;
  let fixture: ComponentFixture<ResetPasswordEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResetPasswordEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResetPasswordEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
