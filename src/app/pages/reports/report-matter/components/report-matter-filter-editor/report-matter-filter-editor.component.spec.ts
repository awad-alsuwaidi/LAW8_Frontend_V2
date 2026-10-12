import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportMatterFilterEditorComponent } from './report-matter-filter-editor.component';

describe('ReportMatterFilterEditorComponent', () => {
  let component: ReportMatterFilterEditorComponent;
  let fixture: ComponentFixture<ReportMatterFilterEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportMatterFilterEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportMatterFilterEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
