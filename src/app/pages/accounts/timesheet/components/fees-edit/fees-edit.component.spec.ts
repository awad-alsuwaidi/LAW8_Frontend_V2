import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeesEditComponent } from './fees-edit.component';

describe('FeesEditComponent', () => {
  let component: FeesEditComponent;
  let fixture: ComponentFixture<FeesEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeesEditComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FeesEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
