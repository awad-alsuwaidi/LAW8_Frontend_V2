import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardDurationtimesheetFilterEditorComponent } from './dashboard-durationtimesheet-filter-editor.component';

describe('DashboardDurationtimesheetFilterEditorComponent', () => {
  let component: DashboardDurationtimesheetFilterEditorComponent;
  let fixture: ComponentFixture<DashboardDurationtimesheetFilterEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardDurationtimesheetFilterEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardDurationtimesheetFilterEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
