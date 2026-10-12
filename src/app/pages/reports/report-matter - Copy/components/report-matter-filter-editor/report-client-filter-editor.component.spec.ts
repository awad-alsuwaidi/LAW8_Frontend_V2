import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportClientFilterEditorComponent } from './report-client-filter-editor.component';

describe('ReportClientFilterEditorComponent', () => {
  let component: ReportClientFilterEditorComponent;
  let fixture: ComponentFixture<ReportClientFilterEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportClientFilterEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportClientFilterEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
