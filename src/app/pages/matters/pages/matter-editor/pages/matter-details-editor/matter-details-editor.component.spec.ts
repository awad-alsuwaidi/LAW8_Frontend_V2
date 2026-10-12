import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatterDetailsEditorComponent } from './matter-details-editor.component';

describe('MatterDetailsEditorComponent', () => {
  let component: MatterDetailsEditorComponent;
  let fixture: ComponentFixture<MatterDetailsEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatterDetailsEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatterDetailsEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
