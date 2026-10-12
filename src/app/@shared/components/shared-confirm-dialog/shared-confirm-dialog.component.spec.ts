import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedConfirmDialogComponent } from './shared-confirm-dialog.component';

describe('SharedConfirmDialogComponent', () => {
  let component: SharedConfirmDialogComponent;
  let fixture: ComponentFixture<SharedConfirmDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedConfirmDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SharedConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
