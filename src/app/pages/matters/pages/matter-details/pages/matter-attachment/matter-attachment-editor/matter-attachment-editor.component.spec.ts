import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatterAttachmentEditorComponent } from './matter-attachment-editor.component';

describe('MatterAttachmentEditorComponent', () => {
  let component: MatterAttachmentEditorComponent;
  let fixture: ComponentFixture<MatterAttachmentEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatterAttachmentEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatterAttachmentEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
