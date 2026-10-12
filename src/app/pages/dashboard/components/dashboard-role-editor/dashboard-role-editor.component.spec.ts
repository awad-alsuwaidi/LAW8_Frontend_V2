import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardRoleEditorComponent } from './dashboard-role-editor.component';

describe('DashboardRoleEditorComponent', () => {
  let component: DashboardRoleEditorComponent;
  let fixture: ComponentFixture<DashboardRoleEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardRoleEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardRoleEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
