import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TmSessionFilterEditorComponent } from './tm-session-filter-editor.component';

describe('TmSessionFilterEditorComponent', () => {
  let component: TmSessionFilterEditorComponent;
  let fixture: ComponentFixture<TmSessionFilterEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TmSessionFilterEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TmSessionFilterEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
