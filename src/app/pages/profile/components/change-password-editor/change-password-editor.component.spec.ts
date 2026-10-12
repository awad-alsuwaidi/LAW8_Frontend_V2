import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangePasswordEditorComponent } from './change-password-editor.component';

describe('ChangePasswordEditorComponent', () => {
  let component: ChangePasswordEditorComponent;
  let fixture: ComponentFixture<ChangePasswordEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangePasswordEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChangePasswordEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
