import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardDurationFilterEditorComponent } from './dashboard-duration-filter-editor.component';

describe('DashboardDurationFilterEditorComponent', () => {
  let component: DashboardDurationFilterEditorComponent;
  let fixture: ComponentFixture<DashboardDurationFilterEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardDurationFilterEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardDurationFilterEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
