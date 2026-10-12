import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportDocumentExpiryTrackerComponent } from './report-document-expiry-tracker.component';

describe('ReportDocumentExpiryTrackerComponent', () => {
  let component: ReportDocumentExpiryTrackerComponent;
  let fixture: ComponentFixture<ReportDocumentExpiryTrackerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportDocumentExpiryTrackerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportDocumentExpiryTrackerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
