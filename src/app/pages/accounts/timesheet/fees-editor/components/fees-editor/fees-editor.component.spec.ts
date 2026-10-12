import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeesEditorComponent } from './fees-editor.component';

describe('FeesEditorComponent', () => {
  let component: FeesEditorComponent;
  let fixture: ComponentFixture<FeesEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeesEditorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FeesEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
