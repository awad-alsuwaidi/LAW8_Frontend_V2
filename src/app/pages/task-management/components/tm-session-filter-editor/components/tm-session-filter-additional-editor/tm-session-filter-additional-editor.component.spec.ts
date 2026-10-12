import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TmSessionFilterAdditionalEditorComponent } from './tm-session-filter-additional-editor.component';

describe('TmSessionFilterAdditionalEditorComponent', () => {
  let component: TmSessionFilterAdditionalEditorComponent;
  let fixture: ComponentFixture<TmSessionFilterAdditionalEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TmSessionFilterAdditionalEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TmSessionFilterAdditionalEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
