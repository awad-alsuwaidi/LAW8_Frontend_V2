import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TmTaskEditorComponent } from './tm-task-editor.component';

describe('TmTaskEditorComponent', () => {
  let component: TmTaskEditorComponent;
  let fixture: ComponentFixture<TmTaskEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TmTaskEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TmTaskEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
