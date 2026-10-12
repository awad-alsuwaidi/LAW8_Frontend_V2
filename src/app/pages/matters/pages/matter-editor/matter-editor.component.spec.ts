import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatterEditorComponent } from './matter-editor.component';

describe('MatterEditorComponent', () => {
  let component: MatterEditorComponent;
  let fixture: ComponentFixture<MatterEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatterEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatterEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
