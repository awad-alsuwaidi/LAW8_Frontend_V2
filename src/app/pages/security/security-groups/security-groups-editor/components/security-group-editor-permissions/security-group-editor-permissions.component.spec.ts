import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecurityGroupEditorPermissionsComponent } from './security-group-editor-permissions.component';

describe('SecurityGroupEditorPermissionsComponent', () => {
  let component: SecurityGroupEditorPermissionsComponent;
  let fixture: ComponentFixture<SecurityGroupEditorPermissionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecurityGroupEditorPermissionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SecurityGroupEditorPermissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
