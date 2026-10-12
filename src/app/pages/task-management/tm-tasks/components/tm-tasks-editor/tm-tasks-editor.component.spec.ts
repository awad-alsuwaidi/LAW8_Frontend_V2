import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TmTasksEditorComponent } from './tm-tasks-editor.component';

describe('TmTasksEditorComponent', () => {
  let component: TmTasksEditorComponent;
  let fixture: ComponentFixture<TmTasksEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TmTasksEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TmTasksEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
