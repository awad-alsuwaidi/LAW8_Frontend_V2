import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TmTaskFilterEditorComponent } from './tm-task-filter-editor.component';

describe('TmTaskFilterEditorComponent', () => {
  let component: TmTaskFilterEditorComponent;
  let fixture: ComponentFixture<TmTaskFilterEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TmTaskFilterEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TmTaskFilterEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
