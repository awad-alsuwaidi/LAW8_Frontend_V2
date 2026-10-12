import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TmTaskTabFilterEditorComponent } from './tm-task-tab-filter-editor.component';

describe('TmTaskTabFilterEditorComponent', () => {
  let component: TmTaskTabFilterEditorComponent;
  let fixture: ComponentFixture<TmTaskTabFilterEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TmTaskTabFilterEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TmTaskTabFilterEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
