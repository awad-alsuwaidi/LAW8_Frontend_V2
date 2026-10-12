import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportActivityFilterEditorComponent } from './report-activity-filter-editor.component';

describe('ReportActivityFilterEditorComponent', () => {
  let component: ReportActivityFilterEditorComponent;
  let fixture: ComponentFixture<ReportActivityFilterEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportActivityFilterEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportActivityFilterEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
