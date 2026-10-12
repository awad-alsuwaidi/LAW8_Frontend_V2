import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TmTaskTabEditorComponent } from './tm-task-tab-editor.component';

describe('TmTaskTabEditorComponent', () => {
  let component: TmTaskTabEditorComponent;
  let fixture: ComponentFixture<TmTaskTabEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TmTaskTabEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TmTaskTabEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
