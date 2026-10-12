import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserRateTableEditorComponent } from './user-rate-table-editor.component';

describe('UserRateTableEditorComponent', () => {
  let component: UserRateTableEditorComponent;
  let fixture: ComponentFixture<UserRateTableEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserRateTableEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserRateTableEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
