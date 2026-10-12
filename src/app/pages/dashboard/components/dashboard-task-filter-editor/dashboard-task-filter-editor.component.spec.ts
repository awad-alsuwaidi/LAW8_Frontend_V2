import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardTaskFilterEditorComponent } from './dashboard-task-filter-editor.component';

describe('DashboardTaskFilterEditorComponent', () => {
  let component: DashboardTaskFilterEditorComponent;
  let fixture: ComponentFixture<DashboardTaskFilterEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardTaskFilterEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardTaskFilterEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
