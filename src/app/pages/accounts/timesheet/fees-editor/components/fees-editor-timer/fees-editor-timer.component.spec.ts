import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeesEditorTimerComponent } from './fees-editor-timer.component';

describe('FeesEditorTimerComponent', () => {
  let component: FeesEditorTimerComponent;
  let fixture: ComponentFixture<FeesEditorTimerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeesEditorTimerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FeesEditorTimerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
