import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedContactEditorComponent } from './shared-contact-editor.component';

describe('SharedContactEditorComponent', () => {
  let component: SharedContactEditorComponent;
  let fixture: ComponentFixture<SharedContactEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedContactEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SharedContactEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
