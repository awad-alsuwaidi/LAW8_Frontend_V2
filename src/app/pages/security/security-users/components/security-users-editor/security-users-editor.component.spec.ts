import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecurityUsersEditorComponent } from './security-users-editor.component';

describe('SecurityUsersEditorComponent', () => {
  let component: SecurityUsersEditorComponent;
  let fixture: ComponentFixture<SecurityUsersEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecurityUsersEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SecurityUsersEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
