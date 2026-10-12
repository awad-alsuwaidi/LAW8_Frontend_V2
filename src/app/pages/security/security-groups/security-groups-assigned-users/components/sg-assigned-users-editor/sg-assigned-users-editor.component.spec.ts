import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SgAssignedUsersEditorComponent } from './sg-assigned-users-editor.component';

describe('SgAssignedUsersEditorComponent', () => {
  let component: SgAssignedUsersEditorComponent;
  let fixture: ComponentFixture<SgAssignedUsersEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SgAssignedUsersEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SgAssignedUsersEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
